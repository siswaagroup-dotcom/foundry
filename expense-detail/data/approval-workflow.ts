import type { WorkflowStep } from "../types/expense-detail-types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "workflow-1",
    title: "Submitted",
    approver: "Sarah Chen",
    timestamp: "Jan 15, 2026 at 2:30 PM",
    status: "Complete",
  },
  {
    id: "workflow-2",
    title: "Manager Approved",
    approver: "Michael Torres",
    timestamp: "Jan 16, 2026 at 10:15 AM",
    status: "Complete",
  },
  {
    id: "workflow-3",
    title: "Finance Approved",
    approver: "Lisa Anderson",
    timestamp: "Jan 17, 2026 at 3:45 PM",
    status: "Complete",
  },
];
