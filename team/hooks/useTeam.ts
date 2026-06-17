"use client";

// =============================================================================
// HOOK — useTeam
//
// Orchestrator hook for the Team & Roles module.
// Composes useWorkspaceMembers + useInvitations into a single
// interface consumed by TeamWorkspace.
//
// Keeps TeamWorkspace clean — it only needs one hook call.
// =============================================================================

import { useCallback, useState } from "react";
import { roles as rolesData } from "../data/team-roles";
import { useInvitations } from "./useInvitations";
import { useWorkspaceMembers } from "./useWorkspaceMembers";
import type { WorkspaceRole } from "../types/team-types";

export function useTeam() {
  const memberHook = useWorkspaceMembers();
  const invitationHook = useInvitations();

  // Active member whose actions menu is open (null = closed)
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const openMemberActions = useCallback((memberId: string) => {
    setActiveMemberId((prev) => (prev === memberId ? null : memberId));
  }, []);

  const closeMemberActions = useCallback(() => {
    setActiveMemberId(null);
  }, []);

  // Role summary derived from live member state
  const roleCounts = memberHook.roleSummary();
  const roles = rolesData.map((role) => ({
    ...role,
    // Override count with live member count for the 5 system roles
    count:
      roleCounts[role.name as WorkspaceRole] !== undefined
        ? roleCounts[role.name as WorkspaceRole]
        : role.count,
  }));

  return {
    // Members
    teamMembers: memberHook.members,
    membersLoading: memberHook.isLoading,
    membersError: memberHook.error,
    updateRole: memberHook.updateRole,
    removeMember: memberHook.remove,

    // Invitations
    invitations: invitationHook.invitations,
    pendingInvites: invitationHook.pendingInvitations,
    invitationsLoading: invitationHook.isLoading,
    isSubmitting: invitationHook.isSubmitting,
    invite: invitationHook.invite,
    resend: invitationHook.resend,
    revoke: invitationHook.revoke,

    // Roles summary (for RolesSummary sidebar card)
    roles,

    // Member actions menu state
    activeMemberId,
    openMemberActions,
    closeMemberActions,
  };
}
