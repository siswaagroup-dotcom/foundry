export type NotificationType =
  | "task-assigned"
  | "expense-approved"
  | "client-added"
  | "post-scheduled"
  | "team-member-invited"
  | "role-updated"
  | "task-completed"
  | "expense-rejected";

export type NotificationEntityType =
  | "task"
  | "expense"
  | "client"
  | "social"
  | "team";

export type NotificationFilter =
  | "all"
  | "unread"
  | "tasks"
  | "expenses"
  | "clients"
  | "social"
  | "team";

export type Notification = {
  id: string;
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  user: string;
  timestamp: string;
  entityType: NotificationEntityType;
  entityId: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationFilterOption = {
  label: string;
  value: NotificationFilter;
};
