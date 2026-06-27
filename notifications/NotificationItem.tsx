"use client";

import Link from "next/link";
import { Bell, Clock3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationTypes } from "./data/notification-types";
import type { Notification } from "./types/notification-types";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
};

const priorityClasses: Record<string, string> = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  normal: "border-slate-200 bg-slate-50 text-slate-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const entityHref = notification.entityType && notification.entityId
    ? `/${notification.entityType === "team" ? "dashboard/team" : `dashboard/${notification.entityType === "client" ? "clients" : notification.entityType === "expense" ? "expenses" : notification.entityType === "social_post" ? "social-posts" : notification.entityType === "invitation" ? "invitations" : "tasks"}/${notification.entityId}`}`
    : undefined;

  return (
    <article className={`rounded-xl border p-4 transition ${notification.isRead ? "border-[#e5e7eb] bg-white" : "border-primary/20 bg-orange-50/50"}`}>
      <div className="flex gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.isRead ? "bg-[#f3f4f6] text-[#6b7280]" : "bg-primary/10 text-primary"}`}>
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#111827]">{notification.title}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityClasses[notification.priority] ?? priorityClasses.normal}`}>
                  {notification.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6b7280]">
                {notificationTypes[notification.type]} • {notification.timeAgo}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm leading-5 text-[#374151]">{notification.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#6b7280]">
            {entityHref ? (
              <Link href={entityHref} className="font-medium text-primary hover:underline">
                View related item
              </Link>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {notification.timeAgo}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {!notification.isRead && (
              <Button type="button" variant="outline" onClick={() => onMarkAsRead(notification.id)} className="h-9">
                Mark as Read
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onDelete(notification.id)} className="h-9 gap-2">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
