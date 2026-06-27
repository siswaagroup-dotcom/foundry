"use client";

 

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Lock, User, Loader2, ShieldCheck } from "lucide-react";
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
  const router         = useRouter();
  const params         = useParams<{ token: string }>();
  const { toast }      = useToast();
  const { setSession } = useAuth();

  const token = params?.token ?? "";

  const [mode, setMode]         = useState<Mode>("existing");
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");

  async function handleAccept() {
    setError("");

    if (!token) {
      setError("Invalid invitation link. Please use the link sent to your email.");
      return;
    }

    if (mode === "new") {
      if (!name.trim())        { setError("Your full name is required.");             return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    }

    setIsLoading(true);
    try {
      const data = await acceptViaAPI(
        token,
        mode === "new" ? name.trim() : undefined,
        mode === "new" ? password    : undefined,
      );

      setTokens(data.accessToken, data.refreshToken);
      setSession({
        user:          { ...data.user, emailVerified: false },
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
    <main
      className="relative flex min-h-screen items-center justify-center px-4 antialiased overflow-hidden"
      style={{ background: "#f5f3ef" }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(241,90,36,0.10) 0%, transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-[360px] w-[360px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(120,80,255,0.07) 0%, transparent 65%)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-[22px] bg-white px-8 py-9"
        style={{
          border: "1px solid #ede9e4",
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.07)",
        }}
      >
        {/* Brand */}
        <div className="mb-7 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] text-sm font-black text-white"
            style={{
              background: "linear-gradient(135deg, #f15a24, #c93a0e)",
              boxShadow: "0 3px 10px rgba(241,90,36,0.30)",
            }}
          >
            S
          </div>
          <span className="text-sm font-bold tracking-tight text-[#1a1714]">
            Siswaa
          </span>
        </div>

        {/* Invite badge */}
        <div
          className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
          style={{
            background: "#fff5f1",
            border: "1px solid #fcd4c2",
            color: "#c94a15",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "#f15a24",
              animation: "siswaa-pulse 2s infinite",
            }}
          />
          Workspace invitation
        </div>

        {/* Heading */}
        <h1 className="text-[23px] font-bold leading-snug tracking-tight text-[#1a1714]">
          You've been invited
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#847f7a]">
          Join your team on Siswaa and start collaborating right away.
        </p>

        {/* Tabs */}
        <div
          className="mt-6 flex gap-1 rounded-xl p-1"
          style={{ background: "#f5f3ef", border: "1px solid #ede9e4" }}
        >
          {(["existing", "new"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-150"
              style={
                mode === m
                  ? {
                      background: "#ffffff",
                      border: "1px solid #ede9e4",
                      color: "#1a1714",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    }
                  : { color: "#9e998f" }
              }
            >
              {m === "existing" ? "I have an account" : "Create account"}
            </button>
          ))}
        </div>

        {/* Existing user info */}
        {mode === "existing" && (
          <div
            className="mt-5 flex items-start gap-2.5 rounded-xl p-3.5"
            style={{ background: "#fafaf9", border: "1px solid #ede9e4" }}
          >
            <ShieldCheck
              className="mt-px h-4 w-4 flex-shrink-0"
              style={{ color: "#f15a24" }}
            />
            <p className="text-[13px] leading-relaxed text-[#847f7a]">
              You'll join using your existing Siswaa credentials. Use the email
              address this invitation was sent to.
            </p>
          </div>
        )}

        {/* New user form */}
        {mode === "new" && (
          <div className="mt-5 space-y-4">
            {/* Full name */}
            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "#6b6660" }}
              >
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
                  className="h-11 w-full rounded-[10px] pl-4 pr-10 text-sm text-[#1a1714] outline-none transition disabled:opacity-50"
                  style={{
                    background: "#fafaf9",
                    border: "1px solid #e6e1db",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #f15a24";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(241,90,36,0.10)";
                    e.currentTarget.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid #e6e1db";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#fafaf9";
                  }}
                />
                <User
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "#c9c4bc" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "#6b6660" }}
              >
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
                  className="h-11 w-full rounded-[10px] pl-4 pr-10 text-sm text-[#1a1714] outline-none transition disabled:opacity-50"
                  style={{
                    background: "#fafaf9",
                    border: "1px solid #e6e1db",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #f15a24";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(241,90,36,0.10)";
                    e.currentTarget.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid #e6e1db";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#fafaf9";
                  }}
                />
                <Lock
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "#c9c4bc" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mt-4 rounded-xl p-3.5"
            style={{
              background: "rgba(220,38,38,0.06)",
              border: "1px solid rgba(220,38,38,0.20)",
            }}
          >
            <p className="text-xs font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleAccept}
          disabled={isLoading}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] text-sm font-bold text-white transition-all active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #f15a24, #c93a0e)",
            boxShadow:
              "0 4px 18px rgba(241,90,36,0.28), 0 1px 3px rgba(201,58,14,0.25)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 8px 28px rgba(241,90,36,0.34)";
            (e.currentTarget as HTMLButtonElement).style.filter =
              "brightness(1.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 18px rgba(241,90,36,0.28), 0 1px 3px rgba(201,58,14,0.25)";
            (e.currentTarget as HTMLButtonElement).style.filter = "none";
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining workspace…
            </>
          ) : (
            <>
              Accept and join workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-[#b8b3ac]">
          This invitation expires in{" "}
          <span className="font-semibold text-[#f15a24]">7 days</span>.
          <br />
          Contact your workspace admin if it has expired.
        </p>
      </div>

      {/* Pulse keyframe — injected once */}
      <style>{`
        @keyframes siswaa-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </main>
  );
}