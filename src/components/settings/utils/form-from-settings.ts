import type { WorkspaceRole } from "@/types/team";
import type { CrmPipelineStage, SettingsData } from "../types/settings-types";

export type FormState = {
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

export function formFromSettings(settings: SettingsData): FormState {
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
