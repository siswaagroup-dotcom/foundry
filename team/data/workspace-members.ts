// =============================================================================
// STATIC DATA — WORKSPACE MEMBERS
// Represents workspace_members JOIN users for the active workspace.
//
// MULTI-TENANT NOTE:
//   In production, data is always scoped by workspace_id.
//   The API layer adds workspace_id from the authenticated session —
//   it is never passed from the client.
//
// Future API:
//   GET /api/workspaces/:workspaceId/team/members
//   → replaces this file
// =============================================================================

import type { WorkspaceMember } from "../types/team-types";

// Simulated workspace_id. In production this comes from auth session context.
const MOCK_WORKSPACE_ID = "ws-acme-001";

export const workspaceMembers: WorkspaceMember[] = [
  {
    id: "wm-1",
    workspaceId: MOCK_WORKSPACE_ID,
    userId: "usr-sarah-001",
    name: "Sarah Miller",
    email: "sarah@foundry.com",
    avatar: null,
    role: "Owner",
    status: "Active",
    joinedAt: "2024-01-15T09:00:00Z",
    lastActive: "Now",
  },
  {
    id: "wm-2",
    workspaceId: MOCK_WORKSPACE_ID,
    userId: "usr-marcus-002",
    name: "Marcus Lee",
    email: "marcus@foundry.com",
    avatar: null,
    role: "Admin",
    status: "Active",
    joinedAt: "2024-01-16T10:30:00Z",
    lastActive: "14 minutes ago",
  },
  {
    id: "wm-3",
    workspaceId: MOCK_WORKSPACE_ID,
    userId: "usr-priya-003",
    name: "Priya Shah",
    email: "priya@foundry.com",
    avatar: null,
    role: "Manager",
    status: "Away",
    joinedAt: "2024-02-01T08:00:00Z",
    lastActive: "1 hour ago",
  },
  {
    id: "wm-4",
    workspaceId: MOCK_WORKSPACE_ID,
    userId: "usr-mina-004",
    name: "Mina Chen",
    email: "mina@foundry.com",
    avatar: null,
    role: "Member",
    status: "Offline",
    joinedAt: "2024-02-10T11:00:00Z",
    lastActive: "Yesterday",
  },
  {
    id: "wm-5",
    workspaceId: MOCK_WORKSPACE_ID,
    userId: "usr-owen-005",
    name: "Owen Brooks",
    email: "owen@foundry.com",
    avatar: null,
    role: "Viewer",
    status: "Active",
    joinedAt: "2024-03-05T14:00:00Z",
    lastActive: "2 hours ago",
  },
];
