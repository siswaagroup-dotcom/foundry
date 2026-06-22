"use client";

import { memo } from "react";
import { SlidersHorizontal, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type SavedFiltersProps = {
  activeFilter: string;
  onSelect: (filter: string) => void;
  savedFilters?: string[];
};

const DEFAULT_FILTERS = [
  "Over Budget Expenses",
  "Pending Approvals",
  "Marketing Only",
  "This Quarter",
  "High Value ($10k+)",
];

export const SavedFilters = memo(function SavedFilters({
  activeFilter,
  onSelect,
  savedFilters = DEFAULT_FILTERS,
}: SavedFiltersProps) {
  return (
    <aside className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] lg:sticky lg:top-6">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        Saved Filters
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {savedFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onSelect(filter)}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950",
              activeFilter === filter && "bg-orange-50 text-orange-700",
            )}
          >
            <Star
              className={cn(
                "h-4 w-4 shrink-0 text-slate-400",
                activeFilter === filter && "fill-orange-500 text-orange-500",
              )}
            />
            <span className="min-w-0 truncate">{filter}</span>
          </button>
        ))}
      </div>
    </aside>
  );
});
