"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useRouter } from "next/navigation";
import { ApprovalRules } from "./ApprovalRules";
import { SettingsTabs } from "./SettingsTabs";
import { WorkspaceSettings } from "./WorkspaceSettings";
import { useSettings } from "./hooks/useSettings";

export function SettingsWorkspace() {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    workspaceFields,
    approvalRules,
    updateField,
    saveSettings,
  } = useSettings();
  const title = activeTab === "workspace" ? "Workspace" : "Approval Rules";

  function changeTab(tab: typeof activeTab) {
    if (tab === "billing") {
      router.push("/dashboard/billing");
      return;
    }

    setActiveTab(tab);
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Manage profile, workspace, billing, notification, and security settings.
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={changeTab} />

      <DashboardCard title={title}>
        {activeTab === "workspace" ? (
          <WorkspaceSettings
            fields={workspaceFields}
            onFieldChange={updateField}
            onSave={saveSettings}
          />
        ) : (
          <ApprovalRules approvalRules={approvalRules} />
        )}
      </DashboardCard>
    </div>
  );
}
