import type { SettingsData, WorkspaceSetting } from "../types/settings-types";
import type { FormState } from "./form-from-settings";


export function workspaceFields(
  values: SettingsData["workspace"]
): WorkspaceSetting[] {
  return [
    {
      id: "name",
      label: "Workspace Name",
      value: values.name,
      type: "text",
      placeholder: "Enter workspace name",
    },

    {
      id: "logoUrl",
      label: "Workspace Logo",
      value: values.logoUrl,
      type: "image",
      helperText: "PNG, JPG, SVG or WEBP (Max 2MB)",
    },

    {
      id: "timezone",
      label: "Timezone",
      value: values.timezone,
      type: "select",
      optionsKey: "timezones",
      helperText: "Used for reports, reminders and scheduling.",
    },

    {
      id: "currency",
      label: "Currency",
      value: values.currency,
      type: "select",
      optionsKey: "currencies",
      helperText: "Default currency for invoices and expenses.",
    },

    {
      id: "dateFormat",
      label: "Date Format",
      value: values.dateFormat,
      type: "date-format",
      helperText: "How dates are displayed throughout the workspace.",
    },

    {
      id: "language",
      label: "Language",
      value: values.language,
      type: "select",
      optionsKey: "languages",
      helperText: "Language used throughout the Foundry workspace.",
    },
  ];
}

export function profileFields(values: SettingsData["profile"]): WorkspaceSetting[] {
  return [
    { id: "name", label: "Name", value: values.name },
    { id: "avatarUrl", label: "Avatar", value: values.avatarUrl },
    { id: "email", label: "Email", value: values.email, type: "email", disabled: true },
    { id: "phone", label: "Phone", value: values.phone },
    { id: "jobTitle", label: "Job Title", value: values.jobTitle },
  ];
}

export function expenseFields(values: SettingsData["expensePolicies"]): WorkspaceSetting[] {
  return [
    { id: "approvalLevels", label: "Approval Levels", value: String(values.approvalLevels), type: "number" },
    { id: "autoApprovalLimit", label: "Auto Approval Limits", value: values.autoApprovalLimit, type: "number" },
    { id: "defaultCurrency", label: "Default Currency", value: values.defaultCurrency },
    { id: "reimbursementRules", label: "Reimbursement Rules", value: values.reimbursementRules, type: "textarea" },
  ];
}

export function passwordFields(values: FormState["password"]): WorkspaceSetting[] {
  return [
    { id: "currentPassword", label: "Current Password", value: values.currentPassword, type: "password" },
    { id: "newPassword", label: "New Password", value: values.newPassword, type: "password" },
  ];
}
