import { Calendar, CheckCircle2, Clock, CreditCard, FolderKanban } from "lucide-react";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  activities,
  clients,
  deadlines,
  expenses,
  overdueItems,
  quickStats,
  tasks,
} from "@/lib/dashboard-data";

const completedTasks = tasks.filter((task) => task.completed).length;
const remainingTasks = tasks.length - completedTasks;
const completion = Math.round((completedTasks / tasks.length) * 100);

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-4 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <DashboardCard
          title="Today's Agenda"
          action={
            <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-primary">
              {tasks.length}
            </span>
          }
        >
          <div className="divide-y divide-[#edf0f3]">
            {tasks.map((task) => (
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
                    <span>{task.priority} Priority</span>
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
          action={<button className="text-xs font-medium text-primary">View all</button>}
        >
          <div className="divide-y divide-[#edf0f3]">
            {overdueItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-primary">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-red-600">
                      {item.type} • {item.daysOverdue} days overdue
                    </p>
                  </div>
                </div>
                {item.amount ? (
                  <span className="text-sm font-semibold text-primary">
                    {currency(item.amount)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Planned Expenses">
          <div className="grid grid-cols-2 gap-3 pb-4 text-center sm:grid-cols-4">
            {["Planned", "Submitted", "Approved", "Pending"].map((label) => (
              <div key={label} className="rounded-xl bg-[#f8fafc] p-3">
                <p className="text-xs uppercase text-[#6b7280]">{label}</p>
                <p className="mt-1 text-lg font-bold">
                  {currency(
                    expenses
                      .filter((expense) => expense.status === label)
                      .reduce((sum, expense) => sum + expense.amount, 0),
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-[#edf0f3]">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold">{expense.name}</p>
                  <p className="text-xs text-[#6b7280]">{expense.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {currency(expense.amount)}
                  </p>
                  <StatusBadge tone="orange">{expense.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Team Activity">
          <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0f2fe] text-xs font-bold text-[#0369a1]">
                  {activity.initials}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-[#6b7280]">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <AnalyticsCharts />
      </div>

      <aside className="space-y-4">
        <DashboardCard className="bg-primary text-white">
          <p className="text-sm font-semibold">Tasks Due This Week</p>
          <p className="mt-3 text-4xl font-bold">{tasks.length}</p>
          <p className="mt-1 text-sm text-white/80">
            {completedTasks} completed • {remainingTasks} remaining
          </p>
          <div className="mt-4 h-2 rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${completion}%` }}
            />
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Stats">
          <div className="space-y-4">
            {[
              ["Active Projects", quickStats.activeProjects],
              ["Team Members Online", quickStats.onlineMembers],
              ["Monthly Revenue", currency(quickStats.revenue)],
              ["Monthly Expenses", currency(quickStats.expenses)],
              ["Total Clients", quickStats.clients],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase text-[#6b7280]">{label}</p>
                <p className="mt-1 text-2xl font-bold text-[#111827]">{value}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Upcoming Deadlines">
          <div className="space-y-4">
            {deadlines.map((deadline) => (
              <div key={deadline.id}>
                <p className="text-sm font-semibold">{deadline.project}</p>
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
            {clients.map((client) => (
              <div key={client.id} className="rounded-xl bg-[#f8fafc] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{client.name}</p>
                  <StatusBadge tone={client.status === "Active" ? "green" : "orange"}>
                    {client.status}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-[#6b7280]">{client.industry}</p>
                <p className="mt-2 text-sm font-bold">{currency(client.revenue)}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </aside>
    </div>
  );
}
