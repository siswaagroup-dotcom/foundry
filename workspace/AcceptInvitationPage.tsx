"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Lock,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { setTokens } from "@/services/auth.service";

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
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const { toast } = useToast();
  const { setSession } = useAuth();

  const token = params?.token ?? "";
  const workspaceName = "Siswaa";

  const [mode, setMode] = useState<Mode>("existing");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setError("");

    if (!token) {
      setError("Invalid invitation link. Please use the link sent to your email.");
      return;
    }

    if (mode === "new") {
      if (!name.trim()) {
        setError("Your full name is required.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const data = await acceptViaAPI(
        token,
        mode === "new" ? name.trim() : undefined,
        mode === "new" ? password : undefined,
      );

      setTokens(data.accessToken, data.refreshToken);
      setSession({
        user: { ...data.user, emailVerified: false },
        workspace: {
          id: data.workspaceId,
          name: data.workspaceName,
          slug: data.workspaceSlug,
          role: "Member",
        },
        workspaceId: data.workspaceId,
        workspaceSlug: data.workspaceSlug,
        workspaceName: data.workspaceName,
      });

      toast({ title: `Welcome to ${data.workspaceName}!`, variant: "success" });
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const infoText =
    mode === "existing"
      ? "You'll join using your existing account associated with this invitation."
      : "Create a new account to accept this invitation.";

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#F8FAFC] px-4 py-8 antialiased sm:px-6 lg:px-8">
      <section className="w-[calc(100%-32px)] max-w-[560px] rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-7 shadow-[0_18px_60px_rgba(15,23,42,0.10),0_2px_10px_rgba(15,23,42,0.04)] sm:w-full sm:max-w-[480px] sm:px-8 sm:py-8 lg:max-w-[560px] lg:px-9 lg:py-9">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#F15A24] text-xl font-black text-white shadow-[0_10px_24px_rgba(241,90,36,0.28)]">
            S
          </div>

          <div className="mt-4 text-sm font-semibold text-[#111827]">
            {workspaceName}
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C2410C]">
            <Sparkles className="h-3.5 w-3.5" />
            Workspace invitation
          </div>

          <h1 className="mt-6 text-[24px] font-bold leading-tight tracking-[-0.01em] text-[#111827] sm:text-[32px]">
            You've been invited
          </h1>

          <p className="mt-3 max-w-[420px] text-center text-[15px] leading-6 text-[#6B7280]">
            Join <span className="font-semibold text-[#111827]">{workspaceName}</span>{" "}
            and start collaborating with your team.
          </p>
        </div>

        <div className="mt-8 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-1 shadow-inner">
          <div className="relative grid grid-cols-2">
            <div
              className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-white shadow-[0_4px_14px_rgba(15,23,42,0.10)] transition-transform duration-300 ease-out"
              style={{
                transform:
                  mode === "existing" ? "translateX(0)" : "translateX(100%)",
              }}
            />
            {(["existing", "new"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                disabled={isLoading}
                className="relative z-10 flex h-12 items-center justify-center rounded-full px-3 text-center text-[13px] font-semibold transition-colors duration-200 disabled:pointer-events-none"
                style={{
                  color: mode === m ? "#111827" : "#6B7280",
                }}
              >
                {m === "existing" ? "I already have an account" : "Create new account"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4 text-left">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#EA580C] shadow-sm">
            {mode === "existing" ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
          <p className="pt-1 text-sm leading-6 text-[#9A3412]">{infoText}</p>
        </div>

        {mode === "new" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                Full name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  disabled={isLoading}
                  autoComplete="name"
                  className="h-12 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 pr-11 text-sm text-[#111827] outline-none transition focus:border-[#F15A24] focus:bg-white focus:ring-4 focus:ring-[#F15A24]/10 disabled:opacity-50"
                />
                <User className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 pr-11 text-sm text-[#111827] outline-none transition focus:border-[#F15A24] focus:bg-white focus:ring-4 focus:ring-[#F15A24]/10 disabled:opacity-50"
                />
                <Lock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold leading-5 text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 px-0 sm:px-6">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isLoading}
            className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#111827] px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(17,24,39,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0B1220] hover:shadow-[0_16px_34px_rgba(17,24,39,0.24)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining workspace...
              </>
            ) : (
              <>
                Accept Invitation
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#374151]">
            <Clock3 className="h-4 w-4 text-[#F15A24]" />
            <span>
              Expires in <strong>7 days</strong>
            </span>
          </div>
          <p className="mt-2 text-sm leading-5 text-[#6B7280]">
            Need help?
            <br />
            Contact your workspace administrator.
          </p>
        </div>
      </section>
    </main>
  );
}
