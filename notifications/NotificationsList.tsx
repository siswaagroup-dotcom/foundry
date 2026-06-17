"use client";

import { NotificationItem } from "./NotificationItem";
import type { Notification } from "./types/notification-types";

type NotificationsListProps = {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
};

export function NotificationsList({
  notifications,
  onMarkAsRead,
  onDelete,
}: NotificationsListProps) {
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
