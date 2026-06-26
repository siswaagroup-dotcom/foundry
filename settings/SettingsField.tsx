import { Input } from "@/components/ui/input";
import type { WorkspaceSetting } from "./types/settings-types";

type SettingsFieldProps = {
  field: WorkspaceSetting;
  onChange: (id: string, value: string) => void;
};

export function SettingsField({ field, onChange }: SettingsFieldProps) {
  const className =
    "mt-2 flex min-h-10 w-full rounded-[10px] border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#9b9b9b] focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-[#f8fafc] disabled:text-[#6b7280]";

  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#111827]">
        {field.label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          value={field.value}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={className}
          rows={4}
        />
      ) : (
        <Input
          type={field.type ?? "text"}
          value={field.value}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          disabled={field.disabled}
          className="mt-2"
        />
      )}
      {field.helperText ? (
        <span className="mt-2 block text-xs text-[#6b7280]">
          {field.helperText}
        </span>
      ) : null}
    </label>
  );
}
