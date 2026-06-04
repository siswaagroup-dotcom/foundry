"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  { id: "admin", name: "Admin", description: "Full access", icon: Shield },
  { id: "member", name: "Member", description: "Standard access", icon: User },
  { id: "viewer", name: "Viewer", description: "View only", icon: Eye },
];

const modules = [
  { id: "projects", name: "Projects", description: "Create and manage projects" },
  { id: "analytics", name: "Analytics", description: "View reports and insights" },
  { id: "billing", name: "Billing", description: "Manage payments and invoices" },
  { id: "settings", name: "Settings", description: "Configure workspace settings" },
];

export function InviteMemberWorkspace({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [access, setAccess] = useState<Record<string, boolean>>({
    projects: true,
    analytics: true,
    billing: false,
    settings: false,
  });

  function toggle(moduleId: string) {
    setAccess((current) => ({ ...current, [moduleId]: !current[moduleId] }));
  }

  function inviteMember() {
    console.log({ email, role, moduleAccess: access });
  }

  function cancel() {
    console.log("Cancel");
    if (onCancel) onCancel();
    else router.push("/dashboard/team");
  }

  return (
    <div className="mx-auto max-w-[650px] rounded-xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
      <div className="border-b border-[#edf0f3] p-8">
        <p className="text-xs text-[#64748b]">Team / Invite Member</p>
        <h1 className="mt-4 text-3xl font-bold">Invite Team Member</h1>
        <p className="mt-5 text-sm text-[#64748b]">Send an invitation to join your Foundry workspace</p>
      </div>
      <div className="space-y-8 p-8">
        <div>
          <label className="text-xs font-bold">Email Address</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="colleague@company.com" className="mt-3 h-12 w-full rounded-lg border border-[#e5e7eb] px-4 text-sm outline-none focus:border-[#f15a24]" />
        </div>
        <div>
          <p className="text-xs font-bold">Select Role</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {roles.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setRole(item.id)} className={cn("rounded-lg border p-5 text-left", role === item.id ? "border-[#f15a24] bg-[#fff7ed]" : "border-[#e5e7eb] bg-white")}>
                  <Icon className="h-6 w-6 text-[#f15a24]" />
                  <p className="mt-5 text-sm font-bold">{item.name}</p>
                  <p className="mt-2 text-xs text-[#64748b]">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-5">
          <h2 className="text-sm font-bold">Module Access</h2>
          <div className="mt-4 divide-y divide-[#e5e7eb]">
            {modules.map((module) => (
              <div key={module.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm">{module.name}</p>
                  <p className="mt-1 text-xs text-[#64748b]">{module.description}</p>
                </div>
                <button onClick={() => toggle(module.id)} className={cn("h-7 w-12 rounded-full p-0.5 transition", access[module.id] ? "bg-[#f15a24]" : "bg-[#cfd5dd]")}>
                  <span className={cn("block h-6 w-6 rounded-full bg-white transition", access[module.id] ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={cancel} className="h-10 rounded-lg border border-[#e5e7eb] px-5 text-sm">Cancel</button>
          <button onClick={inviteMember} className="h-10 rounded-lg bg-[#f15a24] px-5 text-sm font-bold text-white">Invite Member</button>
        </div>
      </div>
    </div>
  );
}
