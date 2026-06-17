"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { businessTypes } from "./data/business-types";
import { currencies } from "./data/currencies";
import { timezones } from "./data/timezones";
import { useCreateWorkspace } from "./hooks/useCreateWorkspace";
import type { SelectOption, WorkspaceFormData } from "./types/workspace-types";

type SelectFieldProps = {
  id: keyof WorkspaceFormData;
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (field: keyof WorkspaceFormData, value: string) => void;
};

function SelectField({
  id,
  label,
  value,
  error,
  placeholder,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} <span className="text-primary">*</span>
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        className="h-11 w-full rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="min-h-4 text-xs leading-4 text-primary">{error}</p>
    </div>
  );
}

export function CreateWorkspaceForm() {
  const workspace = useCreateWorkspace();
  const router = useRouter();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const createdWorkspace = workspace.createWorkspace();
        if (createdWorkspace) router.push("/dashboard");
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Workspace Name <span className="text-primary">*</span>
        </Label>
        <Input
          id="name"
          value={workspace.formData.name}
          onChange={(event) => workspace.updateField("name", event.target.value)}
          placeholder="Acme Studio"
          autoComplete="organization"
          aria-invalid={Boolean(workspace.errors.name)}
        />
        <p className="min-h-4 text-xs leading-4 text-primary">
          {workspace.errors.name}
        </p>
      </div>

      <SelectField
        id="businessType"
        label="Business Type"
        value={workspace.formData.businessType}
        error={workspace.errors.businessType}
        placeholder="Select business type"
        options={businessTypes}
        onChange={workspace.updateField}
      />

      <SelectField
        id="timezone"
        label="Timezone"
        value={workspace.formData.timezone}
        error={workspace.errors.timezone}
        placeholder="Select timezone"
        options={timezones}
        onChange={workspace.updateField}
      />

      <SelectField
        id="currency"
        label="Currency"
        value={workspace.formData.currency}
        error={workspace.errors.currency}
        placeholder="Select currency"
        options={currencies}
        onChange={workspace.updateField}
      />

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={workspace.cancel}>
          Cancel
        </Button>
        <Button type="submit">Create Workspace</Button>
      </div>
    </form>
  );
}
