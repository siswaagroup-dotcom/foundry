"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Search,
  UserCircle,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { navItems } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

const SidebarContent = memo(function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active:
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href),
      })),
    [pathname],
  );

  return (
    <div className="flex h-full flex-col border-r border-[#e5e7eb] bg-white">
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
          F
        </div>

        <div>
          <p className="text-sm font-bold text-[#111827]">
            Foundry
          </p>

          <p className="text-xs text-[#6b7280]">
            Acme Projects
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                item.active
                  ? "bg-orange-50 text-primary"
                  : "text-[#4b5563] hover:bg-[#f8fafc] hover:text-[#111827]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e5e7eb] px-3 py-3">
        <Link
          href="/auth"
          replace
          prefetch
          onClick={onNavigate}
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f8fafc] hover:text-[#111827]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </div>
  );
});

export function DashboardShell({
  children,
  showHeader = false,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] =
    useState(false);
  const router = useRouter();
  const openMobileNav = useCallback(() => setMobileOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileOpen(false), []);
  const openQuickCreate = useCallback(
    () => router.push("/dashboard/tasks/create"),
    [router],
  );
  useEffect(() => {
    const routes = [
      ...navItems.map((item) => item.href),
      "/dashboard/tasks/create",
      "/dashboard/expenses/create",
      "/dashboard/clients/create",
      "/dashboard/social/create",
      "/dashboard/team/invite",
      "/dashboard/team/roles",
    ];
    const prefetchRoutes = () => {
      routes.forEach((route) => router.prefetch(route));
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(prefetchRoutes);
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(prefetchRoutes, 1);
    return () => globalThis.clearTimeout(timeoutId);
  }, [router]);

  const pathname = usePathname();

  const title = useMemo(() => {
    const active = navItems.find((item) =>
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href)
    );

    return active?.title ?? "Dashboard";
  }, [pathname]);
  const shouldShowHeader = showHeader || pathname === "/dashboard";

  return (
    <div className="h-dvh overflow-hidden bg-[#f8fafc] text-[#111827]">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={closeMobileNav}
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            <SidebarContent onNavigate={closeMobileNav} />
          </aside>
        </>
      )}

      <div className="flex h-full min-h-0 flex-col lg:pl-64">

        {/* HEADER ONLY ON DASHBOARD */}
        {shouldShowHeader && (
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#e5e7eb] bg-white px-3 sm:px-5">
            <button
              type="button"
              onClick={openMobileNav}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#4b5563] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <h1 className="min-w-fit text-lg font-bold sm:text-xl">
              {title}
            </h1>

            <button className="hidden h-9 items-center gap-2 rounded-lg bg-[#f3f4f6] px-3 text-xs font-medium text-[#4b5563] md:inline-flex">
              Acme Projects
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <div className="relative ml-auto hidden w-full max-w-sm md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />

              <input
                placeholder="Search tasks, expenses, clients..."
                className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <button
              onClick={openQuickCreate}
              className="hidden h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Quick Create
            </button>

            <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#4b5563]">
              <Bell className="h-4 w-4" />
            </button>

            <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-2 text-sm text-[#4b5563]">
              <UserCircle className="h-5 w-5" />

              <span className="hidden sm:inline">
                Atul
              </span>
            </button>
          </header>
        )}

        {/* MOBILE MENU BUTTON WHEN HEADER HIDDEN */}
        {!shouldShowHeader && (
          <button
            type="button"
            onClick={openMobileNav}
            className="fixed left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white shadow-sm lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <main
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
            shouldShowHeader
              ? "p-3 sm:p-5 lg:p-6"
              : "p-3 pt-16 sm:p-5 lg:p-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
