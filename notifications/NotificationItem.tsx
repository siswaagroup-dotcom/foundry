"use client";

import { Button } from "@/components/ui/button";
import { notificationTypes } from "./data/notification-types";
import type { Notification } from "./types/notification-types";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div className="flex gap-3">
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            notification.isRead ? "bg-[#d1d5db]" : "bg-primary"
          }`}
          aria-label={notification.isRead ? "Read" : "Unread"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827]">
                {notification.title}
              </p>
              <p className="text-xs text-[#6b7280]">
                {notificationTypes[notification.type]} • {notification.timestamp}
              </p>
            </div>
            <p className="text-xs text-[#6b7280]">{notification.user}</p>
          </div>
          <p className="mt-2 text-sm leading-5 text-[#374151]">
            {notification.description}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {!notification.isRead && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-9"
              >
                Mark as Read
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onDelete(notification.id)}
              className="h-9"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
