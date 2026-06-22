"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dynamic from "next/dynamic";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import {
  useOverviewReport,
  useFinancialReport,
  useCrmReport,
  useTeamReport,
  useExpensesReport,
  type ReportTab,
} from "@/hooks/useReports";
import { CRM_STAGES } from "@/types/client";

// ─── Recharts is client-only ──────────────────────────────────────────────────
const ReportsContent = dynamic(() => Promise.resolve(ReportsPageInner), { ssr: false });

export default function ReportsPage() {
  return <ReportsContent />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(n);
}

function pct(n: number): string {
  return `${n}%`;
}

function LoadingSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-[#f3f4f6]" />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, tone = "text-[#111827]" }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[#9ca3af]">{sub}</p>}
    </div>
  );
}

const CHART_COLORS = ["#f15a24", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data, isLoading } = useOverviewReport();
  if (isLoading || !data) return <LoadingSkeletons count={8} />;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue"       value={fmt(data.revenue)}      tone="text-emerald-600" sub="Approved expenses value" />
        <StatCard label="Expenses"      value={fmt(data.expenses)}      tone="text-orange-600"  sub="Total incurred" />
        <StatCard label="Profit"        value={fmt(data.profit)}        tone={data.profit >= 0 ? "text-emerald-600" : "text-red-600"} sub="Revenue − Expenses" />
        <StatCard label="Pending"       value={fmt(data.pendingExpenses)} tone="text-amber-600" sub="Awaiting approval" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Clients"  value={String(data.activeClients)}  sub={`of ${data.totalClients} total`} />
        <StatCard label="Leads"           value={String(data.leads)}           sub="Lead + Qualified stage" />
        <StatCard label="Team Members"    value={String(data.teamMembers)}     />
        <StatCard label="Tasks Completed" value={pct(data.totalTasks > 0 ? Math.round((data.tasksDone / data.totalTasks) * 100) : 0)}
          sub={`${data.tasksDone} of ${data.totalTasks}`} />
      </div>
    </div>
  );
}

// ─── Tab: Financial ───────────────────────────────────────────────────────────

function FinancialTab() {
  const { data, isLoading } = useFinancialReport();
  if (isLoading || !data) return <LoadingSkeletons />;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding Amount" value={fmt(data.outstandingAmount)} tone="text-orange-600" sub="Quoted − Paid (active clients)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Expense by Category chart */}
        <DashboardCard title="Expense by Category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byCategory} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="category" fontSize={11} tick={{ fill: "#6b7280" }} />
                <YAxis fontSize={11} tick={{ fill: "#6b7280" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v ?? 0))} />
                <Bar dataKey="total" radius={[6,6,0,0]}>
                  {data.byCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Revenue by Client */}
        <DashboardCard title="Revenue by Client">
          {data.byClient.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9ca3af]">No client-linked expenses yet.</p>
          ) : (
            <div className="divide-y divide-[#edf0f3]">
              {data.byClient.map((c) => (
                <div key={c.clientName} className="flex items-center justify-between py-3">
                  <p className="text-sm font-semibold truncate max-w-[180px]">{c.clientName}</p>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{fmt(c.revenue)}</p>
                    <p className="text-xs text-[#9ca3af]">{fmt(c.expenses)} planned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Category table */}
      <DashboardCard title="Category Breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#edf0f3] text-left text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4 text-right">Count</th>
                <th className="pb-3 text-right">Total Planned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f3]">
              {data.byCategory.map((r) => (
                <tr key={r.category}>
                  <td className="py-3 pr-4 font-medium">{r.category}</td>
                  <td className="py-3 pr-4 text-right text-[#6b7280]">{r.count}</td>
                  <td className="py-3 text-right font-bold">{fmt(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}

// ─── Tab: CRM ─────────────────────────────────────────────────────────────────

function CrmTab() {
  const { data, isLoading } = useCrmReport();
  if (isLoading || !data) return <LoadingSkeletons />;

  const stageMap = new Map(data.pipelineByStage.map((s) => [s.stage, s]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Quoted"   value={fmt(data.totalQuoted)}  tone="text-sky-600"     />
        <StatCard label="Total Paid"     value={fmt(data.totalPaid)}    tone="text-emerald-600" />
        <StatCard label="Advance Received" value={fmt(data.totalAdvance)} tone="text-violet-600" />
      </div>

      <DashboardCard title="Pipeline by Stage">
        {data.pipelineByStage.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#9ca3af]">
            No CRM data yet. Run the V017 migration and add clients.
          </p>
        ) : (
          <div className="space-y-3">
            {CRM_STAGES.map((s, i) => {
              const row = stageMap.get(s.id);
              const count = row?.count ?? 0;
              const quoted = row?.totalQuoted ?? 0;
              const maxCount = Math.max(...data.pipelineByStage.map((r) => r.count), 1);
              const barW = Math.round((count / maxCount) * 100);
              return (
                <div key={s.id} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 text-xs font-medium text-[#374151]">{s.label}</span>
                  <div className="flex-1 h-6 rounded-full bg-[#f3f4f6] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barW}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-[#111827]">{count}</span>
                  {quoted > 0 && <span className="w-24 text-right text-xs text-[#6b7280]">{fmt(quoted)}</span>}
                </div>
              );
            })}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

// ─── Tab: Team ────────────────────────────────────────────────────────────────

function TeamTab() {
  const { data, isLoading } = useTeamReport();
  if (isLoading || !data) return <LoadingSkeletons count={2} />;
  const overallRate = data.totalTasks > 0
    ? Math.round((data.totalCompleted / data.totalTasks) * 100)
    : 0;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total Tasks"       value={String(data.totalTasks)}     />
        <StatCard label="Completion Rate"   value={pct(overallRate)}   tone={overallRate >= 70 ? "text-emerald-600" : "text-amber-600"} />
      </div>

      <DashboardCard title="Productivity by Member">
        {data.members.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#9ca3af]">No task assignments found.</p>
        ) : (
          <>
            {/* Bar chart */}
            <div className="h-56 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.members.map((m) => ({ name: m.name.split(" ")[0], rate: m.completionRate, done: m.tasksDone, total: m.tasksTotal }))}
                  margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => [`${Number(v ?? 0)}%`, "Completion"]} />
                  <Bar dataKey="rate" fill="#10b981" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#edf0f3] text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    <th className="pb-3 pr-4 text-left">Member</th>
                    <th className="pb-3 pr-4 text-right">Assigned</th>
                    <th className="pb-3 pr-4 text-right">Done</th>
                    <th className="pb-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f3]">
                  {data.members.map((m) => (
                    <tr key={m.name}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-[11px] text-[#9ca3af] capitalize">{m.role}</p>
                      </td>
                      <td className="py-3 pr-4 text-right">{m.tasksTotal}</td>
                      <td className="py-3 pr-4 text-right text-emerald-600 font-medium">{m.tasksDone}</td>
                      <td className="py-3 text-right">
                        <StatusBadge tone={m.completionRate >= 70 ? "green" : m.completionRate >= 40 ? "orange" : "gray"}>
                          {pct(m.completionRate)}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DashboardCard>
    </div>
  );
}

// ─── Tab: Expenses ────────────────────────────────────────────────────────────

function ExpensesTab() {
  const { data, isLoading } = useExpensesReport();
  if (isLoading || !data) return <LoadingSkeletons />;

  const statusTone = (s: string) => {
    if (s === "approved") return "green";
    if (s === "paid")     return "blue";
    if (s === "rejected") return "red";
    return "orange";
  };

  return (
    <div className="space-y-6">
      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.byStatus.map((s) => (
          <div key={s.status} className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">{s.status}</p>
              <StatusBadge tone={statusTone(s.status)}>{s.count}</StatusBadge>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#111827]">{fmt(s.total)}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown chart */}
      <DashboardCard title="Category Breakdown">
        {data.byCategory.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#9ca3af]">No expense data yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byCategory} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="category" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v ?? 0))} />
                <Bar dataKey="planned"  fill="#f15a24" radius={[6,6,0,0]} name="Planned"  />
                <Bar dataKey="incurred" fill="#10b981"  radius={[6,6,0,0]} name="Incurred" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

// ─── Main Reports Page ────────────────────────────────────────────────────────

const TABS: { id: ReportTab; label: string }[] = [
  { id: "overview",   label: "Overview"   },
  { id: "financial",  label: "Financial"  },
  { id: "crm",        label: "CRM"        },
  { id: "team",       label: "Team"       },
  { id: "expenses",   label: "Expenses"   },
];

function ReportsPageInner() {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Reports</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Executive dashboards aggregated from live workspace data.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#e5e7eb]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition",
              activeTab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-[#6b7280] hover:text-[#374151]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview"  && <OverviewTab />}
      {activeTab === "financial" && <FinancialTab />}
      {activeTab === "crm"       && <CrmTab />}
      {activeTab === "team"      && <TeamTab />}
      {activeTab === "expenses"  && <ExpensesTab />}
    </div>
  );
}
