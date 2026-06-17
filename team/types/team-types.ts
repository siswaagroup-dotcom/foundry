// =============================================================================
// TEAM MODULE — TYPE DEFINITIONS
// Aligned with the database schema (workspace_members, workspace_invitations,
// roles, permissions tables).
// =============================================================================

// ---------------------------------------------------------------------------
// WORKSPACE ROLES
// These match the 5 system roles seeded in the database.
// ---------------------------------------------------------------------------
export type WorkspaceRole =
  | "Owner"
  | "Admin"
  | "Manager"
  | "Member"
  | "Viewer";

// ---------------------------------------------------------------------------
// MEMBER STATUS
// Matches workspace_members.status in the DB.
// ---------------------------------------------------------------------------
export type MemberStatus = "Active" | "Away" | "Offline" | "Suspended";

// ---------------------------------------------------------------------------
// INVITATION STATUS
// Matches workspace_invitations.status in the DB.
// ---------------------------------------------------------------------------
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

// ---------------------------------------------------------------------------
// WorkspaceMember
// Represents a user who has accepted an invitation and is a full workspace member.
// Maps to: workspace_members JOIN users
// ---------------------------------------------------------------------------
export interface WorkspaceMember {
  id: string;           // workspace_members.id (UUID)
  workspaceId: string;  // workspace_members.workspace_id
  userId: string;       // workspace_members.user_id
  name: string;         // users.name
  email: string;        // users.email
  avatar: string | null;// users.avatar_url
  role: WorkspaceRole;  // roles.name (via workspace_members.role_id)
  status: MemberStatus; // workspace_members.status
  joinedAt: string;     // workspace_members.joined_at (ISO string)
  lastActive: string;   // Derived — human-readable (e.g. "2 hours ago")
}

// ---------------------------------------------------------------------------
// WorkspaceInvitation
// Represents a pending invitation sent to a user to join the workspace.
// Maps to: workspace_invitations
// ---------------------------------------------------------------------------
export interface WorkspaceInvitation {
  id: string;               // workspace_invitations.id (UUID)
  workspaceId: string;      // workspace_invitations.workspace_id
  email: string;            // workspace_invitations.email
  role: WorkspaceRole;      // roles.name (via workspace_invitations.role_id)
  status: InvitationStatus; // workspace_invitations.status
  invitedBy: string;        // invited_by user's name (joined from users)
  invitedAt: string;        // workspace_invitations.created_at (human-readable)
  expiresAt: string;        // workspace_invitations.expires_at (ISO string)
}

// ---------------------------------------------------------------------------
// TeamRole
// Represents a role row for display in RolesSummary / RoleCard.
// Maps to: roles table with member count aggregate.
// ---------------------------------------------------------------------------
export interface TeamRole {
  id: string;
  name: string;
  description: string;
  count: number;  // aggregate: workspace_members using this role
}

// ---------------------------------------------------------------------------
// FORM DATA TYPES
// Used by forms — not persisted directly. Validated before API call.
// ---------------------------------------------------------------------------

// Invite member form input
export interface InviteMemberFormData {
  email: string;
  role: WorkspaceRole;
}

// Change role form input
export interface ChangeRoleFormData {
  memberId: string;
  role: WorkspaceRole;
}

// ---------------------------------------------------------------------------
// SERVICE RESPONSE TYPES
// Shape of data returned by team.service.ts methods.
// Will match future API response shapes exactly.
// ---------------------------------------------------------------------------
export interface InviteMemberResult {
  success: boolean;
  invitation?: WorkspaceInvitation;
  error?: string;
}

export interface ResendInvitationResult {
  success: boolean;
  error?: string;
}

export interface RevokeInvitationResult {
  success: boolean;
  error?: string;
}

export interface ChangeRoleResult {
  success: boolean;
  member?: WorkspaceMember;
  error?: string;
}

export interface RemoveMemberResult {
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// LEGACY TYPES — kept for backward compat with TeamMembersTable / RoleCard
// (These components still use these shapes internally)
// PendingInvite maps to WorkspaceInvitation for the InviteCard component.
// ---------------------------------------------------------------------------

/** @deprecated Use WorkspaceMember instead */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

/** @deprecated Use WorkspaceInvitation instead */
export interface PendingInvite {
  id: string;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  invitedBy: string;
  invitedAt: string;
}
