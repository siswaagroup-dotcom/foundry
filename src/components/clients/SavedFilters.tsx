"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { useClientFilterCounts } from "@/hooks/useClients";
import type { SavedClientFilter, SavedClientFilterId } from "./types/client-types";

type SavedFiltersProps = {
  filters: SavedClientFilter[];
  activeFilter: SavedClientFilterId | null;
  onSelect: (filter: SavedClientFilterId) => void;
};

// Maps saved filter id → count field name from the API
const COUNT_MAP: Partial<Record<SavedClientFilterId, string>> = {
  "enterprise-clients": "enterpriseClients",
  "active-this-week":   "activeThisWeek",
  "high-priority":      "highPriority",
  "premium-tier":       "premiumTier",
  "inactive-30-days":   "inactive30Days",
};

export const SavedFilters = memo(function SavedFilters({
  filters,
  activeFilter,
  onSelect,
}: SavedFiltersProps) {
  const { data: counts } = useClientFilterCounts();

  return (
    <aside className="border-t border-[#E5E7EB] bg-[#f8fafc] px-4 py-5 lg:border-l lg:border-t-0">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5f6b7a]">
        Saved Filters
      </h2>

      <div className="space-y-2">
        {filters.map((filter) => {
          const countKey = COUNT_MAP[filter.id];
          const liveCount = counts && countKey ? (counts as Record<string, number>)[countKey] : null;
          const displayCount = liveCount ?? filter.count;

          return (
            <button
              key={filter.name}
              type="button"
              onClick={() => onSelect(filter.id)}
              className={cn(
                "flex h-[37px] w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3 text-left text-[12px] font-bold text-[#0f172a] shadow-[0_1px_1px_rgba(15,23,42,0.02)]",
                activeFilter === filter.id && "border-[#f15a24]"
              )}
            >
              <span className="truncate">{filter.name}</span>
              <span className="ml-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#eef2ff] px-1.5 text-[10px] font-bold text-[#64748b]">
                {displayCount}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
});
