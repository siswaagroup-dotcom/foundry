// =============================================================================
// TEAM SERVICE — server-side only (API route handlers)
// All queries are workspace-scoped for multi-tenant isolation.
// =============================================================================
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { sendInvitationEmail } from "@/services/email.service";
import type {
  WorkspaceRole,
  InvitationStatus,
  MemberStatus,
  WorkspaceMemberRow,
  WorkspaceInvitationRow,
} from "@/types/team";

// Re-export for convenience
export type {
  WorkspaceRole,
  InvitationStatus,
  MemberStatus,
  WorkspaceMemberRow,
  WorkspaceInvitationRow,
};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number; code?: string };

// ─── getMembers ───────────────────────────────────────────────────────────────

export async function getMembers(
  workspaceId: string
): Promise<ServiceResult<WorkspaceMemberRow[]>> {
  try {
    const { rows } = await db.query<{
      id: string; workspace_id: string; user_id: string; name: string;
      email: string; role_name: string; status: string;
      joined_at: string | null; created_at: string;
    }>(
      `SELECT wm.id, wm.workspace_id, wm.user_id, u.name, u.email,
              r.name AS role_name, wm.status, wm.joined_at, wm.created_at
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       JOIN roles r ON r.id = wm.role_id
       WHERE wm.workspace_id = $1
         AND wm.status = 'active'
         AND u.deleted_at IS NULL
       ORDER BY wm.joined_at ASC NULLS LAST, wm.created_at ASC`,
      [workspaceId]
    );
    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id, workspaceId: r.workspace_id, userId: r.user_id,
        name: r.name, email: r.email, role: r.role_name as WorkspaceRole,
        status: r.status as MemberStatus, joinedAt: r.joined_at, createdAt: r.created_at,
      })),
    };
  } catch (err) {
    console.error("[team.getMembers]", err);
    return { success: false, error: "Failed to fetch members", status: 500 };
  }
}

// ─── getInvitations ───────────────────────────────────────────────────────────

export async function getInvitations(
  workspaceId: string
): Promise<ServiceResult<WorkspaceInvitationRow[]>> {
  try {
    const { rows } = await db.query<{
      id: string; workspace_id: string; email: string; role_name: string;
      status: string; invited_by_name: string; created_at: string; expires_at: string;
    }>(
      `SELECT wi.id, wi.workspace_id, wi.email, r.name AS role_name,
              wi.status, u.name AS invited_by_name, wi.created_at, wi.expires_at
       FROM workspace_invitations wi
       JOIN roles r ON r.id = wi.role_id
       JOIN users u ON u.id = wi.invited_by
       WHERE wi.workspace_id = $1
         AND wi.status = 'pending'
         AND wi.expires_at > NOW()
       ORDER BY wi.created_at DESC`,
      [workspaceId]
    );
    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id, workspaceId: r.workspace_id, email: r.email,
        role: r.role_name as WorkspaceRole, status: r.status as InvitationStatus,
        invitedBy: r.invited_by_name,
        invitedAt: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        expiresAt: r.expires_at,
      })),
    };
  } catch (err) {
    console.error("[team.getInvitations]", err);
    return { success: false, error: "Failed to fetch invitations", status: 500 };
  }
}

// ─── inviteMember ─────────────────────────────────────────────────────────────

export async function inviteMember(
  workspaceId: string,
  invitedById: string,
  email: string,
  role: WorkspaceRole
): Promise<ServiceResult<WorkspaceInvitationRow>> {
  try {
    const normalEmail = email.trim().toLowerCase();

    // Resolve role_id for this workspace
    // DB stores roles as lowercase (owner/admin/manager/member/viewer)
    // UI sends Title Case (Admin/Manager/Member/Viewer) — normalise here
    const roleNameNorm = role.toLowerCase();
    const { rows: roleRows } = await db.query<{ id: string }>(
      "SELECT id FROM roles WHERE workspace_id = $1 AND LOWER(name) = $2 LIMIT 1",
      [workspaceId, roleNameNorm]
    );
    if (roleRows.length === 0) {
      return { success: false, error: `Role '${role}' not found in this workspace`, status: 400 };
    }
    const roleId = roleRows[0].id;

    // Check existing pending invitation
    const { rows: existing } = await db.query(
      "SELECT id FROM workspace_invitations WHERE workspace_id = $1 AND email = $2 AND status = 'pending'",
      [workspaceId, normalEmail]
    );
    if (existing.length > 0) {
      return { success: false, error: `A pending invitation already exists for ${normalEmail}`, status: 409, code: "DUPLICATE_INVITATION" };
    }

    // Check if already a member
    const { rows: memberRows } = await db.query(
      `SELECT wm.id FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = $1 AND u.email = $2 AND wm.status = 'active'`,
      [workspaceId, normalEmail]
    );
    if (memberRows.length > 0) {
      return { success: false, error: `${normalEmail} is already a member of this workspace`, status: 409, code: "ALREADY_MEMBER" };
    }

    // Create token
    const rawToken = crypto.randomUUID();
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { rows } = await db.query<{ id: string; created_at: string; expires_at: string }>(
      `INSERT INTO workspace_invitations
         (workspace_id, invited_by, email, role_id, token_hash, status, expires_at)
       VALUES ($1,$2,$3,$4,$5,'pending',$6)
       RETURNING id, created_at, expires_at`,
      [workspaceId, invitedById, normalEmail, roleId, tokenHash, expiresAt]
    );

    const inv = rows[0];
    const { rows: inviterRows } = await db.query<{ name: string; workspace_name: string }>(
      `SELECT u.name, w.name AS workspace_name
       FROM users u, workspaces w
       WHERE u.id = $1 AND w.id = $2`,
      [invitedById, workspaceId]
    );

    const inviterName   = inviterRows[0]?.name ?? "A team member";
    const workspaceName = inviterRows[0]?.workspace_name ?? "a workspace";
    const appUrl        = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Send invitation email — fire and forget (never blocks invitation creation)
    void sendInvitationEmail({
      to:              normalEmail,
      inviterName,
      workspaceName,
      role:            role,
      invitationToken: rawToken,
      expiresAt,
    });

    return {
      success: true,
      data: {
        id:          inv.id,
        workspaceId,
        email:       normalEmail,
        role,
        status:      "pending" as const,
        invitedBy:   inviterName,
        invitedAt:   "Just now",
        expiresAt:   inv.expires_at,
        // Always return rawToken so the frontend can display the link
        rawToken,
        inviteUrl: `${appUrl}/invite/${rawToken}`,
      },
    };
  } catch (err) {
    console.error("[team.inviteMember]", err);
    return { success: false, error: "Failed to send invitation", status: 500 };
  }
}

// ─── resendInvitation ─────────────────────────────────────────────────────────

export async function resendInvitation(
  workspaceId: string,
  invitationId: string
): Promise<ServiceResult<{ rawToken: string; inviteUrl: string }>> {
  try {
    const { rows } = await db.query<{ status: string }>(
      "SELECT status FROM workspace_invitations WHERE id = $1 AND workspace_id = $2",
      [invitationId, workspaceId]
    );
    if (rows.length === 0) return { success: false, error: "Invitation not found", status: 404 };
    if (!["pending", "expired"].includes(rows[0].status)) {
      return { success: false, error: "Only pending or expired invitations can be resent", status: 400 };
    }

    const rawToken = crypto.randomUUID();
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      "UPDATE workspace_invitations SET token_hash=$1, status='pending', expires_at=$2 WHERE id=$3",
      [tokenHash, expiresAt, invitationId]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
      success: true,
      data: {
        rawToken,
        inviteUrl: `${appUrl}/invite/${rawToken}`,
      },
    };
  } catch (err) {
    console.error("[team.resendInvitation]", err);
    return { success: false, error: "Failed to resend invitation", status: 500 };
  }
}

// ─── revokeInvitation ────────────────────────────────────────────────────────

export async function revokeInvitation(
  workspaceId: string,
  invitationId: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    const { rowCount } = await db.query(
      "UPDATE workspace_invitations SET status='revoked' WHERE id=$1 AND workspace_id=$2 AND status='pending'",
      [invitationId, workspaceId]
    );
    if ((rowCount ?? 0) === 0) {
      return { success: false, error: "Invitation not found or not pending", status: 404 };
    }
    return { success: true, data: { id: invitationId } };
  } catch (err) {
    console.error("[team.revokeInvitation]", err);
    return { success: false, error: "Failed to revoke invitation", status: 500 };
  }
}

// ─── acceptInvitation ─────────────────────────────────────────────────────────
// Called from POST /api/auth/accept-invitation
// Handles both: existing user accepting, and new user signing up then accepting.

export interface AcceptInvitationInput {
  token: string;
  name?: string;      // required only if new user
  password?: string;  // required only if new user
}

export interface AcceptResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string };
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
}

export async function acceptInvitation(
  input: AcceptInvitationInput,
  request?: Request
): Promise<ServiceResult<AcceptResult>> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");

    // Diagnostic: log token details to confirm what's being looked up
    // Never logs full token — only length and first 8 chars
    // Validate token
    const { rows: invRows } = await client.query<{
      id: string; workspace_id: string; email: string; role_id: string;
      status: string; expires_at: string;
    }>(
      `SELECT id, workspace_id, email, role_id, status, expires_at
       FROM workspace_invitations
       WHERE token_hash = $1
       LIMIT 1`,
      [tokenHash]
    );

    // Diagnostic: log whether a match was found
    if (invRows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Invalid or expired invitation link.", status: 400, code: "INVALID_TOKEN" };
    }

    const inv = invRows[0];

    if (inv.status === "accepted") {
      await client.query("ROLLBACK");
      return { success: false, error: "This invitation has already been accepted.", status: 400, code: "ALREADY_ACCEPTED" };
    }
    if (inv.status !== "pending") {
      await client.query("ROLLBACK");
      return { success: false, error: "This invitation is no longer valid.", status: 400, code: "INVALID_STATUS" };
    }
    if (new Date(inv.expires_at) <= new Date()) {
      await client.query("UPDATE workspace_invitations SET status='expired' WHERE id=$1", [inv.id]);
      await client.query("ROLLBACK");
      return { success: false, error: "This invitation has expired. Ask the workspace owner to resend it.", status: 400, code: "EXPIRED" };
    }

    // Get or create user
    let userId: string;
    let userName: string;

    const { rows: existingUser } = await client.query<{ id: string; name: string }>(
      "SELECT id, name FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1",
      [inv.email]
    );

    if (existingUser.length > 0) {
      // Existing user — just join the workspace
      userId   = existingUser[0].id;
      userName = existingUser[0].name;
    } else {
      // New user — must supply name and password
      if (!input.name?.trim()) {
        await client.query("ROLLBACK");
        return { success: false, error: "Name is required for new accounts.", status: 400, code: "NAME_REQUIRED" };
      }
      if (!input.password || input.password.length < 8) {
        await client.query("ROLLBACK");
        return { success: false, error: "Password must be at least 8 characters.", status: 400, code: "PASSWORD_REQUIRED" };
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const { rows: newUser } = await client.query<{ id: string }>(
        "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id",
        [input.name.trim(), inv.email, passwordHash]
      );
      userId   = newUser[0].id;
      userName = input.name.trim();
    }

    // Check if already a member of this workspace
    const { rows: alreadyMember } = await client.query(
      "SELECT id FROM workspace_members WHERE workspace_id=$1 AND user_id=$2",
      [inv.workspace_id, userId]
    );
    if (alreadyMember.length > 0) {
      // Update to active if suspended
      await client.query(
        "UPDATE workspace_members SET status='active', joined_at=NOW() WHERE workspace_id=$1 AND user_id=$2",
        [inv.workspace_id, userId]
      );
    } else {
      // Create membership
      await client.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role_id, status, joined_at)
         VALUES ($1,$2,$3,'active',NOW())`,
        [inv.workspace_id, userId, inv.role_id]
      );
    }

    // Mark invitation accepted
    await client.query(
      "UPDATE workspace_invitations SET status='accepted', accepted_at=NOW() WHERE id=$1",
      [inv.id]
    );

    // Get workspace info
    const { rows: wsRows } = await client.query<{ name: string; slug: string }>(
      "SELECT name, slug FROM workspaces WHERE id=$1", [inv.workspace_id]
    );
    const ws = wsRows[0];

    // Create session
    const sessionId = crypto.randomUUID();
    const sessionHash = crypto.createHash("sha256").update(sessionId).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const ip = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = request?.headers.get("user-agent") ?? null;

    await client.query(
      "INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1,$2,$3,$4,$5,$6)",
      [sessionId, userId, sessionHash, ip, ua, expiresAt]
    );

    await client.query("COMMIT");

    return {
      success: true,
      data: {
        accessToken:   signAccessToken({ sub: userId, email: inv.email }),
        refreshToken:  signRefreshToken({ sub: userId, sessionId }),
        user:          { id: userId, name: userName, email: inv.email },
        workspaceId:   inv.workspace_id,
        workspaceName: ws.name,
        workspaceSlug: ws.slug,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[team.acceptInvitation]", err);
    return { success: false, error: "Failed to accept invitation.", status: 500 };
  } finally {
    client.release();
  }
}

// ─── changeMemberRole ────────────────────────────────────────────────────────

export async function changeMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole,
  requesterId: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    // Can't change Owner's role via this method
    const { rows: current } = await db.query<{ role_name: string }>(
      `SELECT r.name AS role_name FROM workspace_members wm
       JOIN roles r ON r.id = wm.role_id
       WHERE wm.id = $1 AND wm.workspace_id = $2`,
      [memberId, workspaceId]
    );
    if (current.length === 0) return { success: false, error: "Member not found", status: 404 };
    if (current[0].role_name === "Owner") {
      return { success: false, error: "Cannot change the Owner role", status: 403 };
    }
    if (role === "Owner") {
      return { success: false, error: "Cannot assign Owner role via this method", status: 403 };
    }

    const { rows: roleRows } = await db.query<{ id: string }>(
      "SELECT id FROM roles WHERE workspace_id=$1 AND LOWER(name)=$2 LIMIT 1",
      [workspaceId, role.toLowerCase()]
    );
    if (roleRows.length === 0) return { success: false, error: "Role not found", status: 404 };

    await db.query(
      "UPDATE workspace_members SET role_id=$1 WHERE id=$2 AND workspace_id=$3",
      [roleRows[0].id, memberId, workspaceId]
    );
    return { success: true, data: { id: memberId } };
  } catch (err) {
    console.error("[team.changeMemberRole]", err);
    return { success: false, error: "Failed to change role", status: 500 };
  }
}

// ─── removeMember ────────────────────────────────────────────────────────────

export async function removeMember(
  workspaceId: string,
  memberId: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    // Prevent removing the owner
    const { rows } = await db.query<{ role_name: string; user_id: string }>(
      `SELECT r.name AS role_name, wm.user_id
       FROM workspace_members wm JOIN roles r ON r.id = wm.role_id
       WHERE wm.id = $1 AND wm.workspace_id = $2`,
      [memberId, workspaceId]
    );
    if (rows.length === 0) return { success: false, error: "Member not found", status: 404 };
    if (rows[0].role_name === "Owner") {
      return { success: false, error: "The workspace owner cannot be removed", status: 403 };
    }

    await db.query(
      "UPDATE workspace_members SET status='suspended' WHERE id=$1 AND workspace_id=$2",
      [memberId, workspaceId]
    );
    return { success: true, data: { id: memberId } };
  } catch (err) {
    console.error("[team.removeMember]", err);
    return { success: false, error: "Failed to remove member", status: 500 };
  }
}
