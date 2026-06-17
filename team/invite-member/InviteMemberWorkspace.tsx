"use client";

// =============================================================================
// InviteMemberWorkspace — DYNAMIC, API-READY
// UI is UNCHANGED. Only the data layer and submit handler are updated.
// console.log replaced with useInvitations.invite() via the service layer.
// Future API: POST /api/workspaces/:wid/team/invitations
// =============================================================================

import { Eye, Shield, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useInvitations } from "../hooks/useInvitations";
import type { WorkspaceRole } from "../types/team-types";

// ---------------------------------------------------------------------------
// Role options — aligned with DB system roles
// ---------------------------------------------------------------------------
const roleOptions: {
  id: WorkspaceRole;
  name: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { id: "Admin",   name: "Admin",   description: "Full access",     icon: Shield    },
  { id: "Member",  name: "Member",  description: "Standard access", icon: UserIcon  },
  { id: "Viewer",  name: "Viewer",  description: "View only",       icon: Eye       },
];

// ---------------------------------------------------------------------------
// Module access options — informational display only at MVP stage.
// In Phase 4 this will map to role_permissions rows in the DB.
// ---------------------------------------------------------------------------
const moduleOptions = [
  { id: "tasks",    name: "Tasks",    description: "Create and manage tasks"         },
  { id: "expenses", name: "Expenses", description: "View and submit expenses"        },
  { id: "clients",  name: "Clients",  description: "View and manage clients"         },
  { id: "social",   name: "Social",   description: "Create and schedule posts"       },
  { id: "reports",  name: "Reports",  description: "View reports and analytics"      },
  { id: "billing",  name: "Billing",  description: "Manage payments and invoices"    },
  { id: "settings", name: "Settings", description: "Configure workspace settings"   },
];

// Default access per role — derived from the permission matrix in the DB seed
const defaultAccess: Record<WorkspaceRole, Record<string, boolean>> = {
  Owner:   { tasks: true,  expenses: true,  clients: true,  social: true,  reports: true,  billing: true,  settings: true  },
  Admin:   { tasks: true,  expenses: true,  clients: true,  social: true,  reports: true,  billing: false, settings: true  },
  Manager: { tasks: true,  expenses: true,  clients: true,  social: true,  reports: true,  billing: false, settings: false },
  Member:  { tasks: true,  expenses: true,  clients: true,  social: true,  reports: false, billing: false, settings: false },
  Viewer:  { tasks: true,  expenses: true,  clients: true,  social: true,  reports: false, billing: false, settings: false },
};

export function InviteMemberWorkspace({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const { invite, isSubmitting } = useInvitations();

  // Form state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>("Member");
  const [access, setAccess] = useState<Record<string, boolean>>(
    defaultAccess["Member"]
  );
  // Dev: store invite link after success so it can be copied
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // When role changes, reset module access to the role's defaults
  function handleRoleSelect(role: WorkspaceRole) {
    setSelectedRole(role);
    setAccess({ ...defaultAccess[role] });
  }

  function toggleModule(moduleId: string) {
    setAccess((current) => ({ ...current, [moduleId]: !current[moduleId] }));
  }

  // ---------------------------------------------------------------------------
  // Submit — replaces console.log
  // Calls useInvitations.invite() → team.service.ts → future API
  // ---------------------------------------------------------------------------
  async function handleInvite() {
    setEmailError("");

    // Client-side email validation before hitting the service
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError("Email address is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const result = await invite({ email: emailTrimmed, role: selectedRole });

    if (result.error) {
      setEmailError(result.error);
      return;
    }

    // Show the invite link (always available now — backend returns it)
    const link = result.rawToken
      ? `${window.location.protocol}//${window.location.host}/invite/${result.rawToken}`
      : null;
    if (link) {
      setInviteLink(link);
    }

    toast({
      title: "Invitation sent",
      description: `An email has been sent to ${emailTrimmed}.`,
      variant: "success",
    });

    // Only navigate away if we don't have a dev link to show
    if (!link) {
      router.push("/dashboard/team");
    }
  }

  function handleCancel() {
    if (onCancel) onCancel();
    else router.push("/dashboard/team");
  }

  return (
    <div className="mx-auto max-w-[650px] rounded-xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">

      {/* ── Header ── */}
      <div className="border-b border-[#edf0f3] p-8">
        <p className="text-xs text-[#64748b]">Team / Invite Member</p>
        <h1 className="mt-4 text-3xl font-bold">Invite Team Member</h1>
        <p className="mt-5 text-sm text-[#64748b]">
          Send an invitation to join your Foundry workspace
        </p>
      </div>

      <div className="space-y-8 p-8">

        {/* ── Email ── */}
        <div>
          <label className="text-xs font-bold" htmlFor="invite-email">
            Email Address
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            placeholder="colleague@company.com"
            autoComplete="email"
            disabled={isSubmitting}
            className={cn(
              "mt-3 h-12 w-full rounded-lg border px-4 text-sm outline-none transition focus:border-[#f15a24]",
              emailError ? "border-red-400" : "border-[#e5e7eb]"
            )}
          />
          {emailError && (
            <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
          )}
        </div>

        {/* ── Role selector ── */}
        <div>
          <p className="text-xs font-bold">Select Role</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {roleOptions.map((item) => {
              const Icon = item.icon;
              const isActive = selectedRole === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRoleSelect(item.id)}
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-lg border p-5 text-left transition",
                    isActive
                      ? "border-[#f15a24] bg-[#fff7ed]"
                      : "border-[#e5e7eb] bg-white hover:border-[#f15a24]/40"
                  )}
                >
                  <Icon className="h-6 w-6 text-[#f15a24]" />
                  <p className="mt-5 text-sm font-bold">{item.name}</p>
                  <p className="mt-2 text-xs text-[#64748b]">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Module access ── */}
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-5">
          <h2 className="text-sm font-bold">Module Access</h2>
          <p className="mt-1 text-xs text-[#6b7280]">
            Defaults are set by the selected role. You can adjust before sending.
          </p>
          <div className="mt-4 divide-y divide-[#e5e7eb]">
            {moduleOptions.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm">{module.name}</p>
                  <p className="mt-1 text-xs text-[#64748b]">{module.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  disabled={isSubmitting}
                  aria-label={`Toggle ${module.name} access`}
                  className={cn(
                    "h-7 w-12 rounded-full p-0.5 transition",
                    access[module.id] ? "bg-[#f15a24]" : "bg-[#cfd5dd]"
                  )}
                >
                  <span
                    className={cn(
                      "block h-6 w-6 rounded-full bg-white transition-transform duration-200",
                      access[module.id] ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dev invite link (shown in development after successful invite) ── */}
        {inviteLink && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="mb-2 text-xs font-bold text-emerald-700">
              Invitation link (dev mode — share this with the invitee):
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 rounded border border-emerald-200 bg-white px-3 py-2 text-xs text-[#374151] outline-none"
              />
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(inviteLink); }}
                className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Copy
              </button>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/team")}
              className="mt-3 text-xs font-medium text-emerald-700 underline"
            >
              Back to Team
            </button>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-[#e5e7eb] px-5 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInvite}
            disabled={isSubmitting || !!inviteLink}
            className="h-10 rounded-lg bg-[#f15a24] px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Invite Member"}
          </button>
        </div>

      </div>
    </div>
  );
}
