import { MoreHorizontal } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TeamMemberRow } from "./TeamMemberRow";
import type { TeamMember } from "./types/team-types";

type TeamMembersTableProps = {
  teamMembers: TeamMember[];
  onActions: (memberId: string) => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function TeamMembersTable({
  teamMembers,
  onActions,
}: TeamMembersTableProps) {
  return (
    <DashboardCard title="Team Members">
      <table className="hidden w-full table-fixed border-collapse md:table">
        <thead>
          <tr className="border-b border-[#edf0f3] text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            <th className="px-4 pb-3">Member</th>
            <th className="w-32 px-4 pb-3">Role</th>
            <th className="w-28 px-4 pb-3">Status</th>
            <th className="w-36 px-4 pb-3">Last Active</th>
            <th className="w-20 px-4 pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onActions={onActions}
            />
          ))}
        </tbody>
      </table>

      <div className="space-y-3 md:hidden">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-[#edf0f3] p-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-primary">
                {initials(member.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{member.name}</p>
                <p className="mt-1 truncate text-xs text-[#6b7280]">
                  {member.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onActions(member.id)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#4b5563]"
                aria-label={`Open actions for ${member.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <span className="font-medium text-[#4b5563]">{member.role}</span>
              <span className="text-right text-[#6b7280]">
                {member.lastActive}
              </span>
              <StatusBadge
                tone={member.status === "Active" ? "green" : "gray"}
              >
                {member.status}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
