// =============================================================================
// NOTIFICATION SERVICE — client-side fetch wrapper
// =============================================================================
import { apiDelete, apiGet, apiPatch } from "@/lib/api-client";
import type { NotificationItem, NotificationListResponse, NotificationQueryOptions } from "@/services/notification.server";

const BASE = "/api/notifications";

function buildQuery(options: NotificationQueryOptions = {}): string {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.filter) params.set("filter", options.filter);
  if (options.priority) params.set("priority", options.priority);
  if (options.type) params.set("type", options.type);
  if (options.dateRange) params.set("dateRange", options.dateRange);
  if (options.memberId) params.set("memberId", options.memberId);
  if (options.sort) params.set("sort", options.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const fetchNotifications = (options: NotificationQueryOptions = {}): Promise<NotificationListResponse> =>
  apiGet<NotificationListResponse>(`${BASE}${buildQuery(options)}`);

export const fetchUnreadCount = (): Promise<number> => apiGet<number>(`${BASE}/unread-count`);
export const markNotificationRead = (id: string): Promise<{ id: string }> => apiPatch<{ id: string }>(`${BASE}/${id}/read`, {});
export const markAllNotificationsRead = (): Promise<{ success: boolean }> => apiPatch<{ success: boolean }>(`${BASE}/read-all`, {});
export const deleteNotificationById = (id: string): Promise<{ id: string }> => apiDelete<{ id: string }>(`${BASE}/${id}`);

export type { NotificationItem, NotificationListResponse, NotificationQueryOptions };
