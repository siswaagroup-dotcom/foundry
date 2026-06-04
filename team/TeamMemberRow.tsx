import { MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { TeamMember } from "./types/team-types";

type TeamMemberRowProps = {
  member: TeamMember;
  onActions: (memberId: string) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function getStatusTone(status: string): "orange" | "green" | "gray" {
  if (status === "Active") return "green";
  if (status === "Away") return "orange";
  return "gray";
}

export function TeamMemberRow({ member, onActions }: TeamMemberRowProps) {
  return (
    <tr className="border-b border-[#edf0f3] last:border-0">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-primary">
            {getInitials(member.name)}
          </div>
          <div>
            <p className="text-sm font-semibold">{member.name}</p>
            <p className="mt-1 text-xs text-[#6b7280]">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm font-medium text-[#4b5563]">
        {member.role}
      </td>
      <td className="px-4 py-4">
        <StatusBadge tone={getStatusTone(member.status)}>
          {member.status}
        </StatusBadge>
      </td>
      <td className="px-4 py-4 text-sm text-[#6b7280]">
        {member.lastActive}
      </td>
      <td className="px-4 py-4 text-right">
        <button
          type="button"
          onClick={() => onActions(member.id)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#4b5563] hover:bg-[#f8fafc]"
          aria-label={`Open actions for ${member.name}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
