import { Input } from "@/components/ui/input";
import type { WorkspaceSetting } from "./types/settings-types";

type SettingsFieldProps = {
  field: WorkspaceSetting;
  onChange: (id: string, value: string) => void;
};

export function SettingsField({ field, onChange }: SettingsFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#111827]">
        {field.label}
      </span>
      <Input
        value={field.value}
        onChange={(event) => onChange(field.id, event.target.value)}
        placeholder={field.placeholder}
        className="mt-2"
      />
      {field.helperText ? (
        <span className="mt-2 block text-xs text-[#6b7280]">
          {field.helperText}
        </span>
      ) : null}
    </label>
  );
}
