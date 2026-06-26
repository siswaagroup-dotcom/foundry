import { WorkspaceSettings } from "@/components/dashboard/WorkspaceSettings";
import type { WorkspaceSetting } from "../types/settings-types";
import type { FormState } from "../utils/form-from-settings";

type Props = {
  fields: WorkspaceSetting[];
  workspace: FormState["workspace"];
  onFieldChange: (id: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
};

export function WorkspaceSection({ fields, onFieldChange, onSave, saving }: Props) {
  return (
    <WorkspaceSettings
      fields={fields}
      onFieldChange={onFieldChange}
      onSave={onSave}
      saving={saving}
    />
  );
}
