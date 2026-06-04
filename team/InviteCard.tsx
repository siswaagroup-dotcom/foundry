import type { PendingInvite } from "./types/team-types";

type InviteCardProps = {
  invite: PendingInvite;
};

export function InviteCard({ invite }: InviteCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#edf0f3] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold uppercase text-primary">
        {invite.email[0]}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{invite.email}</p>
        <p className="mt-1 text-xs text-[#6b7280]">{invite.invitedAt}</p>
      </div>
    </div>
  );
}
