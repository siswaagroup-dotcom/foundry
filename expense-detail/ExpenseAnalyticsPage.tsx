"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { fetchExpenseAnalytics } from "@/services/expense.service";

interface AnalyticsData {
  totalPlanned:    number;
  totalIncurred:   number;
  totalApproved:   number;
  totalRejected:   number;
  totalPending:    number;
  byCategory:      { category: string; total: number }[];
  byStatus:        { status: string; count: number; total: number }[];
  recentApprovals: { expenseName: string; approverName: string; stage: string; actionedAt: string }[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ExpenseAnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["expenses", "analytics"],
    queryFn:  () => fetchExpenseAnalytics() as Promise<AnalyticsData>,
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-[#f3f4f6]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-[#f3f4f6]" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Planned",  value: fmt(data.totalPlanned),  color: "text-sky-600"     },
    { label: "Total Incurred", value: fmt(data.totalIncurred), color: "text-orange-600"  },
    { label: "Approved",       value: fmt(data.totalApproved), color: "text-emerald-600" },
    { label: "Pending",        value: fmt(data.totalPending),  color: "text-amber-600"   },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Expense Analytics</h2>
        <p className="mt-1 text-sm text-[#6b7280]">Overview of workspace expense activity.</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* By category */}
        <DashboardCard title="Spending by Category">
          <div className="divide-y divide-[#edf0f3]">
            {data.byCategory.map((c) => (
              <div key={c.category} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">{c.category}</span>
                <span className="text-sm font-bold text-primary">{fmt(c.total)}</span>
              </div>
            ))}
            {data.byCategory.length === 0 && (
              <p className="py-6 text-center text-sm text-[#9ca3af]">No data yet</p>
            )}
          </div>
        </DashboardCard>

        {/* By status */}
        <DashboardCard title="Expenses by Status">
          <div className="divide-y divide-[#edf0f3]">
            {data.byStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm font-medium">{cap(s.status)}</span>
                  <span className="ml-2 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs text-[#6b7280]">
                    {s.count}
                  </span>
                </div>
                <span className="text-sm font-bold">{fmt(s.total)}</span>
              </div>
            ))}
            {data.byStatus.length === 0 && (
              <p className="py-6 text-center text-sm text-[#9ca3af]">No data yet</p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Recent approvals */}
      <DashboardCard title="Recent Approval Activity">
        <div className="divide-y divide-[#edf0f3]">
          {data.recentApprovals.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold">{r.expenseName}</p>
                <p className="text-xs text-[#6b7280]">
                  {r.approverName} / {cap(r.stage)}
                </p>
              </div>
              <time className="text-xs text-[#9ca3af]">
                {new Date(r.actionedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </time>
            </div>
          ))}
          {data.recentApprovals.length === 0 && (
            <p className="py-6 text-center text-sm text-[#9ca3af]">No approval activity yet</p>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
