import { memo, useCallback } from "react";
import type { ChangeEvent } from "react";
import { Check, Search } from "lucide-react";

import type {
  ClientFilter,
  ClientFilterId,
} from "./types/client-types";

type ClientsFiltersProps = {
  filters: ClientFilter[];
  activeFilter: ClientFilterId;
  search: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: ClientFilterId) => void;
};

export const ClientsFilters = memo(function ClientsFilters({
  filters,
  activeFilter,
  search,
  onSearchChange,
  onFilterChange,
}: ClientsFiltersProps) {
  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onSearchChange(event.target.value),
    [onSearchChange],
  );

  return (
    <section className="space-y-1.5">
      <div className="relative w-full max-w-[360px]">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search clients..."
          className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-[#f15a24] focus:ring-2 focus:ring-[#f15a24]/10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = filter.id === activeFilter;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() =>
                onFilterChange(filter.id)
              }
              className={
                active
                  ? "inline-flex h-[30px] items-center gap-1 rounded-full bg-[#f15a24] px-4 text-[11px] font-bold text-white"
                  : "inline-flex h-[30px] items-center rounded-full border border-[#E5E7EB] bg-white px-4 text-[11px] font-medium text-[#111827]"
              }
            >
              {active && (
                <Check className="h-3 w-3" />
              )}
              {filter.label}
            </button>
          );
        })}
      </div>
    </section>
  );
});
