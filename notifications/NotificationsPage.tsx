"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications"; 
import { NotificationFilters } from "./NotificationFilters";
import { NotificationsList } from "./NotificationsList";

export function NotificationsPage() {
  const notifications = useNotifications({ limit: 15 });
  const filteredNotifications = useMemo(() => notifications.items, [notifications.items]);

  return (
    <main className="min-h-screen bg-[#f7f8ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[960px]">
        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#1f2933]">Notifications</h1>
              <p className="mt-1 text-sm text-[#6b7280]">{notifications.unreadCount} unread</p>
            </div>
            <Button type="button" variant="outline" onClick={() => notifications.markAllAsRead(undefined as never)}>
              Mark All as Read
            </Button>
          </div>

          <div className="space-y-5">
            <NotificationFilters
              activeFilter={notifications.activeFilter}
              unreadCount={notifications.unreadCount}
              onFilterChange={notifications.setActiveFilter}
            />
            <NotificationsList
              notifications={filteredNotifications}
              onMarkAsRead={(id) => notifications.markAsRead(id)}
              onDelete={(id) => notifications.deleteNotification(id)}
            />
            {notifications.hasMore ? (
              <div className="flex justify-center">
                <Button type="button" variant="outline" onClick={() => notifications.loadMore()}>
                  Load more
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
