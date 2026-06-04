import { Check } from "lucide-react";
import type { WorkflowStep } from "./types/expense-detail-types";

type WorkflowItemProps = {
  step: WorkflowStep;
};

export function WorkflowItem({ step }: WorkflowItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-[#f8fafc] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold">
          {step.title} by {step.approver}
        </p>
        <p className="mt-1 text-xs text-[#6b7280]">{step.timestamp}</p>
      </div>
    </div>
  );
}
