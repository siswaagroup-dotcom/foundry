"use client";

import { ChevronDown } from "lucide-react";

const DATE_FORMATS = [
  { value: "DD/MM/YYYY",   label: "DD/MM/YYYY",   example: () => formatExample("DD/MM/YYYY")  },
  { value: "MM/DD/YYYY",   label: "MM/DD/YYYY",   example: () => formatExample("MM/DD/YYYY")  },
  { value: "YYYY-MM-DD",   label: "YYYY-MM-DD",   example: () => formatExample("YYYY-MM-DD")  },
  { value: "DD-MM-YYYY",   label: "DD-MM-YYYY",   example: () => formatExample("DD-MM-YYYY")  },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY", example: () => formatExample("MMM DD, YYYY")},
];

function formatExample(format: string): string {
  const d = new Date();
  const dd  = String(d.getDate()).padStart(2, "0");
  const mm  = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const mmm  = d.toLocaleString("en-US", { month: "short" });

  switch (format) {
    case "DD/MM/YYYY":   return `${dd}/${mm}/${yyyy}`;
    case "MM/DD/YYYY":   return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD":   return `${yyyy}-${mm}-${dd}`;
    case "DD-MM-YYYY":   return `${dd}-${mm}-${yyyy}`;
    case "MMM DD, YYYY": return `${mmm} ${dd}, ${yyyy}`;
    default:             return format;
  }
}

type DateFormatFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateFormatField({ id, value, onChange }: DateFormatFieldProps) {
  const preview = formatExample(value || "DD/MM/YYYY");

  return (
    <div className="space-y-2 mt-2">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-[10px] border border-[#e5e7eb] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {DATE_FORMATS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
      </div>
      <p className="rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-[#6b7280]">
        Preview: <span className="font-semibold text-[#111827]">{preview}</span>
      </p>
    </div>
  );
}
