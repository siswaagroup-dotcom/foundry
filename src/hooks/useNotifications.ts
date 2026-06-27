"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  deleteNotificationById,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem as ServerNotificationItem,
  type NotificationListResponse,
  type NotificationQueryOptions,
} from "@/services/notification.service";
import type { Notification, NotificationFilter } from "../../notifications/types/notification-types";

export const NOTIFICATIONS_KEY = ["notifications"] as const;
export const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

function normalizeFilter(filter: string | undefined): NotificationFilter {
  return filter === "unread" || filter === "tasks" || filter === "projects" || filter === "expenses" || filter === "clients" || filter === "team" || filter === "settings"
    ? filter
    : "all";
}

function buildQueryKey(options: NotificationQueryOptions = {}) {
  return [...NOTIFICATIONS_KEY, options] as const;
}

function formatTimeAgo(createdAt: string): string {
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
  if (deltaSeconds < 60) return "Just now";

  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;

  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;

  const deltaDays = Math.floor(deltaHours / 24);
  if (deltaDays < 30) return `${deltaDays}d ago`;

  return new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toNotification(item: ServerNotificationItem): Notification {
  return {
    ...item,
    actorName: null,
    timeAgo: formatTimeAgo(item.createdAt),
  };
}

export function useNotifications(options: NotificationQueryOptions = {}) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>(normalizeFilter(options.filter));
  const [priority, setPriority] = useState(options.priority);
  const [type, setType] = useState(options.type);
  const [dateRange, setDateRange] = useState(options.dateRange);
  const [memberId, setMemberId] = useState(options.memberId);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const queryOptions = useMemo<NotificationQueryOptions>(
    () => ({
      page,
      limit: options.limit ?? 15,
      filter: activeFilter === "all" ? undefined : activeFilter,
      priority,
      type,
      dateRange,
      memberId,
      sort: "desc",
    }),
    [activeFilter, dateRange, memberId, options.limit, page, priority, type],
  );

  const query = useQuery<NotificationListResponse>({
    queryKey: buildQueryKey(queryOptions),
    queryFn: () => fetchNotifications(queryOptions),
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!query.data) return;
    const nextItems = query.data.items.map(toNotification);
    if (page === 1) {
      setItems(nextItems);
    } else {
      setItems((current) => [...current, ...nextItems]);
    }
    setHasLoadedOnce(true);
  }, [page, query.data]);

useEffect(() => {
  setPage(1);
  setHasLoadedOnce(false);

  query.refetch();
}, [
  activeFilter,
  priority,
  type,
  dateRange,
  memberId,
]);

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY }),
      ]);
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY }),
      ]);
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => deleteNotificationById(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY }),
      ]);
    },
  });

  const queryClient = useQueryClient();

  return {
    items,
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isPending && !hasLoadedOnce,
    isFetching: query.isFetching,
    hasMore: query.data?.pagination.hasMore ?? false,
    activeFilter,
    setActiveFilter,
    priority,
    setPriority,
    type,
    setType,
    dateRange,
    setDateRange,
    memberId,
    setMemberId,
    loadMore: () => setPage((current) => current + 1),
    reset: () => {
      setPage(1);
      setItems([]);
      setActiveFilter("all");
      setPriority(undefined);
      setType(undefined);
      setDateRange(undefined);
      setMemberId(undefined);
    },
    markAsRead: markRead.mutate,
    markAllAsRead: markAllRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isMarkingRead: markRead.isPending,
    isMarkingAllRead: markAllRead.isPending,
    isDeleting: deleteNotification.isPending,
  };
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: fetchUnreadCount,
    staleTime: 15_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY }),
      ]);
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY }),
      ]);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotificationById(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY }),
      ]);
    },
  });
}
