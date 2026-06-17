"use client";

import { memo, useCallback } from "react";
import { Search } from "lucide-react";
import type { TaskFilters, TaskPriority, TaskStatus } from "@/services/task.service";

type TasksFiltersProps = {
  filters: TaskFilters;
  onFiltersChange: (f: TaskFilters) => void;
};

export const TasksFilters = memo(function TasksFilters({
  filters,
  onFiltersChange,
}: TasksFiltersProps) {
  const set = useCallback(
    (patch: Partial<TaskFilters>) => onFiltersChange({ ...filters, ...patch }),
    [filters, onFiltersChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="h-10 rounded-lg border px-3 text-sm"
        value={filters.priority ?? ""}
        onChange={(e) =>
          set({ priority: (e.target.value as TaskPriority) || undefined })
        }
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <select
        className="h-10 rounded-lg border px-3 text-sm"
        value={filters.status ?? ""}
        onChange={(e) =>
          set({ status: (e.target.value as TaskStatus) || undefined })
        }
      >
        <option value="">All Statuses</option>
        <option value="todo">To Do</option>
        <option value="planning">Planning</option>
        <option value="doing">Doing</option>
        <option value="review">Review</option>
        <option value="done">Done</option>
      </select>

      <div className="relative min-w-[250px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search tasks..."
          value={filters.search ?? ""}
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none"
        />
      </div>
    </div>
  );
});
