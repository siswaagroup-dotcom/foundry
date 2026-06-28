export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "x" | "youtube";

export type SocialConnectionStatus =
  | "connected"
  | "disconnected"
  | "invalid_credentials"
  | "token_expired"
  | "syncing"
  | "permission_error";

export type SocialConnectionType = "oauth" | "manual";
export type SocialPostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "partial"
  | "failed"
  | "archived"
  | "cancelled";
export type SocialPublishLogStatus = "success" | "failed" | "queued" | "skipped";
export type SocialMediaType = "image" | "video" | "document";

export type SocialCredentialMap = Record<string, string>;

export interface SocialIntegration {
  id: string;
  workspaceId: string;
  platform: SocialPlatform;
  connectionType: SocialConnectionType;
  displayName: string;
  connectionName: string;
  status: SocialConnectionStatus;
  credentialKeys: string[];
  maskedCredentials: Record<string, string>;
  scopes: string[];
  permissions: string[];
  externalAccountId: string | null;
  pageId: string | null;
  channelId: string | null;
  organizationId: string | null;
  accountName: string | null;
  avatarUrl: string | null;
  expiresAt: string | null;
  lastValidatedAt: string | null;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  workspaceId: string;
  integrationId: string | null;
  platform: SocialPlatform;
  accountName: string;
  handle: string;
  platformUserId: string | null;
  status: SocialConnectionStatus;
  profileUrl: string | null;
  avatarUrl: string | null;
  followersCount: number | null;
  postsCount: number | null;
  connectedAt: string | null;
  tokenExpiresAt: string | null;
}

export interface SocialPostAccount {
  id: string;
  postId: string;
  socialAccountId: string;
  platform: SocialPlatform;
  accountName: string;
  handle: string;
  status: SocialPostStatus;
  platformPostId: string | null;
  liveUrl: string | null;
  errorMessage: string | null;
  publishedAt: string | null;
}

export interface SocialPostMedia {
  id: string;
  postId: string;
  workspaceId: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number | null;
  sortOrder: number;
  uploadedAt: string;
}

export interface SocialPublishLog {
  id: string;
  postId: string;
  socialAccountId: string | null;
  platform: SocialPlatform;
  status: SocialPublishLogStatus;
  message: string | null;
  requestUrl: string | null;
  requestPayload: unknown;
  responsePayload: unknown;
  httpStatus: number | null;
  durationMs: number | null;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  workspaceId: string;
  title: string | null;
  caption: string;
  content: string;
  status: SocialPostStatus;
  platform: SocialPlatform | "multi";
  scheduledAt: string | null;
  publishedAt: string | null;
  campaign: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  hashtags: string[];
  mentions: string[];
  linkUrl: string | null;
  linkTitle: string | null;
  linkDescription: string | null;
  linkImageUrl: string | null;
  clicksCount: number;
  impressionsCount: number;
  reachCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  accounts: SocialPostAccount[];
  media: SocialPostMedia[];
  logs: SocialPublishLog[];
}

export interface SocialMediaAsset {
  id: string;
  workspaceId: string;
  uploadedBy: string;
  uploadedByName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number | null;
  mediaType: SocialMediaType;
  altText: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialActivityLog {
  id: string;
  workspaceId: string;
  actorId: string | null;
  actorName: string | null;
  postId: string | null;
  integrationId: string | null;
  action: string;
  message: string;
  createdAt: string;
}

export interface SocialDashboard {
  accounts: SocialAccount[];
  integrations: SocialIntegration[];
  posts: SocialPost[];
  media: SocialMediaAsset[];
  activity: SocialActivityLog[];
  metrics: {
    connectedAccounts: number;
    scheduledPosts: number;
    publishedPosts: number;
    draftPosts: number;
    failedPosts: number;
    totalReach: number;
    totalEngagement: number;
  };
  platformSummary: Array<{
    platform: SocialPlatform;
    connectedAccounts: number;
    posts: number;
    published: number;
    failed: number;
    reach: number;
    engagement: number;
  }>;
}

export interface SocialAnalytics {
  followers: Array<{ platform: SocialPlatform; count: number }>;
  engagement: Array<{ month: string; value: number }>;
  reach: Array<{ month: string; value: number }>;
  clicks: Array<{ month: string; value: number }>;
  impressions: Array<{ month: string; value: number }>;
  bestPerformingPosts: SocialPost[];
  bestPlatform: SocialPlatform | null;
  monthlyGrowth: Array<{ month: string; followers: number; engagement: number }>;
}

export interface SaveSocialIntegrationInput {
  platform: SocialPlatform;
  connectionType: SocialConnectionType;
  displayName: string;
  connectionName?: string;
  credentials: SocialCredentialMap;
  accountName?: string;
  handle?: string;
  platformUserId?: string;
  scopes?: string[];
  permissions?: string[];
  externalAccountId?: string;
  pageId?: string;
  channelId?: string;
  organizationId?: string;
  avatarUrl?: string;
  expiresAt?: string;
}

export interface CreateSocialPostInput {
  title?: string;
  caption: string;
  accountIds: string[];
  status?: SocialPostStatus;
  scheduledAt?: string | null;
  campaign?: string;
  hashtags?: string[];
  mentions?: string[];
  linkUrl?: string;
  media?: Array<{
    fileUrl: string;
    mimeType: string;
    fileSizeBytes?: number;
    sortOrder?: number;
  }>;
}

export type UpdateSocialPostInput = Partial<CreateSocialPostInput>;

export interface CreateSocialMediaInput {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes?: number;
  mediaType: SocialMediaType;
  altText?: string;
  tags?: string[];
}
