"use client";

import { useMemo, useState } from "react";
import { notificationFilters } from "../data/notification-types";
import type { Notification, NotificationFilter } from "../types/notification-types";

function filterNotifications(notifications: Notification[], activeFilter: NotificationFilter) {
  if (activeFilter === "all") return notifications;
  if (activeFilter === "unread") {
    return notifications.filter((notification) => !notification.isRead);
  }

  return notifications.filter((notification) => {
    if (activeFilter === "tasks") return notification.type.startsWith("task_");
    if (activeFilter === "projects") return notification.type.startsWith("project_") || notification.type.startsWith("milestone_");
    if (activeFilter === "expenses") return notification.type.startsWith("expense_");
    if (activeFilter === "clients") return notification.type.startsWith("client_");
    if (activeFilter === "team") return notification.type.startsWith("team_");
    if (activeFilter === "settings") return notification.type.startsWith("settings_");
    return false;
  });
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
  }

  function deleteNotification(notificationId: string) {
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
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
    filters: notificationFilters,
  };
}
