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

export type IntegrationCredentials = {
  /** true when a key is stored in the DB — the actual key is never sent to the client */
  hasKey?: boolean;
  /** only populated by the client when the user types a new key to replace the existing one */
  newApiKey?: string;
};

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
    resendCredentials: IntegrationCredentials;
    openai: boolean;
    openaiCredentials: IntegrationCredentials;
    github: boolean;
    githubCredentials: IntegrationCredentials;
  };
}

export type IntegrationsPatch = {
  resend?: boolean;
  resendCredentials?: Pick<IntegrationCredentials, "newApiKey">;
  openai?: boolean;
  openaiCredentials?: Pick<IntegrationCredentials, "newApiKey">;
  github?: boolean;
  githubCredentials?: Pick<IntegrationCredentials, "newApiKey">;
};

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
  integrations: IntegrationsPatch;
}>;

export interface InviteMemberInput {
  email: string;
  role: Exclude<WorkspaceRole, "Owner">;
}
