"use client";

// =============================================================================
// TeamWorkspace — DYNAMIC, API-READY
// Layout is UNCHANGED. Now wired to useTeam() which composes
// useWorkspaceMembers + useInvitations via team.service.ts.
// =============================================================================

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { PendingInvites } from "./PendingInvites";
import { RolesSummary } from "./RolesSummary";
import { TeamHeader } from "./TeamHeader";
import { TeamMembersTable } from "./TeamMembersTable";
import { useTeam } from "./hooks/useTeam";
import type { WorkspaceRole } from "./types/team-types";

export function TeamWorkspace() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    // Members
    teamMembers,
    membersLoading,
    updateRole,
    removeMember,
    // Invitations
    pendingInvites,
    resend,
    revoke,
    // Roles summary
    roles,
  } = useTeam();

  // ---------------------------------------------------------------------------
  // Change Role handler — calls service, shows toast
  // Future: PATCH /api/workspaces/:wid/team/members/:id/role
  // ---------------------------------------------------------------------------
  async function handleChangeRole(memberId: string, role: WorkspaceRole) {
    const error = await updateRole({ memberId, role });
    if (error) {
      toast({ title: "Could not change role", description: error, variant: "error" });
    } else {
      toast({ title: "Role updated", description: `Member role changed to ${role}.`, variant: "success" });
    }
  }

  // ---------------------------------------------------------------------------
  // Remove Member handler — calls service, shows toast
  // Future: DELETE /api/workspaces/:wid/team/members/:id
  // ---------------------------------------------------------------------------
  async function handleRemoveMember(memberId: string) {
    const member = teamMembers.find((m) => m.id === memberId);
    const error = await removeMember(memberId);
    if (error) {
      toast({ title: "Could not remove member", description: error, variant: "error" });
    } else {
      toast({ title: "Member removed", description: `${member?.name ?? "Member"} has been removed from the workspace.`, variant: "success" });
    }
  }

  // ---------------------------------------------------------------------------
  // Resend invitation — calls service, shows toast
  // Future: PATCH /api/workspaces/:wid/team/invitations/:id/resend
  // ---------------------------------------------------------------------------
  async function handleResend(invitationId: string) {
    const inv = pendingInvites.find((i) => i.id === invitationId);
    const error = await resend(invitationId);
    if (error) {
      toast({ title: "Could not resend invitation", description: error, variant: "error" });
    } else {
      toast({ title: "Invitation resent", description: `Invitation resent to ${inv?.email ?? "member"}.`, variant: "success" });
    }
  }

  // ---------------------------------------------------------------------------
  // Revoke invitation — calls service, shows toast
  // Future: PATCH /api/workspaces/:wid/team/invitations/:id/revoke
  // ---------------------------------------------------------------------------
  async function handleRevoke(invitationId: string) {
    const inv = pendingInvites.find((i) => i.id === invitationId);
    const error = await revoke(invitationId);
    if (error) {
      toast({ title: "Could not revoke invitation", description: error, variant: "error" });
    } else {
      toast({ title: "Invitation revoked", description: `Invitation to ${inv?.email ?? "member"} has been revoked.`, variant: "success" });
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">

      <TeamHeader
        onConfigureRoles={() => router.push("/dashboard/team/roles")}
        onInviteMember={() => router.push("/dashboard/team/invite")}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* Members table — shows skeleton while loading */}
        {membersLoading ? (
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[#f3f4f6]" />
              ))}
            </div>
          </div>
        ) : (
          <TeamMembersTable
            teamMembers={teamMembers}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveMember}
          />
        )}

        <div className="space-y-4">
          <RolesSummary roles={roles} />
          <PendingInvites
            pendingInvites={pendingInvites}
            onResend={handleResend}
            onRevoke={handleRevoke}
          />
        </div>

      </div>
    </div>
  );
}
