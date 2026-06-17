import type { NotificationFilterOption, NotificationType } from "../types/notification-types";

export const notificationTypes: Record<NotificationType, string> = {
  "task-assigned": "Task Assigned",
  "expense-approved": "Expense Approved",
  "client-added": "Client Added",
  "post-scheduled": "Post Scheduled",
  "team-member-invited": "Team Member Invited",
  "role-updated": "Role Updated",
  "task-completed": "Task Completed",
  "expense-rejected": "Expense Rejected",
};

export const notificationFilters: NotificationFilterOption[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Tasks", value: "tasks" },
  { label: "Expenses", value: "expenses" },
  { label: "Clients", value: "clients" },
  { label: "Social", value: "social" },
  { label: "Team", value: "team" },
];
