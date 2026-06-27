"use client";

import { Calendar, FolderKanban } from "lucide-react";
import Link from "next/link";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboard } from "@/hooks/useDashboard";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const statusMapping: Record<string, string> = {
  planned: "Planned",
  submitted: "Submitted",
  approved: "Approved",
  pending: "Pending",
};

export default function DashboardPage() {
  const dashboardQuery = useDashboard();
  const data = dashboardQuery.data;

  if (dashboardQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1500px] p-8 text-sm text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (!data || dashboardQuery.isError) {
    return (
      <div className="mx-auto max-w-[1500px] p-8 text-sm text-red-600">
        Unable to load dashboard.
      </div>
    );
  }

  const completedTasks = data.recentTasks.filter((task) => task.completed).length;
  const remainingTasks = data.recentTasks.length - completedTasks;
  const completion = data.recentTasks.length
    ? Math.round((completedTasks / data.recentTasks.length) * 100)
    : 0;

  const expenseTotals = new Map(
    data.expenseStatusTotals.map((item) => [item.status.toLowerCase(), item.total]),
  );

  return (
      <div className="mx-auto grid max-w-[1500px] gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <DashboardCard
            title="Today's Agenda"
            action={
              <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-primary">
                {data.recentTasks.length}
              </span>
            }
          >
            <div className="divide-y divide-[#edf0f3]">
              {data.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="grid gap-3 py-3 sm:grid-cols-[24px_1fr_auto] sm:items-center"
                >
                  <input
                    type="checkbox"
                    defaultChecked={task.completed}
                    className="mt-1 h-4 w-4 rounded border-[#cbd5e1] text-primary sm:mt-0"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {task.title}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                      <span>{task.category}</span>
                      <span>•</span>
                      <span>
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge
                      tone={
                        task.status === "Done"
                          ? "green"
                          : task.status === "Blocked"
                            ? "red"
                            : "blue"
                      }
                    >
                      {task.status}
                    </StatusBadge>

                    <span className="rounded-md bg-[#f3f4f6] px-2 py-1 text-xs font-medium">
                      {task.dueTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard
            title="Overdue Items"
            action={
              <Link
                href="/dashboard/tasks"
                className="text-xs font-medium text-primary"
              >
                View all
              </Link>
            }
          >
            <div className="divide-y divide-[#edf0f3]">
              {data.overdueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-primary">
                      <FolderKanban className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {item.title}
                      </p>

                      <p className="text-xs text-red-600">
                        {item.type} •{" "}
                        {item.daysOverdue} days overdue
                      </p>
                    </div>
                  </div>

                  {item.amount && (
                    <span className="text-sm font-semibold text-primary">
                      {currency(item.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Planned Expenses">
            <div className="grid grid-cols-2 gap-3 pb-4 text-center sm:grid-cols-4">
              {[
                "Planned",
                "Submitted",
                "Approved",
                "Pending",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-xl bg-[#f8fafc] p-3"
                >
                  <p className="text-xs uppercase text-[#6b7280]">
                    {label}
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {currency(expenseTotals.get(label.toLowerCase()) ?? 0)}
                  </p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-[#edf0f3]">
              {data.recentExpenses.map((expense) => (
                <Link
                  key={expense.id}
                  href={`/dashboard/expenses/${expense.id}`}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {expense.name}
                    </p>

                    <p className="text-xs text-[#6b7280]">
                      {expense.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {currency(expense.amount)}
                    </p>

                    <StatusBadge tone="orange">
                      {statusMapping[expense.status.toLowerCase()] ?? expense.status}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Team Activity">
            <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1">
              {data.teamActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0f2fe] text-xs font-bold text-[#0369a1]">
                    {activity.initials}
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">
                        {activity.user}
                      </span>{" "}
                      {activity.action}
                    </p>

                    <p className="text-xs text-[#6b7280]">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <AnalyticsCharts
            revenue={data.charts.revenue}
            productivity={data.charts.productivity}
          />
        </div>

        <aside className="space-y-4">
          <DashboardCard className="bg-primary text-white">
            <p className="text-sm font-semibold">
              Tasks Due This Week
            </p>

            <p className="mt-3 text-4xl font-bold">
              {data.recentTasks.length}
            </p>

            <p className="mt-1 text-sm text-white/80">
              {completedTasks} completed •{" "}
              {remainingTasks} remaining
            </p>

            <div className="mt-4 h-2 rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: `${completion}%`,
                }}
              />
            </div>
          </DashboardCard>

          <DashboardCard title="Quick Stats">
            <div className="space-y-4">
              {[
                ["Active Projects", data.stats.activeProjects],
                ["Team Members Online", data.stats.onlineMembers],
                ["Monthly Revenue", currency(data.stats.revenue)],
                ["Monthly Expenses", currency(data.stats.expenses)],
                ["Total Clients", data.stats.clients],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs uppercase text-[#6b7280]">
                    {label}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#111827]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Upcoming Deadlines">
            <div className="space-y-4">
              {data.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id}>
                  <p className="text-sm font-semibold">
                    {deadline.project}
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-xs text-[#6b7280]">
                    <Calendar className="h-3.5 w-3.5" />
                    {deadline.dueDate}
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Clients">
            <div className="space-y-3">
              {data.recentClients.map((client) => (
                <Link
                  key={client.id}
                  href="/dashboard/clients/acme-corporation"
                  className="rounded-xl bg-[#f8fafc] p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {client.name}
                    </p>

                    <StatusBadge
                      tone={
                        client.status === "Active"
                          ? "green"
                          : "orange"
                      }
                    >
                      {client.status}
                    </StatusBadge>
                  </div>

                  <p className="mt-1 text-xs text-[#6b7280]">
                    {client.industry}
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    {currency(client.revenue)}
                  </p>
                </Link>
              ))}
            </div>
          </DashboardCard>
        </aside>
      </div>
  );
}
