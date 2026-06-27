"use client";

import { ChevronDown } from "lucide-react";

type SelectFieldProps = {
  id: string;
  value: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function SelectField({ id, value, options, disabled, onChange }: SelectFieldProps) {
  return (
    <div className="relative mt-2">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-[10px] border border-[#e5e7eb] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-[#f8fafc] disabled:text-[#6b7280]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
    </div>
  );
}
