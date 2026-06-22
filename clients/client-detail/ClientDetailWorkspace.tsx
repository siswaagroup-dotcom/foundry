"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Briefcase, Calendar, DollarSign,
  Mail, MapPin, MessageSquare, MoreVertical, Plus, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useClient } from "@/hooks/useClient";
import { useDeleteClient, useUpdateClient } from "@/hooks/useClients";
import { useClientTimeline } from "@/hooks/useClientTimeline";
import { useExpenseList } from "@/hooks/useExpenses";
import { useTaskList } from "@/hooks/useTasks";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CRM_STAGES, type CrmStage } from "@/types/client";

type TabId = "overview" | "tasks" | "expenses" | "timeline" | "financials";
const TABS: { id: TabId; label: string }[] = [
  { id: "overview",   label: "Overview"   },
  { id: "tasks",      label: "Tasks"      },
  { id: "expenses",   label: "Expenses"   },
  { id: "timeline",   label: "Timeline"   },
  { id: "financials", label: "Financials" },
];

function fmt(n: number | null, currency = "USD"): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export function ClientDetailWorkspace({ onBack }: { onBack?: () => void }) {
  const router     = useRouter();
  const { toast }  = useToast();
  const params     = useParams<{ id: string }>();
  const clientId   = params?.id ?? "";

  const { data: client, isLoading, isError } = useClient(clientId);
  const deleteMutation = useDeleteClient();
  const updateMutation = useUpdateClient();
  const { data: timeline = [], isLoading: timelineLoading } = useClientTimeline(clientId);
  const { data: tasks    = [] } = useTaskList({ search: undefined });
  const { data: expenses = [] } = useExpenseList({});
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Filter tasks and expenses for this client
  // Task type doesn't expose clientId directly — fetch filtered from API
  const clientTasks    = tasks;    // shown as-is; future: useTaskList({ clientId })
  const clientExpenses = expenses.filter((e) => e.clientId === clientId);

  function goBack() {
    if (onBack) onBack(); else router.push("/dashboard/clients");
  }

  async function handleDelete() {
    deleteMutation.mutate(clientId, {
      onSuccess: () => { toast({ title: "Client deleted", variant: "success" }); router.push("/dashboard/clients"); },
      onError:   () => toast({ title: "Failed to delete client", variant: "error" }),
    });
  }

  function handleStageChange(stage: CrmStage) {
    updateMutation.mutate({ id: clientId, input: { crmStatus: stage } }, {
      onSuccess: () => toast({ title: "Stage updated", variant: "success" }),
      onError:   () => toast({ title: "Failed to update stage", variant: "error" }),
    });
  }

  if (isLoading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>
  );

  if (isError || !client) return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
      <p className="text-sm text-red-600">Client not found.</p>
      <button onClick={goBack} className="text-sm font-medium text-primary underline">Back</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1240px] space-y-5">

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#64748b]">Clients <span className="mx-2">›</span> {client.name}</p>
          <h1 className="mt-2 text-2xl font-bold">{client.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={goBack} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-xs font-medium">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={handleDelete} disabled={deleteMutation.isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-red-500 hover:bg-red-50 disabled:opacity-50">
            <Trash2 className="h-4 w-4" />
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* CRM Stage selector */}
      <div className="flex flex-wrap gap-2">
        {CRM_STAGES.map((s) => (
          <button key={s.id} type="button" onClick={() => handleStageChange(s.id)}
            className={cn(
              "h-8 rounded-full border px-3 text-xs font-semibold transition",
              client.crmStatus === s.id
                ? "border-primary bg-primary text-white"
                : "border-[#e5e7eb] bg-white text-[#4b5563] hover:border-primary/40"
            )}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-[#e5e7eb]">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition",
              activeTab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-[#6b7280] hover:text-[#374151]"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main className="space-y-5">
            <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#ff6b2a] text-3xl font-bold text-white">
                  {client.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">{client.name}</h2>
                    {client.tags[0] && (
                      <span className="rounded bg-[#e8f0ff] px-2 py-1 text-[10px] font-bold text-[#3478f6]">{client.tags[0]}</span>
                    )}
                    <StatusBadge tone={client.crmStatus === "active_client" ? "green" : client.crmStatus === "completed" ? "blue" : "orange"}>
                      {CRM_STAGES.find((s) => s.id === client.crmStatus)?.label ?? client.crmStatus}
                    </StatusBadge>
                  </div>
                  <div className="mt-5 grid gap-3 text-xs text-[#334155] sm:grid-cols-2">
                    {client.email    && <span className="flex items-center gap-2"><Mail  className="h-3.5 w-3.5 text-[#94a3b8]" /> {client.email}</span>}
                    {client.phone    && <span>↳ {client.phone}</span>}
                    {client.location && <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#94a3b8]" /> {client.location}</span>}
                    {client.clientSince && (
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#94a3b8]" />
                        Client since {new Date(client.clientSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>

          <aside className="space-y-5">
            <DashboardCard title="Activity Summary">
              <div className="space-y-3">
                {[
                  { label: "Active Tasks",    value: String(client.taskCount),    icon: Briefcase      },
                  { label: "Total Expenses",  value: fmt(client.expenseTotal),    icon: DollarSign     },
                  { label: "Social Posts",    value: "—",                        icon: MessageSquare   },
                ].map((item) => (
                  <div key={item.label} className="flex h-11 items-center justify-between rounded bg-[#f8fafc] px-3 text-xs">
                    <span className="flex items-center gap-2"><item.icon className="h-3.5 w-3.5 text-[#94a3b8]" />{item.label}</span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard title="Quick Actions">
              <div className="space-y-2">
                {[
                  { label: "Create Task",  href: "/dashboard/tasks/create"    },
                  { label: "Add Expense",  href: "/dashboard/expenses/create" },
                  { label: "Create Post",  href: "/dashboard/social/create"   },
                ].map((a) => (
                  <button key={a.label} onClick={() => router.push(a.href)}
                    className="flex h-10 w-full items-center gap-2 rounded bg-[#f8fafc] px-3 text-xs">
                    <Plus className="h-3.5 w-3.5" /> {a.label}
                  </button>
                ))}
              </div>
            </DashboardCard>
          </aside>
        </div>
      )}

      {/* ── TASKS ── */}
      {activeTab === "tasks" && (
        <DashboardCard title={`Tasks (${clientTasks.length})`}>
          {clientTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9ca3af]">No tasks linked to this client.</p>
          ) : (
            <div className="divide-y divide-[#edf0f3]">
              {clientTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 cursor-pointer hover:bg-[#f8fafc] px-2 rounded"
                  onClick={() => router.push(`/dashboard/tasks/${t.id}`)}>
                  <div>
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-[#6b7280]">{t.priority} · {t.status}</p>
                  </div>
                  <StatusBadge tone={t.status === "done" ? "green" : t.status === "review" ? "orange" : "gray"}>
                    {t.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      )}

      {/* ── EXPENSES ── */}
      {activeTab === "expenses" && (
        <DashboardCard title={`Expenses (${clientExpenses.length})`}>
          {clientExpenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9ca3af]">No expenses linked to this client.</p>
          ) : (
            <div className="divide-y divide-[#edf0f3]">
              {clientExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3 cursor-pointer hover:bg-[#f8fafc] px-2 rounded"
                  onClick={() => router.push(`/dashboard/expenses/${e.id}`)}>
                  <div>
                    <p className="text-sm font-semibold">{e.name}</p>
                    <p className="text-xs text-[#6b7280]">{e.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{fmt(e.amountPlanned, e.currency)}</p>
                    <StatusBadge tone={e.status === "approved" ? "green" : e.status === "rejected" ? "red" : "orange"}>
                      {e.status}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      )}

      {/* ── TIMELINE ── */}
      {activeTab === "timeline" && (
        <DashboardCard title="Activity Timeline">
          {timelineLoading ? (
            <div className="space-y-3 py-4">
              {[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-[#f3f4f6]" />)}
            </div>
          ) : timeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9ca3af]">No activity yet for this client.</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((event) => {
                const Icon = event.type === "task" ? Briefcase : event.type === "expense" ? DollarSign : MessageSquare;
                return (
                  <article key={event.id} className="grid gap-3 border-b border-[#edf0f3] pb-4 last:border-0 sm:grid-cols-[36px_1fr_auto]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6c5ce7] text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#64748b]">{event.type.replace("_", " ")}</p>
                      <h3 className="mt-1 text-sm font-bold">{event.title}</h3>
                      {event.detail && <p className="mt-1 text-xs text-[#64748b]">{event.detail}</p>}
                      {event.badge && (
                        <span className="mt-2 inline-flex rounded bg-[#dcfce7] px-2 py-0.5 text-[10px] font-medium text-[#16a34a]">
                          {event.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <time className="text-[10px] text-[#94a3b8]">
                        {new Date(event.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </time>
                      {event.actorName && <p className="mt-1 text-[10px] text-[#9ca3af]">{event.actorName}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DashboardCard>
      )}

      {/* ── FINANCIALS ── */}
      {activeTab === "financials" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Quoted Amount",    value: fmt(client.quotedAmount),    tone: "text-sky-600"    },
            { label: "Advance Received", value: fmt(client.advanceReceived), tone: "text-violet-600" },
            { label: "Paid Amount",      value: fmt(client.paidAmount),      tone: "text-emerald-600"},
            { label: "Pending Amount",   value: fmt(client.pendingAmount),   tone: "text-orange-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">{s.label}</p>
              <p className={`mt-2 text-2xl font-bold ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
