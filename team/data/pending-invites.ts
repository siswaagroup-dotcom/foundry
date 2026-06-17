// =============================================================================
// LEGACY DATA FILE — pending-invites.ts
// Kept for backward compatibility. Data now lives in workspace-invitations.ts.
// This file is the source for PendingInvites sidebar card (pending status only).
// =============================================================================

import type { PendingInvite } from "../types/team-types";

export const pendingInvites: PendingInvite[] = [
  {
    id: "invite-1",
    email: "david.park@techcorp.com",
    role: "Member",
    status: "pending",
    invitedBy: "Sarah Miller",
    invitedAt: "Invited 2 days ago",
  },
  {
    id: "invite-2",
    email: "elena.moore@designco.com",
    role: "Manager",
    status: "pending",
    invitedBy: "Marcus Lee",
    invitedAt: "Invited 5 days ago",
  },
];
