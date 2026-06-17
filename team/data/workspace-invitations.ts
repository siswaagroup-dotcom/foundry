// =============================================================================
// STATIC DATA — WORKSPACE INVITATIONS
// Represents workspace_invitations for the active workspace.
//
// MULTI-TENANT NOTE:
//   All records are scoped by workspaceId.
//   In production, workspace_id is injected server-side from the auth session.
//   Clients never send workspace_id — the server resolves it from the JWT.
//
// Future API:
//   GET /api/workspaces/:workspaceId/team/invitations
//   → replaces this file
// =============================================================================

import type { WorkspaceInvitation } from "../types/team-types";

const MOCK_WORKSPACE_ID = "ws-acme-001";

export const workspaceInvitations: WorkspaceInvitation[] = [
  {
    id: "inv-001",
    workspaceId: MOCK_WORKSPACE_ID,
    email: "david.park@techcorp.com",
    role: "Member",
    status: "pending",
    invitedBy: "Sarah Miller",
    invitedAt: "Invited 2 days ago",
    expiresAt: "2026-06-14T09:00:00Z",
  },
  {
    id: "inv-002",
    workspaceId: MOCK_WORKSPACE_ID,
    email: "elena.moore@designco.com",
    role: "Manager",
    status: "pending",
    invitedBy: "Marcus Lee",
    invitedAt: "Invited 5 days ago",
    expiresAt: "2026-06-11T10:00:00Z",
  },
  {
    id: "inv-003",
    workspaceId: MOCK_WORKSPACE_ID,
    email: "james.wright@agency.io",
    role: "Viewer",
    status: "expired",
    invitedBy: "Sarah Miller",
    invitedAt: "Invited 8 days ago",
    expiresAt: "2026-06-02T09:00:00Z",
  },
];
