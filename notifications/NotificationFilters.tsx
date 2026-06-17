"use client";

import { notificationFilters } from "./data/notification-types";
import type { NotificationFilter } from "./types/notification-types";

type NotificationFiltersProps = {
  activeFilter: NotificationFilter;
  unreadCount: number;
  onFilterChange: (filter: NotificationFilter) => void;
};

export function NotificationFilters({
  activeFilter,
  unreadCount,
  onFilterChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {notificationFilters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              className={`h-9 rounded-[10px] border px-3 text-sm font-medium ${
                isActive
                  ? "border-primary bg-orange-50 text-primary"
                  : "border-[#e5e7eb] bg-white text-[#4b5563]"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <span className="text-sm font-medium text-[#4b5563]">
        {unreadCount} unread
      </span>
    </div>
  );
}
