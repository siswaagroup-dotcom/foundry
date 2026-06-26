import type { WorkspaceInvitationRow, WorkspaceMemberRow, WorkspaceRole } from "@/types/team";

export type SettingsTab =
  | "workspace"
  | "profile"
  | "team"
  | "expense-policies"
  | "crm"
  | "integrations"
  | "billing";

export type SettingFieldType = "text" | "email" | "password" | "number" | "textarea";

export interface WorkspaceSetting {
  id: string;
  label: string;
  value: string;
  type?: SettingFieldType;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface CrmPipelineStage {
  id: string;
  label: string;
  position: number;
}

export interface SettingsData {
  workspace: {
    name: string;
    logoUrl: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    language: string;
  };
  profile: {
    name: string;
    avatarUrl: string;
    email: string;
    phone: string;
    jobTitle: string;
  };
  team: {
    members: WorkspaceMemberRow[];
    invitations: WorkspaceInvitationRow[];
  };
  expensePolicies: {
    approvalLevels: number;
    autoApprovalLimit: string;
    defaultCurrency: string;
    reimbursementRules: string;
  };
  crm: {
    stages: CrmPipelineStage[];
  };
  integrations: {
    resend: boolean;
    openai: boolean;
    github: boolean;
  };
}

export type SettingsPatch = Partial<{
  workspace: Partial<SettingsData["workspace"]>;
  profile: Partial<SettingsData["profile"]>;
  password: {
    currentPassword: string;
    newPassword: string;
  };
  expensePolicies: Partial<SettingsData["expensePolicies"]>;
  crm: {
    stages: CrmPipelineStage[];
  };
  integrations: Partial<SettingsData["integrations"]>;
}>;

export interface InviteMemberInput {
  email: string;
  role: Exclude<WorkspaceRole, "Owner">;
}
