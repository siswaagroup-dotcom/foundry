// =============================================================================
// TEAM SERVICE — client-side API wrapper
// Replaces in-memory static data with real API calls.
// All methods call the /api/team/* endpoints.
// =============================================================================

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type { WorkspaceMemberRow, WorkspaceInvitationRow } from "@/types/team";
import type {
  ChangeRoleFormData,
  ChangeRoleResult,
  InviteMemberFormData,
  InviteMemberResult,
  RemoveMemberResult,
  ResendInvitationResult,
  RevokeInvitationResult,
  WorkspaceInvitation,
  WorkspaceMember,
} from "../types/team-types";

// ─── Shape adapters ───────────────────────────────────────────────────────────
// Convert server row shapes to UI WorkspaceMember / WorkspaceInvitation shapes

function toMember(r: WorkspaceMemberRow): WorkspaceMember {
  return {
    id:          r.id,
    workspaceId: r.workspaceId,
    userId:      r.userId,
    name:        r.name,
    email:       r.email,
    avatar:      null,
    role:        r.role,
    status:      r.status === "active" ? "Active" : "Suspended",
    joinedAt:    r.joinedAt ?? r.createdAt,
    lastActive:  "—",
  };
}

function toInvitation(r: WorkspaceInvitationRow): WorkspaceInvitation {
  return {
    id:          r.id,
    workspaceId: r.workspaceId,
    email:       r.email,
    role:        r.role,
    status:      r.status,
    invitedBy:   r.invitedBy,
    invitedAt:   r.invitedAt,
    expiresAt:   r.expiresAt,
  };
}

// ─── getMembers ───────────────────────────────────────────────────────────────

export async function getMembers(): Promise<WorkspaceMember[]> {
  const rows = await apiGet<WorkspaceMemberRow[]>("/api/team/members");
  return rows.map(toMember);
}

// ─── getInvitations ───────────────────────────────────────────────────────────

export async function getInvitations(): Promise<WorkspaceInvitation[]> {
  const rows = await apiGet<WorkspaceInvitationRow[]>("/api/team/invitations");
  return rows.map(toInvitation);
}

// ─── inviteMember ─────────────────────────────────────────────────────────────

export async function inviteMember(
  data: InviteMemberFormData
): Promise<InviteMemberResult> {
  try {
    const row = await apiPost<WorkspaceInvitationRow>("/api/team/invite", {
      email: data.email,
      role:  data.role,
    });
    return { success: true, invitation: toInvitation(row) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to invite member" };
  }
}

// ─── resendInvitation ─────────────────────────────────────────────────────────

export async function resendInvitation(
  invitationId: string
): Promise<ResendInvitationResult> {
  try {
    await apiPost(`/api/team/invitations/${invitationId}/resend`, {});
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to resend invitation" };
  }
}

// ─── revokeInvitation ────────────────────────────────────────────────────────

export async function revokeInvitation(
  invitationId: string
): Promise<RevokeInvitationResult> {
  try {
    await apiPost(`/api/team/invitations/${invitationId}/revoke`, {});
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to revoke invitation" };
  }
}

// ─── changeRole ──────────────────────────────────────────────────────────────

export async function changeRole(
  data: ChangeRoleFormData
): Promise<ChangeRoleResult> {
  try {
    await apiPatch(`/api/team/members/${data.memberId}`, { role: data.role });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to change role" };
  }
}

// ─── removeMember ────────────────────────────────────────────────────────────

export async function removeMember(
  memberId: string
): Promise<RemoveMemberResult> {
  try {
    await apiDelete(`/api/team/members/${memberId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove member" };
  }
}

export type { WorkspaceRole } from "../types/team-types";
