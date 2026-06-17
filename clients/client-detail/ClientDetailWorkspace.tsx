"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Briefcase, Calendar, DollarSign,
  Mail, MapPin, MessageSquare, MoreVertical, Plus, Trash2, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useClient } from "@/hooks/useClient";
import { useDeleteClient } from "@/hooks/useClients";

type ActivityType = "tasks" | "expenses" | "posts" | "notes";
type Filter = "all" | ActivityType;

// Activity data stays static until Tasks/Expenses modules
// expose per-client API endpoints in a future phase.
const STATIC_ACTIVITIES = [
  {
    id: "1", type: "tasks" as const, label: "Task",
    title: "Website Redesign Phase 2",
    detail: "Completed wireframes and mockups for homepage redesign",
    time: "2 hours ago", badge: "Complete", icon: Briefcase,
  },
  {
    id: "2", type: "expenses" as const, label: "Expense",
    title: "Design Software License",
    detail: "Adobe Creative Cloud annual subscription for design team",
    time: "Yesterday at 3:24 PM", badge: "$2,499.00", icon: DollarSign,
  },
  {
    id: "3", type: "posts" as const, label: "Social Post",
    title: "Q4 Product Launch Campaign",
    detail: "Launched social media campaign across LinkedIn and Twitter platforms",
    time: "Jan 15, 2026", badge: "LinkedIn", icon: MessageSquare,
  },
];

const SUMMARY = [
  { label: "Active Tasks",   value: "12",    icon: Briefcase     },
  { label: "Total Expenses", value: "$45.2K", icon: DollarSign   },
  { label: "Social Posts",   value: "28",    icon: MessageSquare },
  { label: "Team Members",   value: "6",     icon: Users         },
];

const ACTIVITY_FILTERS: { id: Filter; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "tasks",    label: "Tasks"    },
  { id: "expenses", label: "Expenses" },
  { id: "posts",    label: "Posts"    },
  { id: "notes",    label: "Notes"    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientDetailWorkspace({ onBack }: { onBack?: () => void }) {
  const router  = useRouter();
  const { toast } = useToast();
  const params  = useParams<{ id: string }>();
  const clientId = params?.id ?? "";

  const { data: client, isLoading, isError } = useClient(clientId);
  const deleteMutation = useDeleteClient();

  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const visibleActivities = useMemo(
    () => STATIC_ACTIVITIES.filter(
      (a) => activeFilter === "all" || a.type === activeFilter
    ),
    [activeFilter]
  );

  function goBack() {
    if (onBack) onBack();
    else router.push("/dashboard/clients");
  }

  async function handleDelete() {
    if (!clientId) return;
    deleteMutation.mutate(clientId, {
      onSuccess: () => {
        toast({ title: "Client deleted", variant: "success" });
        router.push("/dashboard/clients");
      },
      onError: () => toast({ title: "Failed to delete client", variant: "error" }),
    });
  }

  function quickAction(action: string) {
    const map: Record<string, string> = {
      "Create Task":  "/dashboard/tasks/create",
      "Add Expense":  "/dashboard/expenses/create",
      "Create Post":  "/dashboard/social/create",
    };
    if (map[action]) router.push(map[action]);
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (isError || !client) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">Client not found or failed to load.</p>
        <button onClick={goBack} className="text-sm font-medium text-primary underline">
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-5">

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#64748b]">
            Clients <span className="mx-2">›</span> {client.name}
          </p>
          <h1 className="mt-2 text-2xl font-bold">Client Detail</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goBack}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-xs font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-red-500 hover:bg-red-50 disabled:opacity-50"
            title="Delete client"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="space-y-5">

          {/* Client profile card */}
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#ff6b2a] text-3xl font-bold text-white">
                {client.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold">{client.name}</h2>
                  {client.tags[0] && (
                    <span className="rounded bg-[#e8f0ff] px-2 py-1 text-[10px] font-bold text-[#3478f6]">
                      {client.tags[0]}
                    </span>
                  )}
                </div>
                <div className="mt-5 grid gap-3 text-xs text-[#334155] sm:grid-cols-2">
                  {client.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[#94a3b8]" /> {client.email}
                    </span>
                  )}
                  {client.phone && <span>↳ {client.phone}</span>}
                  {client.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#94a3b8]" /> {client.location}
                    </span>
                  )}
                  {client.clientSince && (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#94a3b8]" />
                      Client since{" "}
                      {new Date(client.clientSince).toLocaleDateString("en-US", {
                        month: "short", year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Activity timeline */}
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f3] p-5">
              <h2 className="text-base font-bold">Activity Timeline</h2>
              <div className="flex gap-2">
                {ACTIVITY_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={cn(
                      "h-8 rounded-md border px-3 text-xs",
                      activeFilter === f.id
                        ? "border-[#f15a24] bg-[#f15a24] text-white"
                        : "border-[#e5e7eb] bg-white"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6 p-6">
              {visibleActivities.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.id}
                    className="grid gap-4 border-b border-[#edf0f3] pb-5 last:border-b-0 sm:grid-cols-[36px_1fr_auto]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6c5ce7] text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#64748b]">{item.label}</p>
                      <h3 className="mt-1 text-sm font-bold">{item.title}</h3>
                      <p className="mt-2 text-xs text-[#64748b]">{item.detail}</p>
                      <span className="mt-3 inline-flex rounded bg-[#dcfce7] px-2 py-1 text-[10px] font-medium text-[#16a34a]">
                        {item.badge}
                      </span>
                    </div>
                    <time className="text-[10px] text-[#94a3b8]">{item.time}</time>
                  </article>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          {/* Activity summary */}
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <h2 className="text-sm font-bold">Activity Summary</h2>
            <div className="mt-4 space-y-3">
              {SUMMARY.map((item) => (
                <div
                  key={item.label}
                  className="flex h-11 items-center justify-between rounded bg-[#f8fafc] px-3 text-xs"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 text-[#94a3b8]" />
                    {item.label}
                  </span>
                  <b>{item.value}</b>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
            <h2 className="text-sm font-bold">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              {["Create Task", "Add Expense", "Create Post"].map((action) => (
                <button
                  key={action}
                  onClick={() => quickAction(action)}
                  className="flex h-10 w-full items-center gap-2 rounded bg-[#f8fafc] px-3 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> {action}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
