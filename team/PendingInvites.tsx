import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { InviteCard } from "./InviteCard";
import type { PendingInvite } from "./types/team-types";

type PendingInvitesProps = {
  pendingInvites: PendingInvite[];
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
};

export function PendingInvites({
  pendingInvites,
  onResend,
  onRevoke,
}: PendingInvitesProps) {
  return (
    <DashboardCard title="Pending Invites">
      <div className="space-y-3">
        {pendingInvites.length === 0 ? (
          <p className="py-2 text-sm text-[#6b7280]">No pending invitations.</p>
        ) : (
          pendingInvites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              onResend={onResend}
              onRevoke={onRevoke}
            />
          ))
        )}
      </div>
    </DashboardCard>
  );
}
