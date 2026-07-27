"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useSettings } from "@/hooks/useSettings";
import type { WorkspaceRole } from "@/types/team";
import { SettingsTabs } from "./SettingsTabs";
import { WorkspaceSettings } from "../src/components/settings/components/WorkspaceSettings";
import type { CrmPipelineStage, SettingsData, SettingsTab, WorkspaceSetting } from "./types/settings-types";

type FormState = {
  workspace: SettingsData["workspace"];
  profile: SettingsData["profile"];
  password: {
    currentPassword: string;
    newPassword: string;
  };
  expensePolicies: SettingsData["expensePolicies"];
  crmStages: CrmPipelineStage[];
  integrations: SettingsData["integrations"];
  invite: {
    email: string;
    role: Exclude<WorkspaceRole, "Owner">;
  };
};

const editableRoles: Exclude<WorkspaceRole, "Owner">[] = ["Admin", "Manager", "Member", "Viewer"];

function formFromSettings(settings: SettingsData): FormState {
  return {
    workspace: settings.workspace,
    profile: settings.profile,
    password: { currentPassword: "", newPassword: "" },
    expensePolicies: settings.expensePolicies,
    crmStages: settings.crm.stages,
    integrations: settings.integrations,
    invite: { email: "", role: "Member" },
  };
}

function workspaceFields(values: SettingsData["workspace"]): WorkspaceSetting[] {
  return [
    { id: "name", label: "Workspace Name", value: values.name },
    { id: "logoUrl", label: "Logo", value: values.logoUrl },
    { id: "timezone", label: "Timezone", value: values.timezone },
    { id: "currency", label: "Currency", value: values.currency },
    { id: "dateFormat", label: "Date Format", value: values.dateFormat },
    { id: "language", label: "Language", value: values.language },
  ];
}

function profileFields(values: SettingsData["profile"]): WorkspaceSetting[] {
  return [
    { id: "name", label: "Name", value: values.name },
    { id: "avatarUrl", label: "Avatar", value: values.avatarUrl },
    { id: "email", label: "Email", value: values.email, type: "email", disabled: true },
    { id: "phone", label: "Phone", value: values.phone },
    { id: "jobTitle", label: "Job Title", value: values.jobTitle },
  ];
}

function expenseFields(values: SettingsData["expensePolicies"]): WorkspaceSetting[] {
  return [
    { id: "approvalLevels", label: "Approval Levels", value: String(values.approvalLevels), type: "number" },
    { id: "autoApprovalLimit", label: "Auto Approval Limits", value: values.autoApprovalLimit, type: "number" },
    { id: "defaultCurrency", label: "Default Currency", value: values.defaultCurrency },
    { id: "reimbursementRules", label: "Reimbursement Rules", value: values.reimbursementRules, type: "textarea" },
  ];
}

function passwordFields(values: FormState["password"]): WorkspaceSetting[] {
  return [
    { id: "currentPassword", label: "Current Password", value: values.currentPassword, type: "password" },
    { id: "newPassword", label: "New Password", value: values.newPassword, type: "password" },
  ];
}

function titleFor(tab: SettingsTab) {
  switch (tab) {
    case "workspace":
      return "Workspace";
    case "profile":
      return "Profile";
    case "team":
      return "Team";
    case "expense-policies":
      return "Expense Policies";
    case "crm":
      return "CRM Settings";
    case "integrations":
      return "Integrations";
    case "billing":
      return "Billing";
  }
}

export function SettingsWorkspace() {
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
        {activeTab === "workspace" ? (
          <WorkspaceSettings
            fields={currentFields}
            onFieldChange={(id, value) =>
              setForm((current) =>
                current ? { ...current, workspace: { ...current.workspace, [id]: value } } : current
              )
            }
            onSave={() => save({ workspace: form.workspace }, "Workspace settings saved")}
            saving={isSaving}
          />
        ) : null}

        {activeTab === "profile" ? (
          <div className="space-y-8">
            <WorkspaceSettings
              fields={currentFields}
              onFieldChange={(id, value) =>
                setForm((current) =>
                  current ? { ...current, profile: { ...current.profile, [id]: value } } : current
                )
              }
              onSave={() => save({ profile: form.profile }, "Profile settings saved")}
              saveLabel="Save Profile"
              saving={isSaving}
            />
            <WorkspaceSettings
              fields={passwordFields(form.password)}
              onFieldChange={(id, value) =>
                setForm((current) =>
                  current ? { ...current, password: { ...current.password, [id]: value } } : current
                )
              }
              onSave={() =>
                save({ password: form.password }, "Password changed")
              }
              saveLabel="Change Password"
              saving={isSaving}
            />
          </div>
        ) : null}

        {activeTab === "team" ? (
          <TeamSettings
            data={settings.team}
            invite={form.invite}
            onInviteChange={(next) => setForm((current) => current ? { ...current, invite: next } : current)}
            onInvite={() =>
              inviteMember.mutate(form.invite, {
                onSuccess: () => {
                  setForm((current) => current ? { ...current, invite: { ...current.invite, email: "" } } : current);
                  toast({ title: "Invitation sent", variant: "success" });
                },
                onError: (error) => toast({ title: "Invitation failed", description: error.message, variant: "error" }),
              })
            }
            onRoleChange={(memberId, role) =>
              changeMemberRole.mutate({ memberId, role }, {
                onSuccess: () => toast({ title: "Role updated", variant: "success" }),
                onError: (error) => toast({ title: "Role update failed", description: error.message, variant: "error" }),
              })
            }
            onRemove={(memberId) =>
              removeMember.mutate(memberId, {
                onSuccess: () => toast({ title: "Member removed", variant: "success" }),
                onError: (error) => toast({ title: "Remove failed", description: error.message, variant: "error" }),
              })
            }
            onResend={(invitationId) =>
              resendInvitation.mutate(invitationId, {
                onSuccess: () => toast({ title: "Invitation resent", variant: "success" }),
                onError: (error) => toast({ title: "Resend failed", description: error.message, variant: "error" }),
              })
            }
            onRevoke={(invitationId) =>
              revokeInvitation.mutate(invitationId, {
                onSuccess: () => toast({ title: "Invitation revoked", variant: "success" }),
                onError: (error) => toast({ title: "Revoke failed", description: error.message, variant: "error" }),
              })
            }
          />
        ) : null}

        {activeTab === "expense-policies" ? (
          <WorkspaceSettings
            fields={currentFields}
            onFieldChange={(id, value) =>
              setForm((current) =>
                current ? { ...current, expensePolicies: { ...current.expensePolicies, [id]: value } } : current
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
            saveLabel="Save Policies"
            saving={isSaving}
          />
        ) : null}

        {activeTab === "crm" ? (
          <CrmSettings
            stages={form.crmStages}
            onChange={(stages) => setForm((current) => current ? { ...current, crmStages: stages } : current)}
            onSave={() => save({ crm: { stages: form.crmStages } }, "CRM settings saved")}
            saving={isSaving}
          />
        ) : null}

        {activeTab === "integrations" ? (
          <IntegrationSettings
            integrations={form.integrations}
            onChange={(integrations) => setForm((current) => current ? { ...current, integrations } : current)}
            onSave={() => save({ integrations: form.integrations }, "Integration settings saved")}
            saving={isSaving}
          />
        ) : null}
      </DashboardCard>
    </div>
  );
}

function TeamSettings({
  data,
  invite,
  onInviteChange,
  onInvite,
  onRoleChange,
  onRemove,
  onResend,
  onRevoke,
}: {
  data: SettingsData["team"];
  invite: FormState["invite"];
  onInviteChange: (invite: FormState["invite"]) => void;
  onInvite: () => void;
  onRoleChange: (memberId: string, role: Exclude<WorkspaceRole, "Owner">) => void;
  onRemove: (memberId: string) => void;
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
}) {
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
          onChange={(event) => onInviteChange({ ...invite, role: event.target.value as Exclude<WorkspaceRole, "Owner"> })}
          className="h-12 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#111827]"
        >
          {editableRoles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <Button type="button" onClick={onInvite}>
          <Plus className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#edf0f3]">
        {data.members.map((member) => (
          <div key={member.id} className="grid gap-3 border-b border-[#edf0f3] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold text-[#111827]">{member.name}</p>
              <p className="text-xs text-[#6b7280]">{member.email}</p>
            </div>
            <select
              value={member.role}
              disabled={member.role === "Owner"}
              onChange={(event) => onRoleChange(member.id, event.target.value as Exclude<WorkspaceRole, "Owner">)}
              className="h-10 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827] disabled:bg-[#f8fafc]"
            >
              {member.role === "Owner" ? <option value="Owner">Owner</option> : null}
              {editableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={() => onRemove(member.id)} disabled={member.role === "Owner"}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#111827]">Pending Invitations</h3>
        {data.invitations.length === 0 ? (
          <p className="rounded-xl border border-[#edf0f3] p-4 text-sm text-[#6b7280]">No pending invitations.</p>
        ) : (
          data.invitations.map((invitation) => (
            <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#edf0f3] p-4">
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

function CrmSettings({
  stages,
  onChange,
  onSave,
  saving,
}: {
  stages: CrmPipelineStage[];
  onChange: (stages: CrmPipelineStage[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  function updateStage(index: number, label: string) {
    onChange(stages.map((stage, currentIndex) => currentIndex === index ? { ...stage, label } : stage));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {stages.map((stage, index) => (
          <label key={`${stage.id}-${stage.position}`} className="block">
            <span className="text-sm font-semibold text-[#111827]">Stage {stage.position}</span>
            <Input value={stage.label} onChange={(event) => updateStage(index, event.target.value)} className="mt-2" />
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save CRM Settings"}
        </Button>
      </div>
    </div>
  );
}

type IntegrationId = "resend" | "openai" | "github";

type IntegrationItem = {
  id: IntegrationId;
  label: string;
  description: string;
  credentialsKey: "resendCredentials" | "openaiCredentials" | "githubCredentials";
  fieldLabel: string;
  emptyPlaceholder: string;
  existsPlaceholder: string;
};

const INTEGRATION_ITEMS: IntegrationItem[] = [
  {
    id: "resend",
    label: "Resend",
    description: "Transactional email delivery for invitations and notifications.",
    credentialsKey: "resendCredentials",
    fieldLabel: "API Key",
    emptyPlaceholder: "re_xxxxxxxxxxxxxxxxxxxxxxxx",
    existsPlaceholder: "Enter new key to replace existing",
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "AI-powered features across the workspace.",
    credentialsKey: "openaiCredentials",
    fieldLabel: "API Key",
    emptyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
    existsPlaceholder: "Enter new key to replace existing",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Link pull requests and issues to tasks and projects.",
    credentialsKey: "githubCredentials",
    fieldLabel: "Personal Access Token",
    emptyPlaceholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
    existsPlaceholder: "Enter new token to replace existing",
  },
];

function IntegrationSettings({
  integrations,
  onChange,
  onSave,
  saving,
}: {
  integrations: SettingsData["integrations"];
  onChange: (integrations: SettingsData["integrations"]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [expanded, setExpanded] = useState<IntegrationId | null>(null);

  return (
    <div className="space-y-4">
      <div className="divide-y divide-[#edf0f3] rounded-xl border border-[#edf0f3] bg-white overflow-hidden">
        {INTEGRATION_ITEMS.map((item) => {
          const connected = integrations[item.id];
          const credentials = integrations[item.credentialsKey] ?? {};
          const hasExistingKey = Boolean(credentials.hasKey);
          const currentInput = credentials.newApiKey ?? "";
          const isExpanded = expanded === item.id;
          const ConnectedIcon = connected ? CheckCircle2 : Circle;

          return (
            <div key={item.id}>
              <div className="flex items-center gap-4 p-4">
                <button
                  type="button"
                  onClick={() => onChange({ ...integrations, [item.id]: !connected })}
                  className="flex-shrink-0"
                >
                  <ConnectedIcon
                    className={connected ? "h-5 w-5 text-emerald-600" : "h-5 w-5 text-[#9ca3af]"}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#111827]">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-[#6b7280]">{item.description}</span>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    connected ? "bg-emerald-50 text-emerald-700" : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {connected ? "Connected" : "Disconnected"}
                </span>
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => (prev === item.id ? null : item.id))}
                  className="flex-shrink-0 rounded-md p-1 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors text-xs font-medium"
                >
                  {isExpanded ? "▲" : "▼"}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-[#edf0f3] bg-[#f9fafb] px-4 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#374151]">{item.fieldLabel}</span>
                    {hasExistingKey && (
                      <span className="text-xs text-emerald-600 font-medium">● Key saved</span>
                    )}
                  </div>
                  <Input
                    type="password"
                    value={currentInput}
                    onChange={(e) =>
                      onChange({
                        ...integrations,
                        [item.credentialsKey]: { ...credentials, newApiKey: e.target.value },
                      })
                    }
                    placeholder={hasExistingKey ? item.existsPlaceholder : item.emptyPlaceholder}
                    className="h-9 font-mono text-sm"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {hasExistingKey && (
                    <p className="text-xs text-[#9ca3af]">
                      A key is already saved. Leave blank to keep it, or type a new one to replace.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Integrations"}
        </Button>
      </div>
    </div>
  );
}
