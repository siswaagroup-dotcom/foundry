"use client";

import { memo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import type { ExpenseFilters, ExpenseStatus } from "@/types/expense";

type ExpensesFiltersProps = {
  filters: ExpenseFilters;
  onChange: (f: ExpenseFilters) => void;
};

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All Expenses",  value: ""          },
  { label: "Planned",       value: "planned"   },
  { label: "Pending",       value: "pending"   },
  { label: "Approved",      value: "approved"  },
  { label: "Incurred",      value: "incurred"  },
  { label: "Rejected",      value: "rejected"  },
];

const CATEGORY_OPTIONS = [
  "", "Marketing", "Office", "Software", "Travel", "Operations",
];

const SelectField = memo(function SelectField({
  label, value, options, onChange,
}: { label: string; value: string; options: { label: string; value: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label || "All Categories"}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
});

export const ExpensesFilters = memo(function ExpensesFilters({ filters, onChange }: ExpensesFiltersProps) {
  const setStatus   = useCallback((v: string) => onChange({ ...filters, status:   (v || undefined) as ExpenseStatus | undefined }), [filters, onChange]);
  const setCategory = useCallback((v: string) => onChange({ ...filters, category:  v || undefined }), [filters, onChange]);
  const setSearch   = useCallback((v: string) => onChange({ ...filters, search:    v || undefined }), [filters, onChange]);

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          label="Status"
          value={filters.status ?? ""}
          options={STATUS_OPTIONS}
          onChange={setStatus}
        />
        <SelectField
          label="Category"
          value={filters.category ?? ""}
          options={CATEGORY_OPTIONS.map((c) => ({ label: c || "All Categories", value: c }))}
          onChange={setCategory}
        />
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Search</span>
          <input
            value={filters.search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses…"
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </label>
      </div>
    </section>
  );
});
