"use client";

import { RotateCcw, X } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { PendingInvite } from "./types/team-types";

type InviteCardProps = {
  invite: PendingInvite;
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
};

function statusTone(
  status: PendingInvite["status"]
): "orange" | "green" | "gray" | "red" {
  if (status === "pending") return "orange";
  if (status === "accepted") return "green";
  if (status === "expired") return "gray";
  return "red"; // revoked
}

export function InviteCard({ invite, onResend, onRevoke }: InviteCardProps) {
  const isPending = invite.status === "pending";
  const canResend = invite.status === "pending" || invite.status === "expired";
  const canRevoke = invite.status === "pending";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#edf0f3] p-3">
      {/* Avatar initial */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold uppercase text-primary">
        {invite.email[0]}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{invite.email}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#6b7280]">{invite.role}</span>
          <span className="text-xs text-[#9ca3af]">·</span>
          <span className="text-xs text-[#6b7280]">{invite.invitedAt}</span>
        </div>
        <div className="mt-1.5">
          <StatusBadge tone={statusTone(invite.status)}>
            {invite.status}
          </StatusBadge>
        </div>
      </div>

      {/* Actions */}
      {(canResend || canRevoke) && (
        <div className="flex shrink-0 gap-1">
          {canResend && (
            <button
              type="button"
              onClick={() => onResend(invite.id)}
              title="Resend invitation"
              aria-label={`Resend invitation to ${invite.email}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f8fafc] hover:text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          {canRevoke && (
            <button
              type="button"
              onClick={() => onRevoke(invite.id)}
              title="Revoke invitation"
              aria-label={`Revoke invitation to ${invite.email}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
