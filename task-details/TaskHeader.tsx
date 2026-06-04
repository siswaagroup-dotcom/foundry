import { ArrowLeft, MoreVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskDetails } from "./types/task-details-types";

type TaskHeaderProps = {
  task: TaskDetails;
  onBack: () => void;
  onSave: () => void;
  onMore: () => void;
};

export function TaskHeader({ task, onBack, onSave, onMore }: TaskHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e5e7eb] pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">{task.title}</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          {task.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onBack} className="h-10">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onSave} className="h-10">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
        <button
          type="button"
          onClick={onMore}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f8fafc]"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
