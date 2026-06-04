import type { ActivityLogItem } from "../types/task-details-types";

export const activityLogs: ActivityLogItem[] = [
  {
    id: "activity-1",
    user: "Sarah Kim",
    action: "added a comment",
    timestamp: "1 hour ago",
    type: "comment",
  },
  {
    id: "activity-2",
    user: "Alex Chen",
    action: "updated the due date",
    timestamp: "3 hours ago",
    type: "edit",
  },
  {
    id: "activity-3",
    user: "Alex Chen",
    action: "added as reviewer",
    timestamp: "5 hours ago",
    type: "reviewer",
  },
  {
    id: "activity-4",
    user: "Sarah Kim",
    action: "was assigned to this task",
    timestamp: "Yesterday",
    type: "assign",
  },
  {
    id: "activity-5",
    user: "Alex Chen",
    action: "created this task",
    timestamp: "Jan 15, 2026",
    type: "create",
  },
];
