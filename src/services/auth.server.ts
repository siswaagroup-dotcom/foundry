import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { PoolClient } from "pg";

import { db } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
  businessType?: string;
  timezone?: string;
  currency?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthWorkspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  workspace: AuthWorkspace;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
}

export interface OAuthProfileInput {
  provider: "google";
  providerUserId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number; code?: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return slug.length >= 2 ? slug : `workspace-${crypto.randomUUID().slice(0, 8)}`;
}

async function createUniqueWorkspaceSlug(
  client: PoolClient,
  workspaceName: string
): Promise<string> {
  const base = createSlug(workspaceName);
  let slug = base;
  let suffix = 1;

  while (true) {
    const { rowCount } = await client.query(
      "SELECT 1 FROM workspaces WHERE slug = $1 LIMIT 1",
      [slug]
    );

    if (rowCount === 0) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function hashSessionToken(sessionId: string): string {
  return crypto.createHash("sha256").update(sessionId).digest("hex");
}

function toSession(data: {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  workspace: AuthWorkspace;
}): AuthSession {
  return {
    ...data,
    workspaceId: data.workspace.id,
    workspaceSlug: data.workspace.slug,
    workspaceName: data.workspace.name,
  };
}

async function createSessionTokens(
  client: PoolClient,
  user: { id: string; email: string },
  request?: Request
): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const forwardedFor = request?.headers.get("x-forwarded-for") ?? "";
  const ipAddress = forwardedFor.split(",")[0]?.trim() || null;
  const userAgent = request?.headers.get("user-agent") ?? null;

  await client.query(
    `INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId, user.id, hashSessionToken(sessionId), ipAddress, userAgent, expiresAt]
  );

  return {
    accessToken: signAccessToken({ sub: user.id, email: user.email }),
    refreshToken: signRefreshToken({ sub: user.id, sessionId }),
  };
}

async function getPrimaryWorkspace(
  client: PoolClient,
  userId: string
): Promise<AuthWorkspace | null> {
  const { rows } = await client.query<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>(
    `SELECT w.id, w.name, w.slug, r.name AS role
     FROM workspace_members wm
     JOIN workspaces w ON w.id = wm.workspace_id
     JOIN roles r ON r.id = wm.role_id
     WHERE wm.user_id = $1
       AND wm.status = 'active'
       AND w.deleted_at IS NULL
     ORDER BY wm.joined_at ASC NULLS LAST, wm.created_at ASC
     LIMIT 1`,
    [userId]
  );

  return rows[0] ?? null;
}

async function createStarterWorkspaceForUser(
  client: PoolClient,
  input: {
    userId: string;
    workspaceName: string;
    businessType?: string;
    timezone?: string;
    currency?: string;
  }
): Promise<AuthWorkspace | null> {
  const { rows: planRows } = await client.query<{ id: string }>(
    "SELECT id FROM plans WHERE name = 'starter' AND is_active = TRUE LIMIT 1"
  );

  if (!planRows[0]) {
    return null;
  }

  const planId = planRows[0].id;
  const slug = await createUniqueWorkspaceSlug(client, input.workspaceName);
  const { rows: workspaceRows } = await client.query<{
    id: string;
    name: string;
    slug: string;
  }>(
    `INSERT INTO workspaces
       (name, slug, owner_id, business_type, timezone, currency, plan_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, slug`,
    [
      input.workspaceName.trim(),
      slug,
      input.userId,
      input.businessType?.trim() || null,
      input.timezone?.trim() || "UTC",
      (input.currency?.trim() || "USD").toUpperCase(),
      planId,
    ]
  );

  const workspace = workspaceRows[0];

  await client.query("SELECT initialize_workspace($1, $2)", [
    workspace.id,
    input.userId,
  ]);

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await client.query(
    `INSERT INTO subscriptions
       (workspace_id, plan_id, status, billing_cycle, current_period_start, current_period_end, trial_ends_at)
     VALUES ($1, $2, 'trialing', 'monthly', $3, $4, $4)`,
    [workspace.id, planId, now, trialEndsAt]
  );

  return getPrimaryWorkspace(client, input.userId);
}

export async function signUp(
  input: SignUpInput,
  request?: Request
): Promise<ServiceResult<AuthSession>> {
  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const email = normalizeEmail(input.email);
    const duplicate = await client.query("SELECT 1 FROM users WHERE email = $1", [email]);

    if ((duplicate.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "An account with this email already exists.",
        status: 409,
        code: "EMAIL_EXISTS",
      };
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const { rows: userRows } = await client.query<{
      id: string;
      name: string;
      email: string;
      email_verified: boolean;
    }>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, email_verified`,
      [input.name.trim(), email, passwordHash]
    );

    const user = userRows[0];
    const ownerWorkspace = await createStarterWorkspaceForUser(client, {
      userId: user.id,
      workspaceName: input.workspaceName,
      businessType: input.businessType,
      timezone: input.timezone,
      currency: input.currency,
    });

    if (!ownerWorkspace) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "Workspace owner membership was not created.",
        status: 500,
        code: "MEMBERSHIP_MISSING",
      };
    }

    const tokens = await createSessionTokens(client, user, request);
    await client.query("COMMIT");

    return {
      success: true,
      data: toSession({
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
        },
        workspace: ownerWorkspace,
      }),
    };
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => undefined);
    }
    console.error("[auth.signup]", error);

    return {
      success: false,
      error: "Failed to create account. Please try again.",
      status: 500,
      code: "SIGNUP_FAILED",
    };
  } finally {
    client?.release();
  }
}

export async function signInWithOAuth(
  profile: OAuthProfileInput,
  request?: Request
): Promise<ServiceResult<AuthSession>> {
  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const email = normalizeEmail(profile.email);
    const { rows: existingUsers } = await client.query<{
      id: string;
      name: string;
      email: string;
      email_verified: boolean;
    }>(
      `SELECT id, name, email, email_verified
       FROM users
       WHERE email = $1 AND deleted_at IS NULL
       LIMIT 1`,
      [email]
    );

    let user = existingUsers[0];

    if (!user) {
      const { rows: userRows } = await client.query<{
        id: string;
        name: string;
        email: string;
        email_verified: boolean;
      }>(
        `INSERT INTO users
           (name, email, password_hash, avatar_url, email_verified, email_verified_at)
         VALUES ($1, $2, NULL, $3, $4, CASE WHEN $4 THEN NOW() ELSE NULL END)
         RETURNING id, name, email, email_verified`,
        [
          profile.name.trim() || email.split("@")[0],
          email,
          profile.avatarUrl ?? null,
          Boolean(profile.emailVerified),
        ]
      );

      user = userRows[0];

      const workspace = await createStarterWorkspaceForUser(client, {
        userId: user.id,
        workspaceName: `${user.name}'s Workspace`,
      });

      if (!workspace) {
        await client.query("ROLLBACK");
        return {
          success: false,
          error: "Starter plan is not configured.",
          status: 500,
          code: "PLAN_MISSING",
        };
      }
    } else {
      await client.query(
        `UPDATE users
         SET name = COALESCE(NULLIF($2, ''), name),
             avatar_url = COALESCE($3, avatar_url),
             email_verified = email_verified OR $4,
             email_verified_at = CASE
               WHEN email_verified_at IS NULL AND $4 THEN NOW()
               ELSE email_verified_at
             END,
             updated_at = NOW()
         WHERE id = $1`,
        [
          user.id,
          profile.name.trim(),
          profile.avatarUrl ?? null,
          Boolean(profile.emailVerified),
        ]
      );
    }

    await client.query(
      `INSERT INTO oauth_accounts
         (user_id, provider, provider_user_id, access_token_encrypted, refresh_token_encrypted, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (provider, provider_user_id)
       DO UPDATE SET
         user_id = EXCLUDED.user_id,
         access_token_encrypted = EXCLUDED.access_token_encrypted,
         refresh_token_encrypted = COALESCE(EXCLUDED.refresh_token_encrypted, oauth_accounts.refresh_token_encrypted),
         token_expires_at = EXCLUDED.token_expires_at,
         updated_at = NOW()`,
      [
        user.id,
        profile.provider,
        profile.providerUserId,
        profile.accessToken ?? null,
        profile.refreshToken ?? null,
        profile.expiresAt ?? null,
      ]
    );

    const workspace = await getPrimaryWorkspace(client, user.id);

    if (!workspace) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "No active workspace found for this account.",
        status: 403,
        code: "WORKSPACE_MISSING",
      };
    }

    const tokens = await createSessionTokens(client, user, request);

    await client.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      user.id,
    ]);
    await client.query("COMMIT");

    return {
      success: true,
      data: toSession({
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified || Boolean(profile.emailVerified),
        },
        workspace,
      }),
    };
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => undefined);
    }
    console.error("[auth.oauth]", error);

    return {
      success: false,
      error: "Google sign in failed. Please try again.",
      status: 500,
      code: "OAUTH_LOGIN_FAILED",
    };
  } finally {
    client?.release();
  }
}

export async function signIn(
  input: SignInInput,
  request?: Request
): Promise<ServiceResult<AuthSession>> {
  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    const email = normalizeEmail(input.email);
    const { rows } = await client.query<{
      id: string;
      name: string;
      email: string;
      password_hash: string | null;
      email_verified: boolean;
    }>(
      `SELECT id, name, email, password_hash, email_verified
       FROM users
       WHERE email = $1 AND deleted_at IS NULL
       LIMIT 1`,
      [email]
    );

    const user = rows[0];

    if (!user?.password_hash) {
      return {
        success: false,
        error: "Invalid email or password.",
        status: 401,
        code: "INVALID_CREDENTIALS",
      };
    }

    const passwordIsValid = await bcrypt.compare(input.password, user.password_hash);

    if (!passwordIsValid) {
      return {
        success: false,
        error: "Invalid email or password.",
        status: 401,
        code: "INVALID_CREDENTIALS",
      };
    }

    const workspace = await getPrimaryWorkspace(client, user.id);

    if (!workspace) {
      return {
        success: false,
        error: "No active workspace found for this account.",
        status: 403,
        code: "WORKSPACE_MISSING",
      };
    }

    const tokens = await createSessionTokens(client, user, request);

    await client.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);

    return {
      success: true,
      data: toSession({
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
        },
        workspace,
      }),
    };
  } catch (error) {
    console.error("[auth.login]", error);

    return {
      success: false,
      error: "Sign in failed. Please try again.",
      status: 500,
      code: "LOGIN_FAILED",
    };
  } finally {
    client?.release();
  }
}

export async function signOut(sessionId: string): Promise<void> {
  await db.query("UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1", [
    sessionId,
  ]);
}

export async function refreshSession(
  sessionId: string,
  userId: string,
  request?: Request
): Promise<ServiceResult<{ accessToken: string; refreshToken: string }>> {
  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const { rows } = await client.query<{ email: string; expires_at: Date }>(
      `SELECT u.email, s.expires_at
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = $1
         AND s.user_id = $2
         AND s.token_hash = $3
         AND s.revoked_at IS NULL
         AND u.deleted_at IS NULL
       LIMIT 1`,
      [sessionId, userId, hashSessionToken(sessionId)]
    );

    const session = rows[0];

    if (!session || new Date(session.expires_at) <= new Date()) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "Session expired.",
        status: 401,
        code: "SESSION_EXPIRED",
      };
    }

    await client.query("UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1", [
      sessionId,
    ]);

    const tokens = await createSessionTokens(
      client,
      { id: userId, email: session.email },
      request
    );

    await client.query("COMMIT");

    return { success: true, data: tokens };
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => undefined);
    }
    console.error("[auth.refresh]", error);

    return {
      success: false,
      error: "Token refresh failed.",
      status: 500,
      code: "REFRESH_FAILED",
    };
  } finally {
    client?.release();
  }
}

export async function getMe(
  userId: string
): Promise<ServiceResult<Omit<AuthSession, "accessToken" | "refreshToken">>> {
  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    const { rows } = await client.query<{
      id: string;
      name: string;
      email: string;
      email_verified: boolean;
    }>(
      `SELECT id, name, email, email_verified
       FROM users
       WHERE id = $1 AND deleted_at IS NULL
       LIMIT 1`,
      [userId]
    );

    const user = rows[0];

    if (!user) {
      return {
        success: false,
        error: "User not found.",
        status: 404,
        code: "USER_NOT_FOUND",
      };
    }

    const workspace = await getPrimaryWorkspace(client, user.id);

    if (!workspace) {
      return {
        success: false,
        error: "No active workspace found.",
        status: 404,
        code: "WORKSPACE_MISSING",
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
        },
        workspace,
        workspaceId: workspace.id,
        workspaceSlug: workspace.slug,
        workspaceName: workspace.name,
      },
    };
  } catch (error) {
    console.error("[auth.me]", error);

    return {
      success: false,
      error: "Failed to fetch user.",
      status: 500,
      code: "ME_FAILED",
    };
  } finally {
    client?.release();
  }
}

// =============================================================================
// FORGOT PASSWORD — create a reset token and return it
// In production this token is emailed. For now it is returned in the response
// so the frontend can pass it directly to the reset form during development.
// The token is a SHA-256 hash of a random UUID stored in password_reset_tokens.
// =============================================================================

export interface ForgotPasswordInput {
  email: string;
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<ServiceResult<{ message: string; resetToken?: string }>> {
  try {
    const email = normalizeEmail(input.email);

    const { rows } = await db.query<{ id: string }>(
      "SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1",
      [email]
    );

    // Always return success to prevent email enumeration attacks
    if (rows.length === 0) {
      return {
        success: true,
        data: { message: "If an account exists for this email, a reset link has been sent." },
      };
    }

    const userId = rows[0].id;

    // Invalidate any existing unused tokens for this user
    await db.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      [userId]
    );

    // Create new reset token (expires in 1 hour)
    const rawToken = crypto.randomUUID();
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    // In production: send email with link containing rawToken
    // For development: return rawToken in response so UI can use it directly
    const isDev = process.env.NODE_ENV !== "production";

    return {
      success: true,
      data: {
        message: "If an account exists for this email, a reset link has been sent.",
        ...(isDev ? { resetToken: rawToken } : {}),
      },
    };
  } catch (error) {
    console.error("[auth.forgotPassword]", error);
    return {
      success: false,
      error: "Failed to process request. Please try again.",
      status: 500,
      code: "FORGOT_PASSWORD_FAILED",
    };
  }
}

// =============================================================================
// RESET PASSWORD — validate token and set new password
// =============================================================================

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<ServiceResult<{ message: string }>> {
  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");

    // Find the token — must be unused and not expired
    const { rows } = await client.query<{ id: string; user_id: string; expires_at: Date }>(
      `SELECT id, user_id, expires_at
       FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL
       LIMIT 1`,
      [tokenHash]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "This reset link is invalid or has already been used.",
        status: 400,
        code: "INVALID_RESET_TOKEN",
      };
    }

    const resetToken = rows[0];

    if (new Date(resetToken.expires_at) <= new Date()) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "This reset link has expired. Please request a new one.",
        status: 400,
        code: "RESET_TOKEN_EXPIRED",
      };
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(input.password, 12);

    await client.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await client.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
      [resetToken.id]
    );

    // Revoke all existing sessions — force re-login with new password
    await client.query(
      "UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [resetToken.user_id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      data: { message: "Password reset successfully. Please sign in with your new password." },
    };
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => undefined);
    }
    console.error("[auth.resetPassword]", error);
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
      status: 500,
      code: "RESET_PASSWORD_FAILED",
    };
  } finally {
    client?.release();
  }
}
