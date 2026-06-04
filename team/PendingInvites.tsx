import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { InviteCard } from "./InviteCard";
import type { PendingInvite } from "./types/team-types";

type PendingInvitesProps = {
  pendingInvites: PendingInvite[];
};

export function PendingInvites({ pendingInvites }: PendingInvitesProps) {
  return (
    <DashboardCard title="Pending Invites">
      <div className="space-y-3">
        {pendingInvites.map((invite) => (
          <InviteCard key={invite.id} invite={invite} />
        ))}
      </div>
    </DashboardCard>
  );
}
