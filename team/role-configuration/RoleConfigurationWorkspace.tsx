"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, FileText, LayoutDashboard, MessageSquare, Plus, Settings, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { roles } from "../data/team-roles";

type Permission = "view" | "create" | "edit" | "delete" | "approve";

const columns: Permission[] = ["view", "create", "edit", "delete", "approve"];
const modules = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", name: "Tasks", icon: FileText },
  { id: "expenses", name: "Expenses", icon: FileText },
  { id: "clients", name: "Clients", icon: Users },
  { id: "social", name: "Social", icon: MessageSquare },
  { id: "team", name: "Team & Roles", icon: Users },
  { id: "settings", name: "Settings", icon: Settings },
];

const initialPermissions: Record<string, Record<Permission, boolean>> = {
  dashboard: { view: true, create: false, edit: false, delete: false, approve: false },
  tasks: { view: true, create: true, edit: true, delete: true, approve: false },
  expenses: { view: true, create: true, edit: true, delete: false, approve: true },
  clients: { view: true, create: true, edit: true, delete: false, approve: false },
  social: { view: true, create: true, edit: true, delete: true, approve: true },
  team: { view: true, create: false, edit: true, delete: false, approve: false },
  settings: { view: true, create: false, edit: true, delete: false, approve: false },
};

export function RoleConfigurationWorkspace({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(roles[0]?.id ?? "");
  const [permissions, setPermissions] = useState(initialPermissions);
  const role = useMemo(() => roles.find((item) => item.id === activeRole) ?? roles[0], [activeRole]);

  function toggle(moduleId: string, permission: Permission) {
    setPermissions((current) => ({
      ...current,
      [moduleId]: {
        ...current[moduleId],
        [permission]: !current[moduleId][permission],
      },
    }));
  }

  function back() {
    console.log("Back");
    if (onBack) onBack();
    else router.push("/dashboard/team");
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={back} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Team
          </button>
          <h1 className="text-2xl font-bold">Role Configuration</h1>
        </div>
        <button onClick={() => console.log("Duplicate")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-xs">
          <Copy className="h-4 w-4" /> Duplicate Role
        </button>
      </header>
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm">Roles</h2>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#fff7ed] text-[#f15a24]">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {roles.map((item) => (
              <button key={item.id} onClick={() => setActiveRole(item.id)} className={cn("w-full rounded-lg border p-4 text-left", activeRole === item.id ? "border-[#f15a24] bg-[#fff7ed]" : "border-transparent bg-white")}>
                <p className="text-sm font-bold">{item.name}</p>
                <p className="mt-2 text-[10px] text-[#64748b]">{item.count} users</p>
              </button>
            ))}
          </div>
        </aside>
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] p-6">
            <h2 className="text-xl font-medium">{role.name} Permissions</h2>
            <p className="mt-2 text-sm text-[#64748b]">Configure module access and action permissions</p>
          </div>
          <div className="overflow-x-auto p-6">
            <div className="min-w-[720px] rounded-lg bg-[#f8fafc]">
              <div className="grid grid-cols-[1.5fr_repeat(5,1fr)] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748b]">
                <span>Module</span>
                {columns.map((column) => <span key={column} className="text-center">{column}</span>)}
              </div>
              <div className="divide-y divide-[#e5e7eb] bg-white">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <div key={module.id} className="grid grid-cols-[1.5fr_repeat(5,1fr)] items-center px-5 py-4">
                      <span className="flex items-center gap-3 text-sm font-medium"><Icon className="h-4 w-4 text-[#64748b]" /> {module.name}</span>
                      {columns.map((column) => (
                        <span key={column} className="flex justify-center">
                          <Checkbox checked={permissions[module.id][column]} onCheckedChange={() => toggle(module.id, column)} />
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
