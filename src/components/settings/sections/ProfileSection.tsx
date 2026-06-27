import { WorkspaceSettings } from "@/components/settings/components/WorkspaceSettings";
import type { WorkspaceSetting } from "../types/settings-types";
import type { FormState } from "../utils/form-from-settings";
import { passwordFields } from "../utils/settings-fields";

type Props = {
  fields: WorkspaceSetting[];
  password: FormState["password"];
  onProfileFieldChange: (id: string, value: string) => void;
  onPasswordFieldChange: (id: string, value: string) => void;
  onSaveProfile: () => void;
  onSavePassword: () => void;
  saving: boolean;
};

export function ProfileSection({
  fields,
  password,
  onProfileFieldChange,
  onPasswordFieldChange,
  onSaveProfile,
  onSavePassword,
  saving,
}: Props) {
  return (
    <div className="space-y-8">
      <WorkspaceSettings
        fields={fields}
        onFieldChange={onProfileFieldChange}
        onSave={onSaveProfile}
        saveLabel="Save Profile"
        saving={saving}
      />
      <WorkspaceSettings
        fields={passwordFields(password)}
        onFieldChange={onPasswordFieldChange}
        onSave={onSavePassword}
        saveLabel="Change Password"
        saving={saving}
      />
    </div>
  );
}
