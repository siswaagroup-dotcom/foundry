import { Button } from "@/components/ui/button";
import { SettingsField } from "./SettingsField";
import type { WorkspaceSetting } from "./types/settings-types";

type WorkspaceSettingsProps = {
  fields: WorkspaceSetting[];
  onFieldChange: (id: string, value: string) => void;
  onSave: () => void;
};

export function WorkspaceSettings({
  fields,
  onFieldChange,
  onSave,
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
        <Button type="button" onClick={onSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
