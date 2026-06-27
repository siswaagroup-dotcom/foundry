"use client";

// =============================================================================
// SettingsField — Generic field renderer
// Supports: text, email, password, number, textarea, select, image, date-format
// Uses a switch statement. Add new types here — never duplicate logic elsewhere.
// =============================================================================

import { Input } from "@/components/ui/input";
import type { WorkspaceSetting } from "../../types/settings-types";
import { SelectField } from "./SelectField";
import { ImageUploadField } from "./ImageUploadField";
import { DateFormatField } from "./DateFormatField";
import { getOptionsForKey } from "../../utils/field-options";

type SettingsFieldProps = {
  field: WorkspaceSetting;
  onChange: (id: string, value: string) => void;
};

const inputClass =
  "mt-2 flex min-h-10 w-full rounded-[10px] border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#9b9b9b] focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-[#f8fafc] disabled:text-[#6b7280]";

export function SettingsField({ field, onChange }: SettingsFieldProps) {
  const fieldType = field.type ?? "text";

  // Resolve options for select fields
  const options =
    field.options ??
    (field.optionsKey ? getOptionsForKey(field.optionsKey) : undefined);

  function renderControl() {
    switch (fieldType) {
      case "textarea":
        return (
          <textarea
            id={field.id}
            value={field.value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={4}
            className={inputClass}
          />
        );

      case "select":
        return (
          <SelectField
            id={field.id}
            value={field.value}
            options={options ?? []}
            disabled={field.disabled}
            onChange={(value) => onChange(field.id, value)}
          />
        );

      case "image":
        return (
          <ImageUploadField
            id={field.id}
            value={field.value}
            onChange={(value) => onChange(field.id, value)}
          />
        );

      case "date-format":
        return (
          <DateFormatField
            id={field.id}
            value={field.value}
            onChange={(value) => onChange(field.id, value)}
          />
        );

      // text | email | password | number
      default:
        return (
          <Input
            id={field.id}
            type={fieldType}
            value={field.value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className="mt-2"
          />
        );
    }
  }

  return (
    <div className="flex flex-col">
      <label
        htmlFor={field.id}
        className="text-sm font-semibold text-[#111827]"
      >
        {field.label}
      </label>

      {renderControl()}

      {field.helperText && (
        <span className="mt-1.5 text-xs text-[#6b7280]">{field.helperText}</span>
      )}
    </div>
  );
}
