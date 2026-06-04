"use client";

import { useCallback, useState } from "react";
import { pendingInvites as pendingInvitesData } from "../data/pending-invites";
import { teamMembers as teamMembersData } from "../data/team-members";
import { roles as rolesData } from "../data/team-roles";

export function useTeam() {
  const [teamMembers] = useState(teamMembersData);
  const [roles] = useState(rolesData);
  const [pendingInvites] = useState(pendingInvitesData);

  const configureRoles = useCallback(() => {
    console.log("Configure Roles");
  }, []);

  const inviteMember = useCallback(() => {
    console.log("Invite Member");
  }, []);

  const openMemberActions = useCallback((memberId: string) => {
    console.log(memberId);
  }, []);

  return {
    teamMembers,
    roles,
    pendingInvites,
    configureRoles,
    inviteMember,
    openMemberActions,
  };
}
