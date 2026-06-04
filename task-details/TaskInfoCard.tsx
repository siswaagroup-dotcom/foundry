import { AlertTriangle, ClipboardList } from "lucide-react";
import type { TaskDetails } from "./types/task-details-types";

type TaskInfoCardProps = {
  task: TaskDetails;
};

export function TaskInfoCard({ task }: TaskInfoCardProps) {
  return (
    <section className="rounded-xl border-l-2 border-primary bg-[#e9edff] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Task Details</h3>
      </div>

      <p className="rounded-lg bg-white p-4 text-sm leading-6 text-[#111827]">
        {task.description}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase text-[#6b7280]">
            Created
          </p>
          <p className="mt-2 text-sm font-bold">{task.createdAt}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase text-[#6b7280]">
            Last Updated
          </p>
          <p className="mt-2 text-sm font-bold">{task.updatedAt}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase text-[#6b7280]">
            Urgency
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {task.urgency}
          </p>
        </div>
      </div>
    </section>
  );
}
