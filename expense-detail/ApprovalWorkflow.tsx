import { Check } from "lucide-react";
import { WorkflowItem } from "./WorkflowItem";
import type { WorkflowStep } from "./types/expense-detail-types";

type ApprovalWorkflowProps = {
  workflowSteps: WorkflowStep[];
};

export function ApprovalWorkflow({ workflowSteps }: ApprovalWorkflowProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#edf0f3] px-5 py-4">
        <Check className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Approval Workflow</h3>
      </div>
      <div className="space-y-4 p-5">
        {workflowSteps.map((step) => (
          <WorkflowItem key={step.id} step={step} />
        ))}
      </div>
    </section>
  );
}
