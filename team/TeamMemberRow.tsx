"use client";

// =============================================================================
// TeamMemberRow — DYNAMIC, API-READY
// UI is UNCHANGED (same columns, same layout, same styling).
// Actions menu now exposes: Change Role + Remove Member (wired to hooks).
// =============================================================================

import { MoreHorizontal, Shield, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import type { WorkspaceMember, WorkspaceRole } from "./types/team-types";

const ROLE_OPTIONS: WorkspaceRole[] = [
  "Admin",
  "Manager",
  "Member",
  "Viewer",
];

type TeamMemberRowProps = {
  member: WorkspaceMember;
  onChangeRole: (memberId: string, role: WorkspaceRole) => void;
  onRemove: (memberId: string) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusTone(
  status: WorkspaceMember["status"]
): "orange" | "green" | "gray" {
  if (status === "Active") return "green";
  if (status === "Away") return "orange";
  return "gray";
}

export function TeamMemberRow({
  member,
  onChangeRole,
  onRemove,
}: TeamMemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isOwner = member.role === "Owner";

  function handleToggleMenu() {
    if (!isOwner) setMenuOpen((prev) => !prev);
  }

  function handleChangeRole(role: WorkspaceRole) {
    setMenuOpen(false);
    onChangeRole(member.id, role);
  }

  function handleRemove() {
    setMenuOpen(false);
    onRemove(member.id);
  }

  return (
    <tr className="border-b border-[#edf0f3] last:border-0">

      {/* Member name + email */}
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

      {/* Role */}
      <td className="px-4 py-4 text-sm font-medium text-[#4b5563]">
        {member.role}
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <StatusBadge tone={getStatusTone(member.status)}>
          {member.status}
        </StatusBadge>
      </td>

      {/* Last active */}
      <td className="px-4 py-4 text-sm text-[#6b7280]">
        {member.lastActive}
      </td>

      {/* Actions */}
      <td className="relative px-4 py-4 text-right">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggleMenu}
          disabled={isOwner}
          aria-label={`Open actions for ${member.name}`}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#4b5563]",
            isOwner
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-[#f8fafc]"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {/* Dropdown actions menu */}
        {menuOpen && !isOwner && (
          <>
            {/* Backdrop to close menu on outside click */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-4 top-full z-20 mt-1 w-48 rounded-xl border border-[#e5e7eb] bg-white py-1.5 shadow-lg">

              {/* Change Role sub-section */}
              <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]">
                Change Role
              </p>
              {ROLE_OPTIONS.filter((r) => r !== member.role).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleChangeRole(role)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#f8fafc]"
                >
                  <Shield className="h-3.5 w-3.5 text-[#9ca3af]" />
                  {role}
                </button>
              ))}

              {/* Divider */}
              <div className="my-1.5 border-t border-[#edf0f3]" />

              {/* Remove member */}
              <button
                type="button"
                onClick={handleRemove}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Member
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}
