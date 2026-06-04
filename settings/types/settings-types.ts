export interface WorkspaceSetting {
  id: string;
  label: string;
  value: string;
  helperText?: string;
  placeholder?: string;
}

export interface ApprovalRule {
  id: string;
  title: string;
  value: string;
  description?: string;
}

export type SettingsTab = "workspace" | "approval-rules";
