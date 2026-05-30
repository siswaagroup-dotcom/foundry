"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export type ModuleRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  meta: string;
  amount?: string;
  completed?: boolean;
};

type CrudModuleProps = {
  title: string;
  description: string;
  records: ModuleRecord[];
  primaryAction: string;
  searchPlaceholder: string;
  statusOptions: string[];
  showComplete?: boolean;
};

const recordSchema = z.object({
  title: z.string().min(2, "Required"),
  subtitle: z.string().min(2, "Required"),
  status: z.string().min(2, "Required"),
  meta: z.string().min(1, "Required"),
  amount: z.string().optional(),
});

type RecordValues = z.infer<typeof recordSchema>;

export function CrudModule({
  title,
  description,
  records,
  primaryAction,
  searchPlaceholder,
  statusOptions,
  showComplete = false,
}: CrudModuleProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(records);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("title");
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<RecordValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      status: statusOptions[0],
      meta: "",
      amount: "",
    },
  });

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        const matchesQuery = `${item.title} ${item.subtitle} ${item.meta}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = status === "All" || item.status === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) =>
        sort === "status"
          ? a.status.localeCompare(b.status)
          : a.title.localeCompare(b.title),
      );
  }, [items, query, sort, status]);

  function submit(values: RecordValues) {
    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId ? { ...item, ...values } : item,
        ),
      );
      toast({ title: `${title} updated`, variant: "success" });
    } else {
      setItems((current) => [
        {
          id: crypto.randomUUID(),
          title: values.title,
          subtitle: values.subtitle,
          status: values.status,
          meta: values.meta,
          amount: values.amount,
          completed: false,
        },
        ...current,
      ]);
      toast({ title: primaryAction.replace("Add", "Added"), variant: "success" });
    }

    setEditingId(null);
    form.reset({
      title: "",
      subtitle: "",
      status: statusOptions[0],
      meta: "",
      amount: "",
    });
  }

  function edit(item: ModuleRecord) {
    setEditingId(item.id);
    form.reset({
      title: item.title,
      subtitle: item.subtitle,
      status: item.status,
      meta: item.meta,
      amount: item.amount ?? "",
    });
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    toast({ title: "Record deleted", variant: "success" });
  }

  function complete(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              status: item.completed ? statusOptions[0] : "Done",
            }
          : item,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
      </div>

      <DashboardCard title={editingId ? "Edit Record" : primaryAction}>
        <form
          className="grid gap-3 md:grid-cols-5"
          onSubmit={form.handleSubmit(submit)}
        >
          <Input placeholder="Title" {...form.register("title")} />
          <Input placeholder="Category / subtitle" {...form.register("subtitle")} />
          <select
            className="h-10 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm sm:h-11 lg:h-12"
            {...form.register("status")}
          >
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <Input placeholder="Meta / owner" {...form.register("meta")} />
          <div className="flex gap-2">
            <Input placeholder="Amount / metric" {...form.register("amount")} />
            <Button className="h-10 shrink-0 sm:h-11 lg:h-12">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DashboardCard>

      <DashboardCard>
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm sm:h-11 lg:h-12"
          >
            <option>All</option>
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-10 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-sm sm:h-11 lg:h-12"
          >
            <option value="title">Sort by title</option>
            <option value="status">Sort by status</option>
          </select>
        </div>

        <div className="divide-y divide-[#edf0f3]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 py-3 lg:grid-cols-[1fr_auto_auto] lg:items-center"
            >
              <div className="flex items-start gap-3">
                {showComplete ? (
                  <input
                    type="checkbox"
                    checked={Boolean(item.completed)}
                    onChange={() => complete(item.id)}
                    className="mt-1 h-4 w-4 rounded border-[#cbd5e1]"
                  />
                ) : null}
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {item.subtitle} • {item.meta}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={item.status === "Done" ? "green" : "orange"}>
                  {item.status}
                </StatusBadge>
                {item.amount ? (
                  <span className="text-sm font-semibold">{item.amount}</span>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => edit(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-[#f8fafc]"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
