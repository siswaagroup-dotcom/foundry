"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchSettings,
  inviteSettingsMember,
  patchSettings,
  removeSettingsMember,
  resendSettingsInvitation,
  revokeSettingsInvitation,
  updateSettingsMemberRole,
} from "@/services/settings.service";
import type { InviteMemberInput, SettingsData, SettingsPatch } from "../../settings/types/settings-types";
import type { WorkspaceRole } from "@/types/team";

export const SETTINGS_KEY = ["settings"] as const;
const AUTH_ME_KEY = ["auth", "me"] as const;

function mergeSettings(current: SettingsData, patch: SettingsPatch): SettingsData {
  return {
    ...current,
    workspace: { ...current.workspace, ...patch.workspace },
    profile: { ...current.profile, ...patch.profile },
    expensePolicies: { ...current.expensePolicies, ...patch.expensePolicies },
    crm: patch.crm ? { ...current.crm, ...patch.crm } : current.crm,
    integrations: { ...current.integrations, ...patch.integrations },
  };
}

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: fetchSettings,
    staleTime: 30_000,
  });

  const updateSettings = useMutation({
    mutationFn: (patch: SettingsPatch) => patchSettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = queryClient.getQueryData<SettingsData>(SETTINGS_KEY);
      if (previous) {
        queryClient.setQueryData(SETTINGS_KEY, mergeSettings(previous, patch));
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(SETTINGS_KEY, context.previous);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
    },
  });

  const invalidateSettings = () => {
    queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  };

  const inviteMember = useMutation({
    mutationFn: (input: InviteMemberInput) => inviteSettingsMember(input),
    onSuccess: invalidateSettings,
  });

  const changeMemberRole = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Exclude<WorkspaceRole, "Owner"> }) =>
      updateSettingsMemberRole(memberId, role),
    onMutate: async ({ memberId, role }) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = queryClient.getQueryData<SettingsData>(SETTINGS_KEY);
      if (previous) {
        queryClient.setQueryData(SETTINGS_KEY, {
          ...previous,
          team: {
            ...previous.team,
            members: previous.team.members.map((member) =>
              member.id === memberId ? { ...member, role } : member
            ),
          },
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(SETTINGS_KEY, context.previous);
    },
    onSettled: invalidateSettings,
  });

  const removeMember = useMutation({
    mutationFn: (memberId: string) => removeSettingsMember(memberId),
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = queryClient.getQueryData<SettingsData>(SETTINGS_KEY);
      if (previous) {
        queryClient.setQueryData(SETTINGS_KEY, {
          ...previous,
          team: {
            ...previous.team,
            members: previous.team.members.filter((member) => member.id !== memberId),
          },
        });
      }
      return { previous };
    },
    onError: (_error, _memberId, context) => {
      if (context?.previous) queryClient.setQueryData(SETTINGS_KEY, context.previous);
    },
    onSettled: invalidateSettings,
  });

  const resendInvitation = useMutation({
    mutationFn: (invitationId: string) => resendSettingsInvitation(invitationId),
    onSuccess: invalidateSettings,
  });

  const revokeInvitation = useMutation({
    mutationFn: (invitationId: string) => revokeSettingsInvitation(invitationId),
    onMutate: async (invitationId) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = queryClient.getQueryData<SettingsData>(SETTINGS_KEY);
      if (previous) {
        queryClient.setQueryData(SETTINGS_KEY, {
          ...previous,
          team: {
            ...previous.team,
            invitations: previous.team.invitations.filter((invite) => invite.id !== invitationId),
          },
        });
      }
      return { previous };
    },
    onError: (_error, _invitationId, context) => {
      if (context?.previous) queryClient.setQueryData(SETTINGS_KEY, context.previous);
    },
    onSettled: invalidateSettings,
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    updateSettings,
    inviteMember,
    changeMemberRole,
    removeMember,
    resendInvitation,
    revokeInvitation,
  };
}
