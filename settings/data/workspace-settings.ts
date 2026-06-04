import type { WorkspaceSetting } from "../types/settings-types";

export const workspaceSettings: WorkspaceSetting[] = [
  {
    id: "workspaceName",
    label: "Workspace Name",
    value: "Acme Projects",
    placeholder: "Enter workspace name",
  },
  {
    id: "timezone",
    label: "Timezone",
    value: "Asia/Calcutta",
    helperText: "Used for reminders, reports, and team activity.",
    placeholder: "Enter timezone",
  },
  {
    id: "defaultCurrency",
    label: "Default Currency",
    value: "USD",
    placeholder: "Enter default currency",
  },
  {
    id: "businessType",
    label: "Business Type",
    value: "Agency",
    placeholder: "Enter business type",
  },
];
