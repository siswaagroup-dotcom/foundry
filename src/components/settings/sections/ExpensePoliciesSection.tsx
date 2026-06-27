import { WorkspaceSettings } from "@/components/settings/components/WorkspaceSettings";
import type { WorkspaceSetting } from "../types/settings-types";

type Props = {
  fields: WorkspaceSetting[];
  onFieldChange: (id: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
};

export function ExpensePoliciesSection({ fields, onFieldChange, onSave, saving }: Props) {
  return (
    <WorkspaceSettings
      fields={fields}
      onFieldChange={onFieldChange}
      onSave={onSave}
      saveLabel="Save Policies"
      saving={saving}
    />
  );
}
