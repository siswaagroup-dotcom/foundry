import type { ActivityLogItem } from "../types/social-post-detail-types";

export const activityLog: ActivityLogItem[] = [
  {
    id: "activity-1",
    user: "Sarah Chen",
    action: "scheduled post for March 15",
    timestamp: "2 hours ago",
    type: "schedule",
  },
  {
    id: "activity-2",
    user: "Mike Torres",
    action: "uploaded media attachment",
    timestamp: "3 hours ago",
    type: "media",
  },
  {
    id: "activity-3",
    user: "Sarah Chen",
    action: "updated post caption",
    timestamp: "4 hours ago",
    type: "edit",
  },
  {
    id: "activity-4",
    user: "Sarah Chen",
    action: "created draft post",
    timestamp: "Yesterday at 3:24 PM",
    type: "create",
  },
];
