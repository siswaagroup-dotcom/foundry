import { memo } from "react";
import { Plus } from "lucide-react";

type TasksHeaderProps = {
  onCreateTask?: () => void;
};

export const TasksHeader = memo(function TasksHeader({ onCreateTask }: TasksHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-slate-900">
        Tasks
      </h1>

      <div className="flex items-center rounded-lg border bg-white p-1">
        <button
          type="button"
          onClick={onCreateTask}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>

        <button className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white">
          Board
        </button>

        <button className="px-4 py-2 text-sm font-medium text-slate-600">
          List
        </button>
      </div>
    </div>
  );
});
