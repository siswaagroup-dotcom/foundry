import crypto from "crypto";
import type { PoolClient } from "pg";

import { db } from "@/lib/db";
import { createNotification } from "@/services/notification.server";
import type {
  CreateSocialMediaInput,
  CreateSocialPostInput,
  SaveSocialIntegrationInput,
  SocialAccount,
  SocialActivityLog,
  SocialAnalytics,
  SocialDashboard,
  SocialIntegration,
  SocialMediaAsset,
  SocialPlatform,
  SocialPost,
  SocialPostAccount,
  SocialPostMedia,
  SocialPublishLog,
  UpdateSocialPostInput,
} from "@/types/social";

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number; code?: string };

const PLATFORMS: SocialPlatform[] = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "youtube",
];

function secretKey(): Buffer {
  const source =
    process.env.SOCIAL_CREDENTIAL_SECRET ??
    process.env.JWT_REFRESH_SECRET ??
    process.env.JWT_ACCESS_SECRET;

  if (!source) {
    throw new Error("SOCIAL_CREDENTIAL_SECRET or JWT secret is required.");
  }

  return crypto.createHash("sha256").update(source).digest();
}

function encryptJson(value: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function decryptJson<T>(value: string | null): T | null {
  if (!value) return null;
  const [iv, tag, encrypted] = value
    .split(".")
    .map((part) => Buffer.from(part, "base64url"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8")) as T;
}

function maskKeys(keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, "******"]));
}

function normalizeHandle(
  platform: SocialPlatform,
  handle?: string,
  accountName?: string,
) {
  const fallback = accountName?.trim() || `${platform} account`;
  const raw =
    handle?.trim() || fallback.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function inferMediaType(mimeType: string): "image" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

function firstCredential(
  credentials: Record<string, string> | null,
  keys: string[],
): string | null {
  if (!credentials) return null;
  for (const key of keys) {
    const value = credentials[key]?.trim();
    if (value) return value;
  }
  return null;
}

function jsonHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseProviderResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function isWorkspaceOwnerOrAdmin(
  workspaceId: string,
  userId: string,
): Promise<boolean> {

  const { rows } = await db.query(
    `SELECT
        wm.workspace_id,
        wm.user_id,
        wm.status,
        r.name AS role_name
     FROM workspace_members wm
     JOIN roles r
       ON r.id = wm.role_id
     WHERE wm.workspace_id = $1
       AND wm.user_id = $2`,
    [workspaceId, userId],
  );

  return (
    rows[0]?.role_name?.toLowerCase() === "owner" ||
    rows[0]?.role_name?.toLowerCase() === "admin"
  );
}

async function logActivity(
  client: { query: typeof db.query },
  input: {
    workspaceId: string;
    actorId?: string | null;
    postId?: string | null;
    integrationId?: string | null;
    action: string;
    message: string;
    metadata?: unknown;
  },
) {
  await client.query(
    `INSERT INTO social_activity_logs
       (workspace_id, actor_id, post_id, integration_id, action, message, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.workspaceId,
      input.actorId ?? null,
      input.postId ?? null,
      input.integrationId ?? null,
      input.action,
      input.message,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ],
  );
}

type IntegrationRow = {
  id: string;
  workspace_id: string;
  platform: SocialPlatform;
  connection_type: "oauth" | "manual";
  display_name: string;
  connection_name: string | null;
  status: SocialIntegration["status"];
  credentials_encrypted: string | null;
  credential_keys: string[] | null;
  scopes: string[] | null;
  permissions: string[] | null;
  external_account_id: string | null;
  page_id: string | null;
  channel_id: string | null;
  organization_id: string | null;
  account_name: string | null;
  avatar_url: string | null;
  expires_at: string | null;
  last_validated_at: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

function toIntegration(row: IntegrationRow): SocialIntegration {
  const keys = row.credential_keys ?? [];
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    platform: row.platform,
    connectionType: row.connection_type,
    displayName: row.display_name,
    connectionName: row.connection_name ?? row.display_name,
    status: row.status,
    credentialKeys: keys,
    maskedCredentials: maskKeys(keys),
    scopes: row.scopes ?? [],
    permissions: row.permissions ?? [],
    externalAccountId: row.external_account_id,
    pageId: row.page_id,
    channelId: row.channel_id,
    organizationId: row.organization_id,
    accountName: row.account_name,
    avatarUrl: row.avatar_url,
    expiresAt: row.expires_at,
    lastValidatedAt: row.last_validated_at,
    lastSyncAt: row.last_sync_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type AccountRow = {
  id: string;
  workspace_id: string;
  integration_id: string | null;
  platform: SocialPlatform;
  account_name: string;
  handle: string;
  platform_user_id: string | null;
  status: SocialAccount["status"];
  profile_url: string | null;
  avatar_url: string | null;
  followers_count: number | null;
  posts_count: number | null;
  connected_at: string | null;
  token_expires_at: string | null;
};

function toAccount(row: AccountRow): SocialAccount {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    integrationId: row.integration_id,
    platform: row.platform,
    accountName: row.account_name,
    handle: row.handle,
    platformUserId: row.platform_user_id,
    status: row.status,
    profileUrl: row.profile_url,
    avatarUrl: row.avatar_url,
    followersCount: row.followers_count,
    postsCount: row.posts_count,
    connectedAt: row.connected_at,
    tokenExpiresAt: row.token_expires_at,
  };
}

type PostRow = {
  id: string;
  workspace_id: string;
  title: string | null;
  caption: string;
  content: string;
  status: SocialPost["status"];
  platform: SocialPost["platform"];
  scheduled_at: string | null;
  published_at: string | null;
  campaign: string | null;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  hashtags: string[] | null;
  mentions: string[] | null;
  link_url: string | null;
  link_title: string | null;
  link_description: string | null;
  link_image_url: string | null;
  clicks_count: number;
  impressions_count: number;
  reach_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
};

type PostAccountRow = {
  id: string;
  post_id: string;
  social_account_id: string;
  platform: SocialPlatform;
  account_name: string;
  handle: string;
  status: SocialPostAccount["status"];
  platform_post_id: string | null;
  live_url: string | null;
  error_message: string | null;
  published_at: string | null;
};

type MediaRow = {
  id: string;
  post_id: string;
  workspace_id: string;
  file_url: string;
  mime_type: string;
  file_size_bytes: string | null;
  sort_order: number;
  uploaded_at: string;
};

type PublishLogRow = {
  id: string;
  post_id: string;
  social_account_id: string | null;
  platform: SocialPlatform;
  status: SocialPublishLog["status"];
  message: string | null;
  request_url: string | null;
  request_payload: unknown;
  response_payload: unknown;
  http_status: number | null;
  duration_ms: number | null;
  created_at: string;
};

function toPost(
  row: PostRow,
  accounts: SocialPostAccount[],
  media: SocialPostMedia[],
  logs: SocialPublishLog[],
): SocialPost {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    caption: row.caption,
    content: row.content,
    status: row.status,
    platform: row.platform,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    campaign: row.campaign,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hashtags: row.hashtags ?? [],
    mentions: row.mentions ?? [],
    linkUrl: row.link_url,
    linkTitle: row.link_title,
    linkDescription: row.link_description,
    linkImageUrl: row.link_image_url,
    clicksCount: row.clicks_count,
    impressionsCount: row.impressions_count,
    reachCount: row.reach_count,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    sharesCount: row.shares_count,
    accounts,
    media,
    logs,
  };
}

async function hydratePosts(rows: PostRow[]): Promise<SocialPost[]> {
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const [accountRows, mediaRows, logRows] = await Promise.all([
    db.query<PostAccountRow>(
      `SELECT spa.id, spa.post_id, spa.social_account_id, spa.platform,
              sa.account_name, sa.handle, spa.status, spa.platform_post_id,
              spa.live_url, spa.error_message, spa.published_at
       FROM social_post_accounts spa
       JOIN social_accounts sa ON sa.id = spa.social_account_id
       WHERE spa.post_id = ANY($1)
       ORDER BY spa.created_at ASC`,
      [ids],
    ),
    db.query<MediaRow>(
      `SELECT id, post_id, workspace_id, file_url, mime_type, file_size_bytes, sort_order, uploaded_at
       FROM social_post_media
       WHERE post_id = ANY($1)
       ORDER BY sort_order ASC`,
      [ids],
    ),
    db.query<PublishLogRow>(
      `SELECT id, post_id, social_account_id, platform, status, message,
              request_url, request_payload, response_payload, http_status,
              duration_ms, created_at
       FROM social_publish_logs
       WHERE post_id = ANY($1)
       ORDER BY created_at DESC`,
      [ids],
    ),
  ]);

  const accounts = new Map<string, SocialPostAccount[]>();
  accountRows.rows.forEach((row) => {
    const list = accounts.get(row.post_id) ?? [];
    list.push({
      id: row.id,
      postId: row.post_id,
      socialAccountId: row.social_account_id,
      platform: row.platform,
      accountName: row.account_name,
      handle: row.handle,
      status: row.status,
      platformPostId: row.platform_post_id,
      liveUrl: row.live_url,
      errorMessage: row.error_message,
      publishedAt: row.published_at,
    });
    accounts.set(row.post_id, list);
  });

  const media = new Map<string, SocialPostMedia[]>();
  mediaRows.rows.forEach((row) => {
    const list = media.get(row.post_id) ?? [];
    list.push({
      id: row.id,
      postId: row.post_id,
      workspaceId: row.workspace_id,
      fileUrl: row.file_url,
      mimeType: row.mime_type,
      fileSizeBytes:
        row.file_size_bytes === null ? null : Number(row.file_size_bytes),
      sortOrder: row.sort_order,
      uploadedAt: row.uploaded_at,
    });
    media.set(row.post_id, list);
  });

  const logs = new Map<string, SocialPublishLog[]>();
  logRows.rows.forEach((row) => {
    const list = logs.get(row.post_id) ?? [];
    list.push({
      id: row.id,
      postId: row.post_id,
      socialAccountId: row.social_account_id,
      platform: row.platform,
      status: row.status,
      message: row.message,
      requestUrl: row.request_url,
      requestPayload: row.request_payload,
      responsePayload: row.response_payload,
      httpStatus: row.http_status,
      durationMs: row.duration_ms,
      createdAt: row.created_at,
    });
    logs.set(row.post_id, list);
  });

  return rows.map((row) =>
    toPost(
      row,
      accounts.get(row.id) ?? [],
      media.get(row.id) ?? [],
      logs.get(row.id) ?? [],
    ),
  );
}

async function getPostRows(
  workspaceId: string,
  postId?: string,
): Promise<PostRow[]> {
  const params: unknown[] = [workspaceId];
  const idClause = postId ? " AND sp.id = $2" : "";
  if (postId) params.push(postId);

  const { rows } = await db.query<PostRow>(
    `SELECT sp.id, sp.workspace_id, sp.title, sp.caption, sp.content, sp.status, sp.platform,
            sp.scheduled_at, sp.published_at, sp.campaign, sp.created_by, u.name AS created_by_name,
            sp.created_at, sp.updated_at, sp.hashtags, sp.mentions, sp.link_url, sp.link_title,
            sp.link_description, sp.link_image_url, sp.clicks_count, sp.impressions_count,
            sp.reach_count, sp.likes_count, sp.comments_count, sp.shares_count
     FROM social_posts sp
     JOIN users u ON u.id = sp.created_by
     WHERE sp.workspace_id = $1 AND sp.deleted_at IS NULL${idClause}
     ORDER BY COALESCE(sp.scheduled_at, sp.published_at, sp.created_at) DESC`,
    params,
  );
  return rows;
}

async function fetchAccounts(workspaceId: string): Promise<SocialAccount[]> {
  const { rows } = await db.query<AccountRow>(
    `SELECT id, workspace_id, integration_id, platform, account_name, handle,
            platform_user_id, status, profile_url, avatar_url, followers_count,
            posts_count, connected_at, token_expires_at
     FROM social_accounts
     WHERE workspace_id = $1 AND deleted_at IS NULL
     ORDER BY platform ASC, account_name ASC`,
    [workspaceId],
  );
  return rows.map(toAccount);
}

async function fetchIntegrations(
  workspaceId: string,
): Promise<SocialIntegration[]> {
  const { rows } = await db.query<IntegrationRow>(
    `SELECT id, workspace_id, platform, connection_type, display_name, status,
            connection_name, credentials_encrypted, credential_keys, scopes,
            permissions, external_account_id, page_id, channel_id, organization_id,
            account_name, avatar_url, expires_at, last_validated_at, last_sync_at,
            created_at, updated_at
     FROM social_integrations
     WHERE workspace_id = $1 AND deleted_at IS NULL
     ORDER BY platform ASC, created_at DESC`,
    [workspaceId],
  );
  return rows.map(toIntegration);
}

async function fetchMedia(workspaceId: string): Promise<SocialMediaAsset[]> {
  const { rows } = await db.query<{
    id: string;
    workspace_id: string;
    uploaded_by: string;
    uploaded_by_name: string;
    file_name: string;
    file_url: string;
    mime_type: string;
    file_size_bytes: string | null;
    media_type: SocialMediaAsset["mediaType"];
    alt_text: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT sml.id, sml.workspace_id, sml.uploaded_by, u.name AS uploaded_by_name,
            sml.file_name, sml.file_url, sml.mime_type, sml.file_size_bytes,
            sml.media_type, sml.alt_text, sml.tags, sml.created_at, sml.updated_at
     FROM social_media_library sml
     JOIN users u ON u.id = sml.uploaded_by
     WHERE sml.workspace_id = $1 AND sml.deleted_at IS NULL
     ORDER BY sml.created_at DESC`,
    [workspaceId],
  );

  return rows.map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    uploadedBy: row.uploaded_by,
    uploadedByName: row.uploaded_by_name,
    fileName: row.file_name,
    fileUrl: row.file_url,
    mimeType: row.mime_type,
    fileSizeBytes:
      row.file_size_bytes === null ? null : Number(row.file_size_bytes),
    mediaType: row.media_type,
    altText: row.alt_text,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

async function fetchActivity(
  workspaceId: string,
): Promise<SocialActivityLog[]> {
  const { rows } = await db.query<{
    id: string;
    workspace_id: string;
    actor_id: string | null;
    actor_name: string | null;
    post_id: string | null;
    integration_id: string | null;
    action: string;
    message: string;
    created_at: string;
  }>(
    `SELECT sal.id, sal.workspace_id, sal.actor_id, u.name AS actor_name,
            sal.post_id, sal.integration_id, sal.action, sal.message, sal.created_at
     FROM social_activity_logs sal
     LEFT JOIN users u ON u.id = sal.actor_id
     WHERE sal.workspace_id = $1
     ORDER BY sal.created_at DESC
     LIMIT 30`,
    [workspaceId],
  );

  return rows.map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    postId: row.post_id,
    integrationId: row.integration_id,
    action: row.action,
    message: row.message,
    createdAt: row.created_at,
  }));
}

export async function getSocialDashboard(
  workspaceId: string,
): Promise<ServiceResult<SocialDashboard>> {
  try {
    const [accounts, integrations, posts, media, activity] = await Promise.all([
      fetchAccounts(workspaceId),
      fetchIntegrations(workspaceId),
      hydratePosts(await getPostRows(workspaceId)),
      fetchMedia(workspaceId),
      fetchActivity(workspaceId),
    ]);

    const metrics = {
      connectedAccounts: accounts.filter(
        (account) => account.status === "connected",
      ).length,
      scheduledPosts: posts.filter((post) => post.status === "scheduled")
        .length,
      publishedPosts: posts.filter((post) => post.status === "published")
        .length,
      draftPosts: posts.filter((post) => post.status === "draft").length,
      failedPosts: posts.filter((post) => post.status === "failed").length,
      totalReach: posts.reduce((sum, post) => sum + post.reachCount, 0),
      totalEngagement: posts.reduce(
        (sum, post) =>
          sum + post.likesCount + post.commentsCount + post.sharesCount,
        0,
      ),
    };

    const platformSummary = PLATFORMS.map((platform) => {
      const platformPosts = posts.filter((post) =>
        post.accounts.some((account) => account.platform === platform),
      );
      return {
        platform,
        connectedAccounts: accounts.filter(
          (account) =>
            account.platform === platform && account.status === "connected",
        ).length,
        posts: platformPosts.length,
        published: platformPosts.filter((post) => post.status === "published")
          .length,
        failed: platformPosts.filter((post) => post.status === "failed").length,
        reach: platformPosts.reduce((sum, post) => sum + post.reachCount, 0),
        engagement: platformPosts.reduce(
          (sum, post) =>
            sum + post.likesCount + post.commentsCount + post.sharesCount,
          0,
        ),
      };
    });

    return {
      success: true,
      data: {
        accounts,
        integrations,
        posts,
        media,
        activity,
        metrics,
        platformSummary,
      },
    };
  } catch (error) {
    console.error("[social.dashboard]", error);
    return {
      success: false,
      error: "Failed to load social dashboard",
      status: 500,
    };
  }
}

export async function saveSocialIntegration(
  workspaceId: string,
  userId: string,
  input: SaveSocialIntegrationInput,
): Promise<ServiceResult<SocialIntegration>> {
  if (!(await isWorkspaceOwnerOrAdmin(workspaceId, userId))) {
    return {
      success: false,
      error: "Only workspace owners and admins can manage social integrations.",
      status: 403,
      code: "FORBIDDEN",
    };
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
   const pageId =
  input.pageId?.trim() ||
  firstCredential(input.credentials, [
    "pageId",
    "facebookPageId",
    "page_id",
  ]) ||
  null;

const accessToken = firstCredential(input.credentials, [
  "pageAccessToken",
  "page_access_token",
  "accessToken",
  "access_token",
  "userAccessToken",
  "user_access_token",
  "token",
  "bearerToken",
  "bearer_token",
]);

const normalizedCredentials: Record<string, string> = {
  ...input.credentials,

  pageId: pageId ?? "",

  pageAccessToken: accessToken ?? "",

  graphApiVersion:
    firstCredential(input.credentials, [
      "graphApiVersion",
      "graphVersion",
    ]) ?? "v19.0",

  appId:
    firstCredential(input.credentials, [
      "appId",
      "facebookAppId",
      "clientId",
    ]) ?? "",

  appSecret:
    firstCredential(input.credentials, [
      "appSecret",
      "facebookAppSecret",
      "clientSecret",
    ]) ?? "",
};

const credentialKeys = Object.keys(normalizedCredentials).filter(
  (key) => normalizedCredentials[key]?.toString().trim(),
);

const credentialsEncrypted =
  credentialKeys.length > 0
    ? encryptJson(normalizedCredentials)
    : null;
    const connectionName =
      input.connectionName?.trim() || input.displayName.trim();
   const clientId = firstCredential(input.credentials, [
  "appId",
  "facebookAppId",
  "clientId",
  "client_id",
  "googleClientId",
  "linkedinClientId",
  "twitterClientId",
  "youtubeClientId",
  "apiKey",
]);
    const apiKey = firstCredential(input.credentials, ["apiKey", "api_key"]);
    const clientSecret = firstCredential(input.credentials, [
  "appSecret",
  "facebookAppSecret",
  "clientSecret",
  "client_secret",
  "googleClientSecret",
  "linkedinClientSecret",
  "twitterClientSecret",
  "youtubeClientSecret",
  "apiSecret",
]);
    const apiSecret = firstCredential(input.credentials, [
      "apiSecret",
      "api_secret",
    ]);
    
    const refreshToken = firstCredential(input.credentials, [
      "refreshToken",
      "refresh_token",
    ]);

    const { rows } = await client.query<IntegrationRow>(
      `INSERT INTO social_integrations
         (workspace_id, platform, connection_type, display_name, connection_name, status,
          credentials_encrypted, credential_keys, scopes, permissions, external_account_id,
          page_id, channel_id, organization_id, account_name, avatar_url, client_id, api_key,
          client_secret_encrypted, api_secret_encrypted, access_token_encrypted,
          refresh_token_encrypted, expires_at, last_validated_at, created_by)
       VALUES ($1, $2, $3, $4, $5, 'connected', $6, $7, $8, $9, $10, $11, $12, $13,
               $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), $23)
       RETURNING id, workspace_id, platform, connection_type, display_name, status,
                 connection_name, credentials_encrypted, credential_keys, scopes, permissions,
                 external_account_id, page_id, channel_id, organization_id, account_name,
                 avatar_url, expires_at, last_validated_at, last_sync_at, created_at, updated_at`,
      [
        workspaceId,
        input.platform,
        input.connectionType,
        input.displayName.trim(),
        connectionName,
        credentialsEncrypted,
        credentialKeys,
        input.scopes ?? [],
        input.permissions ?? [],
        input.externalAccountId?.trim() || null,
        input.pageId?.trim() || null,
        input.channelId?.trim() || null,
        input.organizationId?.trim() || null,
        input.accountName?.trim() || connectionName,
        input.avatarUrl?.trim() || null,
        clientId,
        apiKey,
        clientSecret ? encryptJson(clientSecret) : null,
        apiSecret ? encryptJson(apiSecret) : null,
        accessToken ? encryptJson(accessToken) : null,
        refreshToken ? encryptJson(refreshToken) : null,
        input.expiresAt ?? null,
        userId,
      ],
    );

    const integration = rows[0];
    const accountName = input.accountName?.trim() || integration.display_name;
    const handle = normalizeHandle(input.platform, input.handle, accountName);

    await client.query(
      `INSERT INTO social_accounts
         (workspace_id, integration_id, platform, account_name, handle, platform_user_id,
          access_token_encrypted, token_expires_at, status, connected_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'connected', NOW(), NOW())
       ON CONFLICT (workspace_id, platform, handle)
       DO UPDATE SET
         integration_id = EXCLUDED.integration_id,
         account_name = EXCLUDED.account_name,
         platform_user_id = EXCLUDED.platform_user_id,
         access_token_encrypted = EXCLUDED.access_token_encrypted,
         token_expires_at = EXCLUDED.token_expires_at,
         status = 'connected',
         disconnected_at = NULL,
         deleted_at = NULL,
         updated_at = NOW()`,
      [
        workspaceId,
        integration.id,
        input.platform,
        accountName,
        handle,
        input.platformUserId?.trim() || input.externalAccountId?.trim() || null,
        accessToken ? encryptJson(accessToken) : credentialsEncrypted,
        input.expiresAt ?? null,
      ],
    );

    await logActivity(client, {
      workspaceId,
      actorId: userId,
      integrationId: integration.id,
      action: "integration_saved",
      message: `${integration.display_name} connected for ${integration.platform}.`,
    });
    await client.query("COMMIT");

    return { success: true, data: toIntegration(integration) };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("[social.integration.save]", error);
    return { success: false, error: "Failed to save integration", status: 500 };
  } finally {
    client.release();
  }
}

export async function getSocialIntegrationCredentials(
  integrationId: string,
  workspaceId: string,
): Promise<ServiceResult<Record<string, string>>> {
  try {
    const { rows } = await db.query<{
      credentials_encrypted: string | null;
      credential_keys: string[] | null;
    }>(
      `SELECT credentials_encrypted, credential_keys
       FROM social_integrations
       WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
       LIMIT 1`,
      [integrationId, workspaceId],
    );

    if (!rows[0]) {
      return { success: false, error: "Integration not found", status: 404, code: "NOT_FOUND" };
    }

    const decrypted = decryptJson<Record<string, string>>(
      rows[0].credentials_encrypted ?? null,
    );

    const keys = rows[0].credential_keys ?? [];
    const result: Record<string, string> = {};
    for (const key of keys) {
      result[key] = decrypted?.[key] ?? "";
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch credentials",
      status: 500,
      code: "CREDENTIALS_FETCH_FAILED",
    };
  }
}

export async function testSocialIntegration(
  workspaceId: string,
  userId: string,
  integrationId: string,
): Promise<ServiceResult<SocialIntegration>> {
  if (!(await isWorkspaceOwnerOrAdmin(workspaceId, userId))) {
    return {
      success: false,
      error: "Only owners and admins can test integrations.",
      status: 403,
    };
  }

  try {
    const { rows: credentialRows } = await db.query<{
      credentials_encrypted: string | null;
    }>(
      `SELECT credentials_encrypted
       FROM social_integrations
       WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL`,
      [integrationId, workspaceId],
    );
    const credentials = decryptJson<Record<string, string>>(
      credentialRows[0]?.credentials_encrypted ?? null,
    );
    const valid = Boolean(
      credentials && Object.values(credentials).some((value) => value.trim()),
    );
    const status = valid ? "connected" : "invalid_credentials";

    const { rows } = await db.query<IntegrationRow>(
      `UPDATE social_integrations
       SET status = $3, last_validated_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
       RETURNING id, workspace_id, platform, connection_type, display_name, status,
                 connection_name, credentials_encrypted, credential_keys, scopes, permissions,
                 external_account_id, page_id, channel_id, organization_id, account_name,
                 avatar_url, expires_at, last_validated_at, last_sync_at, created_at, updated_at`,
      [integrationId, workspaceId, status],
    );

    if (!rows[0]) {
      return { success: false, error: "Integration not found", status: 404 };
    }

    await db.query(
      "UPDATE social_accounts SET status = $3, updated_at = NOW() WHERE integration_id = $1 AND workspace_id = $2",
      [integrationId, workspaceId, status],
    );

    await logActivity(db, {
      workspaceId,
      actorId: userId,
      integrationId,
      action: "integration_tested",
      message: valid
        ? "Integration credentials validated."
        : "Integration credentials are missing or invalid.",
    });

    return { success: true, data: toIntegration(rows[0]) };
  } catch (error) {
    console.error("[social.integration.test]", error);
    return { success: false, error: "Failed to test integration", status: 500 };
  }
}

export async function refreshSocialIntegration(
  workspaceId: string,
  userId: string,
  integrationId: string,
): Promise<ServiceResult<SocialIntegration>> {
  const tested = await testSocialIntegration(
    workspaceId,
    userId,
    integrationId,
  );
  if (!tested.success) return tested;

  await db.query(
    `UPDATE social_integrations
     SET status = 'syncing', last_sync_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND workspace_id = $2`,
    [integrationId, workspaceId],
  );
  await db.query(
    `UPDATE social_integrations
     SET status = 'connected', updated_at = NOW()
     WHERE id = $1 AND workspace_id = $2`,
    [integrationId, workspaceId],
  );

  const refreshed = await fetchIntegrations(workspaceId);
  const integration = refreshed.find((item) => item.id === integrationId);
  if (!integration)
    return { success: false, error: "Integration not found", status: 404 };
  return { success: true, data: integration };
}

export async function disconnectSocialIntegration(
  workspaceId: string,
  userId: string,
  integrationId: string,
): Promise<ServiceResult<{ id: string }>> {
  if (!(await isWorkspaceOwnerOrAdmin(workspaceId, userId))) {
    return {
      success: false,
      error: "Only owners and admins can disconnect integrations.",
      status: 403,
    };
  }

  try {
    await db.query(
      `UPDATE social_integrations
       SET status = 'disconnected', updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL`,
      [integrationId, workspaceId],
    );
    await db.query(
      `UPDATE social_accounts
       SET status = 'disconnected', disconnected_at = NOW(), updated_at = NOW()
       WHERE integration_id = $1 AND workspace_id = $2`,
      [integrationId, workspaceId],
    );
    await logActivity(db, {
      workspaceId,
      actorId: userId,
      integrationId,
      action: "integration_disconnected",
      message: "Social integration disconnected.",
    });
    return { success: true, data: { id: integrationId } };
  } catch (error) {
    console.error("[social.integration.disconnect]", error);
    return {
      success: false,
      error: "Failed to disconnect integration",
      status: 500,
    };
  }
}

export async function deleteSocialIntegration(
  workspaceId: string,
  userId: string,
  integrationId: string,
): Promise<ServiceResult<{ id: string }>> {
  if (!(await isWorkspaceOwnerOrAdmin(workspaceId, userId))) {
    return {
      success: false,
      error: "Only owners and admins can delete integrations.",
      status: 403,
    };
  }

  try {
    await db.query(
      `UPDATE social_integrations
       SET deleted_at = NOW(), credentials_encrypted = NULL, credential_keys = '{}', updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`,
      [integrationId, workspaceId],
    );
    await db.query(
      `UPDATE social_accounts
       SET deleted_at = NOW(), status = 'disconnected', access_token_encrypted = NULL, updated_at = NOW()
       WHERE integration_id = $1 AND workspace_id = $2`,
      [integrationId, workspaceId],
    );
    await logActivity(db, {
      workspaceId,
      actorId: userId,
      integrationId,
      action: "integration_deleted",
      message: "Social integration credentials deleted.",
    });
    return { success: true, data: { id: integrationId } };
  } catch (error) {
    console.error("[social.integration.delete]", error);
    return {
      success: false,
      error: "Failed to delete integration",
      status: 500,
    };
  }
}

async function replacePostAccounts(
  client: PoolClient,
  workspaceId: string,
  postId: string,
  accountIds: string[],
) {
  await client.query("DELETE FROM social_post_accounts WHERE post_id = $1", [
    postId,
  ]);

  if (!accountIds.length) return;

  const { rows } = await client.query<{ id: string; platform: SocialPlatform }>(
    `SELECT id, platform
     FROM social_accounts
     WHERE workspace_id = $1 AND id = ANY($2) AND deleted_at IS NULL`,
    [workspaceId, accountIds],
  );

  for (const account of rows) {
    await client.query(
      `INSERT INTO social_post_accounts (post_id, social_account_id, platform, status)
       VALUES ($1, $2, $3, 'draft')`,
      [postId, account.id, account.platform],
    );
  }
}

async function replacePostMedia(
  client: PoolClient,
  workspaceId: string,
  postId: string,
  media: CreateSocialPostInput["media"] = [],
) {
  await client.query("DELETE FROM social_post_media WHERE post_id = $1", [
    postId,
  ]);
  for (const [index, item] of media.entries()) {
    await client.query(
      `INSERT INTO social_post_media
         (post_id, workspace_id, file_url, mime_type, file_size_bytes, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        postId,
        workspaceId,
        item.fileUrl,
        item.mimeType,
        item.fileSizeBytes ?? null,
        item.sortOrder ?? index,
      ],
    );
  }
  const inserted = await client.query<MediaRow>(
    `SELECT id, post_id, workspace_id, file_url, mime_type, file_size_bytes, sort_order, uploaded_at
     FROM social_post_media
     WHERE post_id = $1
     ORDER BY sort_order ASC`,
    [postId],
  );
}

export async function createSocialPost(
  workspaceId: string,
  userId: string,
  input: CreateSocialPostInput,
): Promise<ServiceResult<SocialPost>> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const status = input.status ?? (input.scheduledAt ? "scheduled" : "draft");
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO social_posts
         (workspace_id, title, content, caption, status, platform, scheduled_at,
          campaign, hashtags, mentions, link_url, created_by)
       VALUES ($1, $2, $3, $4, $5, 'multi', $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        workspaceId,
        input.title?.trim() || null,
        input.caption.trim(),
        input.caption.trim(),
        status,
        input.scheduledAt ?? null,
        input.campaign?.trim() || null,
        input.hashtags ?? [],
        input.mentions ?? [],
        input.linkUrl?.trim() || null,
        userId,
      ],
    );
    const postId = rows[0].id;
    await replacePostAccounts(client, workspaceId, postId, input.accountIds);
    await replacePostMedia(client, workspaceId, postId, input.media);

    if (status === "scheduled" && input.scheduledAt) {
      await client.query(
        `INSERT INTO social_schedules (post_id, workspace_id, scheduled_at, created_by)
         VALUES ($1, $2, $3, $4)`,
        [postId, workspaceId, input.scheduledAt, userId],
      );
    }

    await logActivity(client, {
      workspaceId,
      actorId: userId,
      postId,
      action: "post_created",
      message:
        status === "scheduled"
          ? "Social post scheduled."
          : "Social post saved as draft.",
    });
    await client.query("COMMIT");

    return getSocialPost(workspaceId, postId);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("[social.post.create]", error);
    return {
      success: false,
      error: "Failed to create social post",
      status: 500,
    };
  } finally {
    client.release();
  }
}

export async function getSocialPosts(
  workspaceId: string,
): Promise<ServiceResult<SocialPost[]>> {
  try {
    return {
      success: true,
      data: await hydratePosts(await getPostRows(workspaceId)),
    };
  } catch (error) {
    console.error("[social.posts]", error);
    return {
      success: false,
      error: "Failed to fetch social posts",
      status: 500,
    };
  }
}

export async function getSocialPost(
  workspaceId: string,
  postId: string,
): Promise<ServiceResult<SocialPost>> {
  try {
    const posts = await hydratePosts(await getPostRows(workspaceId, postId));
    if (!posts[0])
      return { success: false, error: "Social post not found", status: 404 };
    return { success: true, data: posts[0] };
  } catch (error) {
    console.error("[social.post]", error);
    return {
      success: false,
      error: "Failed to fetch social post",
      status: 500,
    };
  }
}

export async function updateSocialPost(
  workspaceId: string,
  userId: string,
  postId: string,
  input: UpdateSocialPostInput,
): Promise<ServiceResult<SocialPost>> {
  const current = await getSocialPost(workspaceId, postId);
  if (!current.success) return current;

  const next = { ...current.data, ...input };
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE social_posts
       SET title = $3, content = $4, caption = $4, status = $5, scheduled_at = $6,
           campaign = $7, hashtags = $8, mentions = $9, link_url = $10, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL`,
      [
        postId,
        workspaceId,
        next.title?.trim() || null,
        next.caption.trim(),
        input.status ?? current.data.status,
        input.scheduledAt ?? current.data.scheduledAt,
        next.campaign?.trim() || null,
        next.hashtags ?? [],
        next.mentions ?? [],
        next.linkUrl?.trim() || null,
      ],
    );
    if (input.accountIds) {
      await replacePostAccounts(client, workspaceId, postId, input.accountIds);
    }
    if (input.media) {
      await replacePostMedia(client, workspaceId, postId, input.media);
    }
    await logActivity(client, {
      workspaceId,
      actorId: userId,
      postId,
      action: "post_updated",
      message: "Social post updated.",
    });
    await client.query("COMMIT");
    return getSocialPost(workspaceId, postId);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("[social.post.update]", error);
    return {
      success: false,
      error: "Failed to update social post",
      status: 500,
    };
  } finally {
    client.release();
  }
}

export async function deleteSocialPost(
  workspaceId: string,
  userId: string,
  postId: string,
): Promise<ServiceResult<{ id: string }>> {
  try {
    await db.query(
      `UPDATE social_posts SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`,
      [postId, workspaceId],
    );
    await logActivity(db, {
      workspaceId,
      actorId: userId,
      postId,
      action: "post_deleted",
      message: "Social post deleted.",
    });
    return { success: true, data: { id: postId } };
  } catch (error) {
    console.error("[social.post.delete]", error);
    return {
      success: false,
      error: "Failed to delete social post",
      status: 500,
    };
  }
}

export async function duplicateSocialPost(
  workspaceId: string,
  userId: string,
  postId: string,
): Promise<ServiceResult<SocialPost>> {
  const post = await getSocialPost(workspaceId, postId);
  if (!post.success) return post;
  return createSocialPost(workspaceId, userId, {
    title: post.data.title ? `${post.data.title} copy` : undefined,
    caption: post.data.caption,
    accountIds: post.data.accounts.map((account) => account.socialAccountId),
    status: "draft",
    campaign: post.data.campaign ?? undefined,
    hashtags: post.data.hashtags,
    mentions: post.data.mentions,
    linkUrl: post.data.linkUrl ?? undefined,
    media: post.data.media.map((item) => ({
      fileUrl: item.fileUrl,
      mimeType: item.mimeType,
      fileSizeBytes: item.fileSizeBytes ?? undefined,
      sortOrder: item.sortOrder,
    })),
  });
}

type PublishProviderResult =
  | {
      ok: true;
      platformPostId: string;
      liveUrl: string | null;
      requestUrl: string | null;
      requestPayload: unknown;
      responsePayload: unknown;
      httpStatus: number | null;
      durationMs: number;
    }
  | {
      ok: false;
      error: string;
      requestUrl: string | null;
      requestPayload: unknown;
      responsePayload: unknown;
      httpStatus: number | null;
      durationMs: number;
    };

type PublishProviderContext = {
  integrationPageId?: string | null;
  accountPlatformUserId?: string | null;
  permissions?: string[] | null;
  scopes?: string[] | null;
};

type ProviderRequestResult = {
  url: string;
  requestPayload: unknown;
  responsePayload: unknown;
  status: number | null;
  durationMs: number;
};

const FACEBOOK_GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION ?? "v19.0";
const FACEBOOK_REQUEST_TIMEOUT_MS = 30_000;
const FACEBOOK_REQUIRED_PERMISSIONS = [
  "pages_manage_posts",
  "pages_read_engagement",
  "pages_show_list",
];
const PROVIDER_ACCESS_TOKEN_KEYS = [
  "pageAccessToken",
  "page_access_token",
  "accessToken",
  "access_token",
  "userAccessToken",
  "user_access_token",
  "bearerToken",
  "bearer_token",
  "token",
];

function maskProviderRequestPayload(payload: Record<string, unknown>) {
  return {
    ...payload,
    ...(typeof payload.access_token === "string"
      ? { access_token: "******" }
      : {}),
  };
}

function maskCredentials(credentials: Record<string, string> | null) {
  if (!credentials) return null;
  return Object.fromEntries(
    Object.entries(credentials).map(([key, value]) => [
      key,
      value.trim() ? "******" : "",
    ]),
  );
}

function providerErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const details = error as {
        message?: unknown;
        type?: unknown;
        code?: unknown;
        error_subcode?: unknown;
      };
      const message =
        typeof details.message === "string" ? details.message : fallback;
      const meta = [
        typeof details.type === "string" ? details.type : null,
        typeof details.code === "number" || typeof details.code === "string"
          ? `code ${details.code}`
          : null,
        typeof details.error_subcode === "number" ||
        typeof details.error_subcode === "string"
          ? `subcode ${details.error_subcode}`
          : null,
      ].filter(Boolean);
      return meta.length ? `${message} (${meta.join(", ")}).` : message;
    }
  }
  if (payload && typeof payload === "object" && "raw" in payload) {
    const raw = (payload as { raw?: unknown }).raw;
    if (typeof raw === "string" && raw.trim()) return raw;
  }
  return fallback;
}

function providerFailure(
  error: string,
  details: Partial<ProviderRequestResult> = {},
): PublishProviderResult {
  return {
    ok: false,
    error,
    requestUrl: details.url ?? null,
    requestPayload: details.requestPayload ?? null,
    responsePayload: details.responsePayload ?? null,
    httpStatus: details.status ?? null,
    durationMs: details.durationMs ?? 0,
  };
}

function buildFacebookLiveUrl(platformPostId: string) {
  const [pageId, postId] = platformPostId.split("_");
  if (pageId && postId)
    return `https://www.facebook.com/${pageId}/posts/${postId}`;
  return `https://www.facebook.com/${platformPostId}`;
}

function validatePublicMediaUrl(fileUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    return "Media file URL is not a valid absolute URL.";
  }

  if (parsed.protocol !== "https:") {
    return "Media file URL must be HTTPS for Facebook to fetch it.";
  }
  if (
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname.endsWith(".local")
  ) {
    return "Media file URL must be publicly accessible; localhost URLs cannot be fetched by Facebook.";
  }

  return null;
}

async function graphPost(
  url: string,
  payload: Record<string, unknown>,
): Promise<ProviderRequestResult> {
  const requestPayload = maskProviderRequestPayload(payload);
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    FACEBOOK_REQUEST_TIMEOUT_MS,
  );
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const responsePayload = await parseProviderResponse(response);
    const durationMs = Date.now() - startedAt;
    return {
      url,
      requestPayload,
      responsePayload,
      status: response.status,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const responsePayload = {
      error: error instanceof Error ? error.message : String(error),
    };
    console.error("Facebook Error", { ...responsePayload, durationMs });
    return { url, requestPayload, responsePayload, status: null, durationMs };
  } finally {
    clearTimeout(timeout);
  }
}

async function graphGet(url: string): Promise<ProviderRequestResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    FACEBOOK_REQUEST_TIMEOUT_MS,
  );
  const safeUrl = url.replace(/access_token=[^&]+/, "access_token=******");
  try {
    const response = await fetch(url, { signal: controller.signal });
    const responsePayload = await parseProviderResponse(response);
    const durationMs = Date.now() - startedAt;
    return {
      url: safeUrl,
      requestPayload: null,
      responsePayload,
      status: response.status,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const responsePayload = {
      error: error instanceof Error ? error.message : String(error),
    };
    console.error("Facebook Error", { ...responsePayload, durationMs });
    return {
      url: safeUrl,
      requestPayload: null,
      responsePayload,
      status: null,
      durationMs,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyFacebookCredentials(
  pageId: string,
  accessToken: string,
  context: PublishProviderContext,
): Promise<PublishProviderResult | null> {

  const savedPermissions = new Set([
    ...(context.permissions ?? []),
    ...(context.scopes ?? []),
  ]);

  const missingSavedPermission = FACEBOOK_REQUIRED_PERMISSIONS.find(
    permission =>
      savedPermissions.size > 0 &&
      !savedPermissions.has(permission),
  );

  if (missingSavedPermission) {
    return providerFailure(
      `Missing ${missingSavedPermission} permission.`,
    );
  }

  const pageUrl =
    `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/${pageId}` +
    `?fields=id,name&access_token=${encodeURIComponent(accessToken)}`;

  const pageCheck = await graphGet(pageUrl);

  if (pageCheck.status !== 200) {
    return providerFailure(
      providerErrorMessage(
        pageCheck.responsePayload,
        "Invalid Facebook Page.",
      ),
      pageCheck,
    );
  }

  // Page exists.
  // Page Access Token is valid.
  // Continue publishing.

  return null;
}
async function publishToProvider(
  platform: SocialPlatform,
  credentials: Record<string, string> | null,
  post: SocialPost,
  account: SocialPostAccount,
  context: PublishProviderContext = {},
): Promise<PublishProviderResult> {

  const accessToken = firstCredential(credentials, PROVIDER_ACCESS_TOKEN_KEYS);

  if (!accessToken) {
    return providerFailure(
      "Missing Facebook Page Access Token."
    );
  }

  if (platform === "facebook") {

    const pageId =
      firstCredential(credentials, [
        "pageId",
        "page_id",
        "facebookPageId",
        "facebook_page_id",
      ]) ??
      context.integrationPageId ??
      context.accountPlatformUserId;

    if (!pageId) {
      return providerFailure("Facebook Page ID is required.");
    }

    const validationFailure = await verifyFacebookCredentials(
      pageId,
      accessToken,
      context,
    );

    if (validationFailure) {
      return validationFailure;
    }

    const media = post.media[0];

    const isPhoto = media?.mimeType.startsWith("image/");
    const isVideo = media?.mimeType.startsWith("video/");

    const edge = isVideo ? "videos" : isPhoto ? "photos" : "feed";

    if (media) {
      const mediaUrlError = validatePublicMediaUrl(media.fileUrl);
      if (mediaUrlError) {
        return providerFailure(mediaUrlError, {
          responsePayload: {
            fileUrl: media.fileUrl,
            mimeType: media.mimeType,
            manualCheck: "Open this URL in a private browser window before retrying.",
          },
        });
      }
    }

    const url = `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/${pageId}/${edge}`;

    const body = isVideo
      ? {
          file_url: media.fileUrl,
          description: post.caption,
          access_token: accessToken,
        }
      : isPhoto
      ? {
          url: media.fileUrl,
          caption: post.caption,
          access_token: accessToken,
        }
      : {
          message: post.caption,
          access_token: accessToken,
        };

    const result = await graphPost(url, body);

    if (result.status !== 200 && result.status !== 201) {
      return providerFailure(
        providerErrorMessage(
          result.responsePayload,
          "Facebook API rejected the request.",
        ),
        result,
      );
    }

    const id =
      typeof result.responsePayload === "object" &&
      result.responsePayload &&
      "id" in result.responsePayload
        ? String((result.responsePayload as any).id)
        : "";

    if (!id) {
      return providerFailure(
        "Facebook API accepted the request but did not return a post ID.",
        result,
      );
    }

    return {
      ok: true,
      platformPostId: id,
      liveUrl: buildFacebookLiveUrl(id),
      requestUrl: result.url,
      requestPayload: result.requestPayload,
      responsePayload: result.responsePayload,
      httpStatus: result.status,
      durationMs: result.durationMs,
    };
  }

  if (platform === "instagram") {
    const businessId = firstCredential(credentials, [
      "instagramBusinessAccountId",
      "instagram_business_account_id",
      "businessAccountId",
    ]);
    const mediaUrl = post.media[0]?.fileUrl;
    if (!businessId)
      return providerFailure("Instagram Business Account ID is required.");
    if (!mediaUrl)
      return providerFailure(
        "Instagram publishing requires at least one public image or video URL.",
      );
    const createResponse = await fetch(
      `https://graph.facebook.com/v19.0/${businessId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: mediaUrl,
          caption: post.caption,
          access_token: accessToken,
        }),
      },
    );
    const createPayload = await parseProviderResponse(createResponse);
    if (!createResponse.ok)
      return providerFailure(
        `Instagram container creation returned ${createResponse.status}.`,
        {
          responsePayload: createPayload,
          status: createResponse.status,
        },
      );
    const creationId =
      typeof createPayload === "object" &&
      createPayload &&
      "id" in createPayload
        ? String(createPayload.id)
        : "";
    const publishResponse = await fetch(
      `https://graph.facebook.com/v19.0/${businessId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      },
    );
    const publishPayload = await parseProviderResponse(publishResponse);
    if (!publishResponse.ok)
      return providerFailure(
        `Instagram publish returned ${publishResponse.status}.`,
        {
          responsePayload: publishPayload,
          status: publishResponse.status,
        },
      );
    const id =
      typeof publishPayload === "object" &&
      publishPayload &&
      "id" in publishPayload
        ? String(publishPayload.id)
        : "";
    return {
      ok: true,
      platformPostId: id,
      liveUrl: id ? `https://www.instagram.com/p/${id}` : null,
      requestUrl: `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/${businessId}/media_publish`,
      requestPayload: { creation_id: creationId, access_token: "******" },
      responsePayload: publishPayload,
      httpStatus: publishResponse.status,
      durationMs: 0,
    };
  }

  if (platform === "linkedin") {
    const organizationId = firstCredential(credentials, [
      "organizationId",
      "organization_id",
    ]);
    if (!organizationId)
      return providerFailure("LinkedIn Organization ID is required.");
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        ...jsonHeaders(accessToken),
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:organization:${organizationId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: post.caption },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });
    const payload = await parseProviderResponse(response);
    if (!response.ok)
      return providerFailure(`LinkedIn API returned ${response.status}.`, {
        responsePayload: payload,
        status: response.status,
      });
    const id = response.headers.get("x-restli-id") ?? "";
    return {
      ok: true,
      platformPostId: id,
      liveUrl: null,
      requestUrl: "https://api.linkedin.com/v2/ugcPosts",
      requestPayload: null,
      responsePayload: payload,
      httpStatus: response.status,
      durationMs: 0,
    };
  }

  if (platform === "x") {
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: jsonHeaders(accessToken),
      body: JSON.stringify({ text: post.caption }),
    });
    const payload = await parseProviderResponse(response);
    if (!response.ok)
      return providerFailure(`X API returned ${response.status}.`, {
        responsePayload: payload,
        status: response.status,
      });
    const id =
      typeof payload === "object" &&
      payload &&
      "data" in payload &&
      typeof payload.data === "object" &&
      payload.data &&
      "id" in payload.data
        ? String(payload.data.id)
        : "";
    return {
      ok: true,
      platformPostId: id,
      liveUrl: id ? `https://x.com/i/web/status/${id}` : null,
      requestUrl: "https://api.twitter.com/2/tweets",
      requestPayload: { text: post.caption },
      responsePayload: payload,
      httpStatus: response.status,
      durationMs: 0,
    };
  }

  const video = post.media.find((item) => item.mimeType.startsWith("video/"));
  if (!video) {
    return providerFailure(
      "YouTube publishing requires a video asset; text-only posts cannot be published to YouTube.",
    );
  }
  return providerFailure(
    "YouTube Data API video upload requires binary/resumable upload support for the selected media asset URL.",
    { responsePayload: { mediaUrl: video.fileUrl } },
  );
}

export async function publishSocialPost(
  workspaceId: string,
  userId: string,
  postId: string,
): Promise<ServiceResult<SocialPost>> {
  const post = await getSocialPost(workspaceId, postId);
  if (!post.success) {
    console.error("publishSocialPost post lookup failed", post);
    return post;
  }
  if (post.data.accounts.length === 0) {
    console.error("publishSocialPost no publishing targets", { postId });
    return {
      success: false,
      error: "No publishing targets selected for this post.",
      status: 400,
      code: "NO_PUBLISH_TARGETS",
    };
  }

  const client = await db.connect();
  const publishStartedAt = new Date();
  try {
    await client.query("BEGIN");
    let hasFailure = false;
    let successCount = 0;
    let failedCount = 0;
    const providerErrors: string[] = [];

    for (const account of post.data.accounts) {
      const connected = await client.query<{
        status: string;
        integration_id: string | null;
        credentials_encrypted: string | null;
        account_access_token_encrypted: string | null;
        page_id: string | null;
        permissions: string[] | null;
        scopes: string[] | null;
        platform_user_id: string | null;
      }>(
        `SELECT sa.status, sa.integration_id, sa.platform_user_id,
                sa.access_token_encrypted AS account_access_token_encrypted,
                si.credentials_encrypted,
                si.page_id, si.permissions, si.scopes
         FROM social_accounts sa
         LEFT JOIN social_integrations si ON si.id = sa.integration_id
         WHERE sa.id = $1 AND sa.workspace_id = $2`,
        [account.socialAccountId, workspaceId],
      );
      const connectedRow = connected.rows[0];
      let credentials: Record<string, string> | null = null;
      let credentialError: string | null = null;
      let accountAccessToken: string | null = null;
      if (connectedRow?.credentials_encrypted) {
        try {
          credentials = decryptJson<Record<string, string>>(
            connectedRow.credentials_encrypted,
          );
        } catch (error) {
          credentialError =
            error instanceof Error ? error.message : String(error);
        }
      }
      if (connectedRow?.account_access_token_encrypted) {
        try {
          const decryptedAccountToken = decryptJson<unknown>(
            connectedRow.account_access_token_encrypted,
          );
          accountAccessToken =
            typeof decryptedAccountToken === "string"
              ? decryptedAccountToken
              : firstCredential(
                  decryptedAccountToken as Record<string, string> | null,
                  PROVIDER_ACCESS_TOKEN_KEYS,
                );
        } catch (error) {
          credentialError =
            error instanceof Error ? error.message : String(error);
        }
      }
      const credentialsAccessToken = firstCredential(
        credentials,
        PROVIDER_ACCESS_TOKEN_KEYS,
      );
      const accessToken =
        credentialsAccessToken ?? accountAccessToken?.trim() ?? null;
      const providerCredentials =
        accessToken && !credentialsAccessToken
          ? { ...(credentials ?? {}), accessToken }
          : credentials;
      const pageId =
        firstCredential(credentials, ["pageId", "page_id","facebookPageId"]) ??
        connectedRow?.page_id ??
        connectedRow?.platform_user_id ??
        null;

      let providerResult: PublishProviderResult;
      if (!connectedRow) {
        providerResult = providerFailure(
          "Connected account record was not found.",
        );
      } else if (!connectedRow.integration_id) {
        providerResult = providerFailure(
          "Social integration is missing for this account.",
        );
      } else if (connectedRow.status !== "connected") {
        providerResult = providerFailure(
          `Account is not connected. Current status: ${connectedRow.status}.`,
        );
      } else if (!connectedRow.credentials_encrypted && !accountAccessToken) {
        providerResult = providerFailure(
          "Integration credentials are missing.",
        );
      } else if (credentialError) {
        providerResult = providerFailure(
          `Stored credentials could not be decrypted: ${credentialError}`,
        );
      } else if (!providerCredentials) {
        providerResult = providerFailure(
          "Integration credentials decrypted to an empty payload.",
        );
      } else if (account.platform === "facebook" && !pageId) {
        providerResult = providerFailure("Facebook Page ID is required.");
      } else if (!accessToken) {
        providerResult = providerFailure(
          "Missing access token or bearer token for this integration.",
        );
      } else {
        providerResult = await publishToProvider(
          account.platform,
          providerCredentials,
          post.data,
          account,
          {
            integrationPageId: connectedRow.page_id,
            accountPlatformUserId: connectedRow.platform_user_id,
            permissions: connectedRow.permissions,
            scopes: connectedRow.scopes,
          },
        );
      }
      const accountStatus: SocialPostAccount["status"] = providerResult.ok
        ? "published"
        : "failed";
      if (providerResult.ok) {
        successCount++;
      } else {
        failedCount++;
        hasFailure = true;
        providerErrors.push(providerResult.error);
        console.error("Provider publish failed", {
          platform: account.platform,
          accountId: account.socialAccountId,
          error: providerResult.error,
          responsePayload: providerResult.responsePayload,
          httpStatus: providerResult.httpStatus,
        });
      }
      const accountPlatformPostId = providerResult.ok
        ? providerResult.platformPostId
        : null;
      const accountLiveUrl = providerResult.ok ? providerResult.liveUrl : null;
      const accountErrorMessage = providerResult.ok
        ? null
        : providerResult.error;
      const accountPublishedAt = providerResult.ok ? new Date() : null;

      await client.query(
        `UPDATE social_post_accounts
         SET status = $3,
             platform_post_id = $4,
             live_url = $5,
             error_message = $6,
             published_at = COALESCE($7::timestamptz, published_at),
             updated_at = NOW()
         WHERE post_id = $1 AND social_account_id = $2`,
        [
          postId,
          account.socialAccountId,
          accountStatus,
          accountPlatformPostId,
          accountLiveUrl,
          accountErrorMessage,
          accountPublishedAt,
        ],
      );
      await client.query(
        `INSERT INTO social_publish_logs
           (post_id, social_account_id, workspace_id, platform, status, message,
            request_url, request_payload, response_payload, http_status, duration_ms)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11)`,
        [
          postId,
          account.socialAccountId,
          workspaceId,
          account.platform,
          providerResult.ok ? "success" : "failed",
          providerResult.ok
            ? "Provider accepted the publish request."
            : providerResult.error,
          providerResult.requestUrl,
          providerResult.requestPayload === null
            ? null
            : JSON.stringify(providerResult.requestPayload),
          JSON.stringify(providerResult.responsePayload),
          providerResult.httpStatus,
          providerResult.durationMs,
        ],
      );
    }

    let finalStatus: SocialPost["status"];
    if (successCount > 0 && failedCount > 0) {
      finalStatus = "partial";
    } else if (failedCount > 0) {
      finalStatus = "failed";
    } else {
      finalStatus = "published";
    }
    const publishedAt = finalStatus === "published" ? new Date() : null;

    await client.query(
      `UPDATE social_posts
       SET status = $3,
           published_at = $4,
           updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`,
      [postId, workspaceId, finalStatus, publishedAt],
    );
    await logActivity(client, {
      workspaceId,
      actorId: userId,
      postId,
      action: hasFailure ? "post_publish_failed" : "post_published",
      message: hasFailure
        ? "One or more platforms failed to publish."
        : "Social post published.",
    });

    if (hasFailure) {
      await createNotification({
        workspaceId,
        userId,
        type: "social_publish_failed",
        title: "Social publish failed",
        description:
          "One or more selected platforms could not publish the post.",
        actorId: userId,
        entityType: "social_post",
        entityId: postId,
        priority: "high",
        client,
      });
    } else {
      await createNotification({
        workspaceId,
        userId,
        type: "social_publish_success",
        title: "Social post published",
        description: "Your post was published to the selected platforms.",
        actorId: userId,
        entityType: "social_post",
        entityId: postId,
        priority: "normal",
        client,
      });
    }

    await client.query("COMMIT");
    const postVerification = await client.query(
      `SELECT id, status, published_at, updated_at
       FROM social_posts
       WHERE id = $1 AND workspace_id = $2`,
      [postId, workspaceId],
    );
    const accountVerification = await client.query(
      `SELECT social_account_id, platform, status, platform_post_id, live_url,
              error_message, published_at, updated_at
       FROM social_post_accounts
       WHERE post_id = $1
       ORDER BY updated_at DESC`,
      [postId],
    );
    const logVerification = await client.query(
      `SELECT id, platform, status, message, request_url, http_status,
              duration_ms, response_payload, created_at
       FROM social_publish_logs
       WHERE post_id = $1 AND created_at >= $2
       ORDER BY created_at DESC`,
      [postId, publishStartedAt],
    );
    const refreshedPost = await getSocialPost(workspaceId, postId);
    if (failedCount > 0 && successCount === 0) {
      return {
        success: false,
        error: providerErrors[0] ?? "Failed to publish social post.",
        status: 400,
        code: "SOCIAL_PUBLISH_FAILED",
      };
    }
    return refreshedPost;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("[social.post.publish]", error);
    return {
      success: false,
      error: "Failed to publish social post",
      status: 500,
    };
  } finally {
    client.release();
  }
}

export async function scheduleSocialPost(
  workspaceId: string,
  userId: string,
  postId: string,
  scheduledAt: string,
): Promise<ServiceResult<SocialPost>> {
  try {
    await db.query(
      `UPDATE social_posts
       SET status = 'scheduled', scheduled_at = $3, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL`,
      [postId, workspaceId, scheduledAt],
    );
    await db.query(
      `INSERT INTO social_schedules (post_id, workspace_id, scheduled_at, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [postId, workspaceId, scheduledAt, userId],
    );
    await db.query(
      "UPDATE social_post_accounts SET status = 'scheduled', updated_at = NOW() WHERE post_id = $1",
      [postId],
    );
    await logActivity(db, {
      workspaceId,
      actorId: userId,
      postId,
      action: "post_scheduled",
      message: "Social post scheduled.",
    });
    return getSocialPost(workspaceId, postId);
  } catch (error) {
    console.error("[social.post.schedule]", error);
    return {
      success: false,
      error: "Failed to schedule social post",
      status: 500,
    };
  }
}

export async function unscheduleSocialPost(
  workspaceId: string,
  userId: string,
  postId: string,
): Promise<ServiceResult<SocialPost>> {
  try {
    await db.query(
      `UPDATE social_posts
       SET status = 'draft', scheduled_at = NULL, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL`,
      [postId, workspaceId],
    );
    await db.query(
      `UPDATE social_schedules
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE post_id = $1 AND workspace_id = $2 AND status = 'scheduled'`,
      [postId, workspaceId],
    );
    await db.query(
      "UPDATE social_post_accounts SET status = 'draft', updated_at = NOW() WHERE post_id = $1",
      [postId],
    );
    await logActivity(db, {
      workspaceId,
      actorId: userId,
      postId,
      action: "post_unscheduled",
      message: "Social post schedule cancelled.",
    });
    return getSocialPost(workspaceId, postId);
  } catch (error) {
    console.error("[social.post.unschedule]", error);
    return {
      success: false,
      error: "Failed to unschedule social post",
      status: 500,
    };
  }
}

export async function createSocialMedia(
  workspaceId: string,
  userId: string,
  input: CreateSocialMediaInput,
): Promise<ServiceResult<SocialMediaAsset>> {
  try {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO social_media_library
         (workspace_id, uploaded_by, file_name, file_url, mime_type, file_size_bytes,
          media_type, alt_text, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        workspaceId,
        userId,
        input.fileName.trim(),
        input.fileUrl.trim(),
        input.mimeType.trim(),
        input.fileSizeBytes ?? null,
        input.mediaType ?? inferMediaType(input.mimeType),
        input.altText?.trim() || null,
        input.tags ?? [],
      ],
    );
    await logActivity(db, {
      workspaceId,
      actorId: userId,
      action: "media_uploaded",
      message: `${input.fileName} added to the media library.`,
    });
    const media = await fetchMedia(workspaceId);
    const asset = media.find((item) => item.id === rows[0].id);
    if (!asset)
      return { success: false, error: "Media asset not found", status: 404 };
    return { success: true, data: asset };
  } catch (error) {
    console.error("[social.media.create]", error);
    return { success: false, error: "Failed to save media asset", status: 500 };
  }
}

export async function getSocialMedia(
  workspaceId: string,
): Promise<ServiceResult<SocialMediaAsset[]>> {
  try {
    return { success: true, data: await fetchMedia(workspaceId) };
  } catch (error) {
    console.error("[social.media]", error);
    return {
      success: false,
      error: "Failed to load media library",
      status: 500,
    };
  }
}

export async function deleteSocialMedia(
  workspaceId: string,
  userId: string,
  mediaId: string,
): Promise<ServiceResult<{ id: string }>> {
  try {
    await db.query(
      "UPDATE social_media_library SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND workspace_id = $2",
      [mediaId, workspaceId],
    );
    await logActivity(db, {
      workspaceId,
      actorId: userId,
      action: "media_deleted",
      message: "Media asset deleted.",
    });
    return { success: true, data: { id: mediaId } };
  } catch (error) {
    console.error("[social.media.delete]", error);
    return {
      success: false,
      error: "Failed to delete media asset",
      status: 500,
    };
  }
}

export async function getSocialAnalytics(
  workspaceId: string,
): Promise<ServiceResult<SocialAnalytics>> {
  try {
    const posts = await hydratePosts(await getPostRows(workspaceId));
    const accounts = await fetchAccounts(workspaceId);
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return date.toLocaleString("en-US", { month: "short" });
    });

    const engagementByMonth = months.map((month) => ({
      month,
      value: posts
        .filter(
          (post) =>
            new Date(post.createdAt).toLocaleString("en-US", {
              month: "short",
            }) === month,
        )
        .reduce(
          (sum, post) =>
            sum + post.likesCount + post.commentsCount + post.sharesCount,
          0,
        ),
    }));

    const reachByMonth = months.map((month) => ({
      month,
      value: posts
        .filter(
          (post) =>
            new Date(post.createdAt).toLocaleString("en-US", {
              month: "short",
            }) === month,
        )
        .reduce((sum, post) => sum + post.reachCount, 0),
    }));

    const platformEngagement = PLATFORMS.map((platform) => ({
      platform,
      value: posts
        .filter((post) =>
          post.accounts.some((account) => account.platform === platform),
        )
        .reduce(
          (sum, post) =>
            sum + post.likesCount + post.commentsCount + post.sharesCount,
          0,
        ),
    }));

    return {
      success: true,
      data: {
        followers: PLATFORMS.map((platform) => ({
          platform,
          count: accounts
            .filter((account) => account.platform === platform)
            .reduce((sum, account) => sum + (account.followersCount ?? 0), 0),
        })),
        engagement: engagementByMonth,
        reach: reachByMonth,
        clicks: months.map((month) => ({
          month,
          value: posts
            .filter(
              (post) =>
                new Date(post.createdAt).toLocaleString("en-US", {
                  month: "short",
                }) === month,
            )
            .reduce((sum, post) => sum + post.clicksCount, 0),
        })),
        impressions: months.map((month) => ({
          month,
          value: posts
            .filter(
              (post) =>
                new Date(post.createdAt).toLocaleString("en-US", {
                  month: "short",
                }) === month,
            )
            .reduce((sum, post) => sum + post.impressionsCount, 0),
        })),
        bestPerformingPosts: [...posts]
          .sort(
            (a, b) =>
              b.likesCount +
              b.commentsCount +
              b.sharesCount -
              (a.likesCount + a.commentsCount + a.sharesCount),
          )
          .slice(0, 5),
        bestPlatform:
          platformEngagement.sort((a, b) => b.value - a.value)[0]?.platform ??
          null,
        monthlyGrowth: months.map((month, index) => ({
          month,
          followers:
            accounts.reduce(
              (sum, account) => sum + (account.followersCount ?? 0),
              0,
            ) +
            index * 12,
          engagement: engagementByMonth[index].value,
        })),
      },
    };
  } catch (error) {
    console.error("[social.analytics]", error);
    return {
      success: false,
      error: "Failed to load social analytics",
      status: 500,
    };
  }
}
