import { memo } from "react";
import { Search } from "lucide-react";

export const TasksFilters = memo(function TasksFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select className="h-10 rounded-lg border px-3 text-sm">
        <option>All Team</option>
      </select>

      <select className="h-10 rounded-lg border px-3 text-sm">
        <option>All Clients</option>
      </select>

      <select className="h-10 rounded-lg border px-3 text-sm">
        <option>All Priorities</option>
      </select>

      <div className="relative min-w-[250px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          placeholder="Search tasks..."
          className="h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none"
        />
      </div>
    </div>
  );
});
