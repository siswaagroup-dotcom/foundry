import { Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkspaceRole } from "@/types/team";
import { editableRoles } from "../constants/editable-roles";
import type { FormState } from "../utils/form-from-settings";
import type { SettingsData } from "../types/settings-types";

type Props = {
  data: SettingsData["team"];
  invite: FormState["invite"];
  onInviteChange: (invite: FormState["invite"]) => void;
  onInvite: () => void;
  onRoleChange: (memberId: string, role: Exclude<WorkspaceRole, "Owner">) => void;
  onRemove: (memberId: string) => void;
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
};

export function TeamSettings({
  data,
  invite,
  onInviteChange,
  onInvite,
  onRoleChange,
  onRemove,
  onResend,
  onRevoke,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
        <Input
          type="email"
          value={invite.email}
          onChange={(event) => onInviteChange({ ...invite, email: event.target.value })}
        />
        <select
          value={invite.role}
          onChange={(event) =>
            onInviteChange({ ...invite, role: event.target.value as Exclude<WorkspaceRole, "Owner"> })
          }
          className="h-12 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#111827]"
        >
          {editableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <Button type="button" onClick={onInvite}>
          <Plus className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#edf0f3]">
        {data.members.map((member) => (
          <div
            key={member.id}
            className="grid gap-3 border-b border-[#edf0f3] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
          >
            <div>
              <p className="text-sm font-semibold text-[#111827]">{member.name}</p>
              <p className="text-xs text-[#6b7280]">{member.email}</p>
            </div>
            <select
              value={member.role}
              disabled={member.role === "Owner"}
              onChange={(event) =>
                onRoleChange(member.id, event.target.value as Exclude<WorkspaceRole, "Owner">)
              }
              className="h-10 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827] disabled:bg-[#f8fafc]"
            >
              {member.role === "Owner" ? <option value="Owner">Owner</option> : null}
              {editableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => onRemove(member.id)}
              disabled={member.role === "Owner"}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#111827]">Pending Invitations</h3>
        {data.invitations.length === 0 ? (
          <p className="rounded-xl border border-[#edf0f3] p-4 text-sm text-[#6b7280]">
            No pending invitations.
          </p>
        ) : (
          data.invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#edf0f3] p-4"
            >
              <div>
                <p className="text-sm font-semibold text-[#111827]">{invitation.email}</p>
                <p className="text-xs text-[#6b7280]">{invitation.role}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onResend(invitation.id)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Resend
                </Button>
                <Button type="button" variant="outline" onClick={() => onRevoke(invitation.id)}>
                  Revoke
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
