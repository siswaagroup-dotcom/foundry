"use client";

import { ChevronDown } from "lucide-react";
import { expenseFilterOptions } from "@/data/expenses";
import type { ExpenseFilters } from "@/types/expense";

type ExpensesFiltersProps = {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

export function ExpensesFilters({ filters, onChange }: ExpensesFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={expenseFilterOptions.status}
          onChange={(status) => onChange({ ...filters, status })}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          options={expenseFilterOptions.category}
          onChange={(category) => onChange({ ...filters, category })}
        />
        <FilterSelect
          label="Date Range"
          value={filters.dateRange}
          options={expenseFilterOptions.dateRange}
          onChange={(dateRange) => onChange({ ...filters, dateRange })}
        />
        <FilterSelect
          label="Amount Range"
          value={filters.amountRange}
          options={expenseFilterOptions.amountRange}
          onChange={(amountRange) => onChange({ ...filters, amountRange })}
        />
      </div>
    </section>
  );
}
