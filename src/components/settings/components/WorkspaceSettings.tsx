import { Button } from "@/components/ui/button";
 
import type { WorkspaceSetting } from "../../../../settings/types/settings-types";
import { SettingsField } from "./fields/SettingsField";

type WorkspaceSettingsProps = {
  fields: WorkspaceSetting[];
  onFieldChange: (id: string, value: string) => void;
  onSave: () => void;
  saveLabel?: string;
  saving?: boolean;
};

export function WorkspaceSettings({
  fields,
  onFieldChange,
  onSave,
  saveLabel = "Save Settings",
  saving = false,
}: WorkspaceSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <SettingsField
            key={field.id}
            field={field}
            onChange={onFieldChange}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : saveLabel}
        </Button>
      </div>
    </div>
  );
}
