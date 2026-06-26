import { apiGet, apiPatch } from "@/lib/api-client";
import {
  changeRole,
  inviteMember,
  removeMember,
  resendInvitation,
  revokeInvitation,
} from "../../team/services/team.service";
import type { InviteMemberInput, SettingsData, SettingsPatch } from "../../settings/types/settings-types";
import type { WorkspaceRole } from "@/types/team";

const BASE = "/api/settings";

export function fetchSettings(): Promise<SettingsData> {
  return apiGet<SettingsData>(BASE);
}

export function patchSettings(patch: SettingsPatch): Promise<SettingsData> {
  return apiPatch<SettingsData>(BASE, patch);
}

export async function inviteSettingsMember(input: InviteMemberInput): Promise<void> {
  const result = await inviteMember(input);
  if (!result.success) throw new Error(result.error ?? "Failed to invite member");
}

export async function updateSettingsMemberRole(memberId: string, role: Exclude<WorkspaceRole, "Owner">): Promise<void> {
  const result = await changeRole({ memberId, role });
  if (!result.success) throw new Error(result.error ?? "Failed to change role");
}

export async function removeSettingsMember(memberId: string): Promise<void> {
  const result = await removeMember(memberId);
  if (!result.success) throw new Error(result.error ?? "Failed to remove member");
}

export async function resendSettingsInvitation(invitationId: string): Promise<void> {
  const result = await resendInvitation(invitationId);
  if (!result.success) throw new Error(result.error ?? "Failed to resend invitation");
}

export async function revokeSettingsInvitation(invitationId: string): Promise<void> {
  const result = await revokeInvitation(invitationId);
  if (!result.success) throw new Error(result.error ?? "Failed to revoke invitation");
}
