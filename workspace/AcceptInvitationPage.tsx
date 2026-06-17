"use client";

// =============================================================================
// AcceptInvitationPage  —  /invite/[token]
// Handles both:
//   1. Existing user  — accepts immediately (no form)
//   2. New user       — enters name + password first, then accepts
// Token comes from URL param, never typed manually.
// =============================================================================

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Lock, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { setTokens } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";

type Mode = "existing" | "new";

async function acceptViaAPI(token: string, name?: string, password?: string) {
  const res = await fetch("/api/team/invitations/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, name, password }),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Failed to accept invitation");
  }
  return json.data as {
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; email: string };
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
  };
}

export function AcceptInvitationPage() {
  const router     = useRouter();
  const params     = useParams<{ token: string }>();
  const { toast }  = useToast();
  const { setSession } = useAuth();

  const token = params?.token ?? "";

  const [mode, setMode]       = useState<Mode>("existing");
  const [name, setName]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleAccept() {
    setError("");

    if (!token) {
      setError("Invalid invitation link. Please use the link sent to your email.");
      return;
    }

    if (mode === "new") {
      if (!name.trim())        { setError("Your full name is required.");            return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    }

    setIsLoading(true);
    try {
      const data = await acceptViaAPI(
        token,
        mode === "new" ? name.trim() : undefined,
        mode === "new" ? password    : undefined
      );

      // Persist tokens, update global auth context
      setTokens(data.accessToken, data.refreshToken);
      setSession({
        user:          data.user,
        workspace:     { id: data.workspaceId, name: data.workspaceName, slug: data.workspaceSlug, role: "Member" },
        workspaceId:   data.workspaceId,
        workspaceSlug: data.workspaceSlug,
        workspaceName: data.workspaceName,
      });

      toast({ title: `Welcome to ${data.workspaceName}!`, variant: "success" });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-[440px] rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-lg">

        {/* Brand mark */}
        <div className="mb-7 flex items-center gap-3">
          <div
            style={{ background: "linear-gradient(135deg,#f15a24,#e8431a)" }}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-sm font-black text-white"
          >
            S
          </div>
          <span className="text-sm font-bold text-[#111827]">Siswaa</span>
        </div>

        <h1 className="text-[22px] font-bold text-[#111827]">You've been invited!</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Accept this invitation to join a workspace on Siswaa.
        </p>

        {/* Mode tabs */}
        <div className="mt-6 flex rounded-xl border border-[#e5e7eb] p-1">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              mode === "existing"
                ? "bg-[#f15a24] text-white"
                : "text-[#4b5563] hover:bg-[#f3f4f6]"
            }`}
          >
            I have an account
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              mode === "new"
                ? "bg-[#f15a24] text-white"
                : "text-[#4b5563] hover:bg-[#f3f4f6]"
            }`}
          >
            Create new account
          </button>
        </div>

        {/* New user form */}
        {mode === "new" && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#374151]">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isLoading}
                  autoComplete="name"
                  className="h-11 w-full rounded-[10px] border border-[#e5e7eb] pl-4 pr-10 text-sm outline-none focus:border-[#f15a24] focus:ring-2 focus:ring-[#f15a24]/10 disabled:opacity-50"
                />
                <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#374151]">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-[10px] border border-[#e5e7eb] pl-4 pr-10 text-sm outline-none focus:border-[#f15a24] focus:ring-2 focus:ring-[#f15a24]/10 disabled:opacity-50"
                />
                <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              </div>
            </div>
          </div>
        )}

        {/* Existing user message */}
        {mode === "existing" && (
          <p className="mt-5 text-sm text-[#6b7280]">
            You'll join the workspace using your existing Siswaa account credentials.
            Make sure you're accepting with the email address this invitation was sent to.
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleAccept}
          disabled={isLoading}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#f15a24] text-sm font-bold text-white shadow-[0_8px_18px_rgba(241,90,36,0.24)] transition hover:bg-[#e8431a] disabled:opacity-60"
        >
          {isLoading ? "Joining workspace…" : "Accept & Join Workspace"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-5 text-center text-[11px] text-[#9ca3af]">
          This link expires in 7 days.
          <br />
          Contact your workspace admin if it has expired.
        </p>
      </div>
    </main>
  );
}
