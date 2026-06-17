"use client";

import { useMemo, useState } from "react";
import { notificationsData } from "../data/notifications-data";
import type {
  Notification,
  NotificationEntityType,
  NotificationFilter,
} from "../types/notification-types";

const filterEntityMap: Partial<Record<NotificationFilter, NotificationEntityType>> = {
  tasks: "task",
  expenses: "expense",
  clients: "client",
  social: "social",
  team: "team",
};

function filterNotifications(
  notifications: Notification[],
  activeFilter: NotificationFilter,
) {
  if (activeFilter === "all") return notifications;
  if (activeFilter === "unread") {
    return notifications.filter((notification) => !notification.isRead);
  }

  return notifications.filter(
    (notification) => notification.entityType === filterEntityMap[activeFilter],
  );
}

export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(notificationsData);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");

  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, activeFilter),
    [notifications, activeFilter],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  function markAsRead(notificationId: string) {
    console.log(notificationId);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  }

  function markAllAsRead() {
    console.log("mark-all-read");
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
  }

  function deleteNotification(notificationId: string) {
    console.log(notificationId);
    setNotifications((current) =>
      current.filter((notification) => notification.id !== notificationId),
    );
  }

  return {
    notifications,
    filteredNotifications,
    activeFilter,
    unreadCount,
    setActiveFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
