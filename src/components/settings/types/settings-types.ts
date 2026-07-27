export type SettingsTab =
  | "workspace"
  | "profile"
  | "team"
  | "expense-policies"
  | "crm"
  | "integrations"
  | "billing";

export type IntegrationCredentials = {
  /** true when a key is stored in the DB — the actual key is never sent to the client */
  hasKey?: boolean;
  /** only populated by the client when the user types a new key to replace the existing one */
  newApiKey?: string;
};

export type WorkspaceSetting = {
  id: string;
  label: string;
  value: string;

  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "image"
    | "date-format";

  placeholder?: string;

  helperText?: string;

  disabled?: boolean;

  options?: {
    label: string;
    value: string;
  }[];

  optionsKey?: "timezones" | "currencies" | "languages";
};
export type CrmPipelineStage = {
  id: string;
  label: string;
  position: number;
};

export type SettingsData = {
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
  team: {
    members: {
      id: string;
      name: string;
      email: string;
      role: import("@/types/team").WorkspaceRole;
    }[];
    invitations: {
      id: string;
      email: string;
      role: string;
    }[];
  };
};