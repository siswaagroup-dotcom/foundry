// =============================================================================
// TEAM TYPES — shared between client and server.
// Must NOT import any Node.js or server-only modules.
// =============================================================================

export type WorkspaceRole      = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";
export type InvitationStatus   = "pending" | "accepted" | "expired" | "revoked";
export type MemberStatus       = "active" | "suspended";

export interface WorkspaceMemberRow {
  id:          string;
  workspaceId: string;
  userId:      string;
  name:        string;
  email:       string;
  role:        WorkspaceRole;
  status:      MemberStatus;
  joinedAt:    string | null;
  createdAt:   string;
}

export interface WorkspaceInvitationRow {
  id:          string;
  workspaceId: string;
  email:       string;
  role:        WorkspaceRole;
  status:      InvitationStatus;
  invitedBy:   string;
  invitedAt:   string;
  expiresAt:   string;
  rawToken?:   string;   // raw token returned after creation
  inviteUrl?:  string;   // full acceptance URL
}
