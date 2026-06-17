"use client";

// =============================================================================
// TeamMembersTable — DYNAMIC, API-READY
// UI is UNCHANGED (same table layout, same mobile card layout).
// Now receives WorkspaceMember[] from hook instead of legacy TeamMember[].
// Passes onChangeRole + onRemove down to TeamMemberRow.
// =============================================================================

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import { TeamMemberRow } from "./TeamMemberRow";
import type { WorkspaceMember, WorkspaceRole } from "./types/team-types";

const ROLE_OPTIONS: WorkspaceRole[] = ["Admin", "Manager", "Member", "Viewer"];

type TeamMembersTableProps = {
  teamMembers: WorkspaceMember[];
  onChangeRole: (memberId: string, role: WorkspaceRole) => void;
  onRemove: (memberId: string) => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Mobile card — inline actions menu
function MobileMemberCard({
  member,
  onChangeRole,
  onRemove,
}: {
  member: WorkspaceMember;
  onChangeRole: (memberId: string, role: WorkspaceRole) => void;
  onRemove: (memberId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = member.role === "Owner";

  return (
    <div className="rounded-xl border border-[#edf0f3] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-primary">
          {initials(member.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{member.name}</p>
          <p className="mt-1 truncate text-xs text-[#6b7280]">{member.email}</p>
        </div>

        {/* Mobile actions trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !isOwner && setMenuOpen((p) => !p)}
            disabled={isOwner}
            aria-label={`Open actions for ${member.name}`}
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#4b5563]",
              isOwner ? "cursor-not-allowed opacity-40" : ""
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && !isOwner && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-[#e5e7eb] bg-white py-1.5 shadow-lg">
                <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]">
                  Change Role
                </p>
                {ROLE_OPTIONS.filter((r) => r !== member.role).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => { setMenuOpen(false); onChangeRole(member.id, role); }}
                    className="w-full px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#f8fafc]"
                  >
                    {role}
                  </button>
                ))}
                <div className="my-1 border-t border-[#edf0f3]" />
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onRemove(member.id); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Remove Member
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <span className="font-medium text-[#4b5563]">{member.role}</span>
        <span className="text-right text-[#6b7280]">{member.lastActive}</span>
        <StatusBadge tone={member.status === "Active" ? "green" : member.status === "Away" ? "orange" : "gray"}>
          {member.status}
        </StatusBadge>
      </div>
    </div>
  );
}

export function TeamMembersTable({
  teamMembers,
  onChangeRole,
  onRemove,
}: TeamMembersTableProps) {
  return (
    <DashboardCard title="Team Members">

      {/* Desktop table */}
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
              onChangeRole={onChangeRole}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {teamMembers.map((member) => (
          <MobileMemberCard
            key={member.id}
            member={member}
            onChangeRole={onChangeRole}
            onRemove={onRemove}
          />
        ))}
      </div>

    </DashboardCard>
  );
}
