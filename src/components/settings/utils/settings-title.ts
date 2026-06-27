import type { SettingsTab } from "../types/settings-types";

export function titleFor(tab: SettingsTab): string {
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

