import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/toast";
import { useSettings } from "@/hooks/useSettings";
import type { SettingsTab } from "../types/settings-types";
import { formFromSettings, type FormState } from "../utils/form-from-settings";
import { expenseFields, profileFields, workspaceFields } from "../utils/settings-fields";

export function useSettingsWorkspace() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace");
  const {
    settings,
    isLoading,
    isError,
    updateSettings,
    inviteMember,
    changeMemberRole,
    removeMember,
    resendInvitation,
    revokeInvitation,
  } = useSettings();
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (settings) setForm(formFromSettings(settings));
  }, [settings]);

  const isSaving = updateSettings.isPending;

  function changeTab(tab: SettingsTab) {
    if (tab === "billing") {
      router.push("/dashboard/billing");
      return;
    }
    setActiveTab(tab);
  }

  function save(patch: Parameters<typeof updateSettings.mutateAsync>[0], message: string) {
    updateSettings.mutate(patch, {
      onSuccess: () => toast({ title: message, variant: "success" }),
      onError: (error) =>
        toast({
          title: "Settings were not saved",
          description: error instanceof Error ? error.message : undefined,
          variant: "error",
        }),
    });
  }

  const currentFields = useMemo(() => {
    if (!form) return [];
    if (activeTab === "workspace") return workspaceFields(form.workspace);
    if (activeTab === "profile") return profileFields(form.profile);
    if (activeTab === "expense-policies") return expenseFields(form.expensePolicies);
    return [];
  }, [activeTab, form]);

  // ── Team handlers ──────────────────────────────────────────────────────────

  function handleInvite() {
    if (!form) return;
    inviteMember.mutate(form.invite, {
      onSuccess: () => {
        setForm((current) =>
          current ? { ...current, invite: { ...current.invite, email: "" } } : current
        );
        toast({ title: "Invitation sent", variant: "success" });
      },
      onError: (error) =>
        toast({ title: "Invitation failed", description: error.message, variant: "error" }),
    });
  }

  function handleRoleChange(memberId: string, role: Parameters<typeof changeMemberRole.mutate>[0]["role"]) {
    changeMemberRole.mutate(
      { memberId, role },
      {
        onSuccess: () => toast({ title: "Role updated", variant: "success" }),
        onError: (error) =>
          toast({ title: "Role update failed", description: error.message, variant: "error" }),
      }
    );
  }

  function handleRemoveMember(memberId: string) {
    removeMember.mutate(memberId, {
      onSuccess: () => toast({ title: "Member removed", variant: "success" }),
      onError: (error) =>
        toast({ title: "Remove failed", description: error.message, variant: "error" }),
    });
  }

  function handleResend(invitationId: string) {
    resendInvitation.mutate(invitationId, {
      onSuccess: () => toast({ title: "Invitation resent", variant: "success" }),
      onError: (error) =>
        toast({ title: "Resend failed", description: error.message, variant: "error" }),
    });
  }

  function handleRevoke(invitationId: string) {
    revokeInvitation.mutate(invitationId, {
      onSuccess: () => toast({ title: "Invitation revoked", variant: "success" }),
      onError: (error) =>
        toast({ title: "Revoke failed", description: error.message, variant: "error" }),
    });
  }

  return {
    activeTab,
    changeTab,
    settings,
    isLoading,
    isError,
    form,
    setForm,
    isSaving,
    save,
    currentFields,
    handleInvite,
    handleRoleChange,
    handleRemoveMember,
    handleResend,
    handleRevoke,
  };
}
