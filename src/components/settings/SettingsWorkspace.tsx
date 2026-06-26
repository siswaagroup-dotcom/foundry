"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
 import { useSettingsWorkspace } from "./hooks/useSettingsWorkspace";
import { WorkspaceSection } from "./sections/WorkspaceSection";
import { ProfileSection } from "./sections/ProfileSection";

import { ExpensePoliciesSection } from "./sections/ExpensePoliciesSection";
import { TeamSettings } from "./components/TeamSettings";
import { CrmSettings } from "./components/CrmSettings";
import { IntegrationSettings } from "./components/IntegrationSettings";
import { titleFor } from "./utils/settings-title";
import { SettingsTabs } from "../../../settings/SettingsTabs";

export function SettingsWorkspace() {
  const {
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
  } = useSettingsWorkspace();

  if (isLoading || !form) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="h-20 animate-pulse rounded-xl bg-[#f3f4f6]" />
        <div className="h-64 animate-pulse rounded-xl bg-[#f3f4f6]" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
        Settings could not be loaded.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Manage workspace, profile, team, policy, CRM, and integration settings.
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={changeTab} />

      <DashboardCard title={titleFor(activeTab)}>
        {activeTab === "workspace" && (
          <WorkspaceSection
            fields={currentFields}
            workspace={form.workspace}
            onFieldChange={(id, value) =>
              setForm((current) =>
                current ? { ...current, workspace: { ...current.workspace, [id]: value } } : current
              )
            }
            onSave={() => save({ workspace: form.workspace }, "Workspace settings saved")}
            saving={isSaving}
          />
        )}

        {activeTab === "profile" && (
          <ProfileSection
            fields={currentFields}
            password={form.password}
            onProfileFieldChange={(id, value) =>
              setForm((current) =>
                current ? { ...current, profile: { ...current.profile, [id]: value } } : current
              )
            }
            onPasswordFieldChange={(id, value) =>
              setForm((current) =>
                current ? { ...current, password: { ...current.password, [id]: value } } : current
              )
            }
            onSaveProfile={() => save({ profile: form.profile }, "Profile settings saved")}
            onSavePassword={() => save({ password: form.password }, "Password changed")}
            saving={isSaving}
          />
        )}

        {activeTab === "team" && (
          <TeamSettings
            data={settings.team}
            invite={form.invite}
            onInviteChange={(next) =>
              setForm((current) => (current ? { ...current, invite: next } : current))
            }
            onInvite={handleInvite}
            onRoleChange={handleRoleChange}
            onRemove={handleRemoveMember}
            onResend={handleResend}
            onRevoke={handleRevoke}
          />
        )}

        {activeTab === "expense-policies" && (
          <ExpensePoliciesSection
            fields={currentFields}
            onFieldChange={(id, value) =>
              setForm((current) =>
                current
                  ? { ...current, expensePolicies: { ...current.expensePolicies, [id]: value } }
                  : current
              )
            }
            onSave={() =>
              save(
                {
                  expensePolicies: {
                    ...form.expensePolicies,
                    approvalLevels: Number(form.expensePolicies.approvalLevels),
                  },
                },
                "Expense policies saved"
              )
            }
            saving={isSaving}
          />
        )}

        {activeTab === "crm" && (
          <CrmSettings
            stages={form.crmStages}
            onChange={(stages) =>
              setForm((current) => (current ? { ...current, crmStages: stages } : current))
            }
            onSave={() => save({ crm: { stages: form.crmStages } }, "CRM settings saved")}
            saving={isSaving}
          />
        )}

        {activeTab === "integrations" && (
          <IntegrationSettings
            integrations={form.integrations}
            onChange={(integrations) =>
              setForm((current) => (current ? { ...current, integrations } : current))
            }
            onSave={() => save({ integrations: form.integrations }, "Integration settings saved")}
            saving={isSaving}
          />
        )}
      </DashboardCard>
    </div>
  );
}
