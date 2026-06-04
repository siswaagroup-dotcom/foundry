import type { ActivityLogItem } from "../types/expense-detail-types";

export const activityLog: ActivityLogItem[] = [
  {
    id: "activity-1",
    action: "Approved by Finance",
    timestamp: "2 days ago",
    type: "approved",
  },
  {
    id: "activity-2",
    action: "Approved by Manager",
    timestamp: "3 days ago",
    type: "approved",
  },
  {
    id: "activity-3",
    action: "Expense created",
    timestamp: "4 days ago",
    type: "created",
  },
  {
    id: "activity-4",
    action: "Note added",
    timestamp: "4 days ago",
    type: "note",
  },
];
