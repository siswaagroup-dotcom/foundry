import type { NotificationItem as ServerNotificationItem } from "@/services/notification.server";

export type NotificationType = ServerNotificationItem["type"];

export type NotificationEntityType = NonNullable<ServerNotificationItem["entityType"]>;

export type NotificationFilter =
  | "all"
  | "unread"
  | "tasks"
  | "projects"
  | "expenses"
  | "clients"
  | "team"
  | "settings";

export type Notification = ServerNotificationItem & {
  actorName?: string | null;
  timeAgo: string;
};

export type NotificationFilterOption = {
  label: string;
  value: NotificationFilter;
};
