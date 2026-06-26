export type SettingsTab =
  | "workspace"
  | "profile"
  | "team"
  | "expense-policies"
  | "crm"
  | "integrations"
  | "billing";

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
    openai: boolean;
    github: boolean;
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