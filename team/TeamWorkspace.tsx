"use client";

import { useRouter } from "next/navigation";
import { PendingInvites } from "./PendingInvites";
import { RolesSummary } from "./RolesSummary";
import { TeamHeader } from "./TeamHeader";
import { TeamMembersTable } from "./TeamMembersTable";
import { useTeam } from "./hooks/useTeam";

export function TeamWorkspace() {
  const router = useRouter();
  const {
    teamMembers,
    roles,
    pendingInvites,
    openMemberActions,
  } = useTeam();

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <TeamHeader
        onConfigureRoles={() => router.push("/dashboard/team/roles")}
        onInviteMember={() => router.push("/dashboard/team/invite")}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TeamMembersTable
          teamMembers={teamMembers}
          onActions={openMemberActions}
        />

        <div className="space-y-4">
          <RolesSummary roles={roles} />
          <PendingInvites pendingInvites={pendingInvites} />
        </div>
      </div>
    </div>
  );
}
