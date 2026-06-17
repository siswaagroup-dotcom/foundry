"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/context/AuthContext";
import { useCurrentUser } from "@/hooks/useAuth";
import { getAccessToken } from "@/services/auth.service";

// ─── Cookie sync ─────────────────────────────────────────────────────────────
// middleware.ts reads the JWT from a cookie (can't access localStorage).
// This component syncs localStorage → cookie on every render so middleware
// always has the latest token to validate.
function syncTokenCookie() {
  if (typeof document === "undefined") return;
  const token = getAccessToken();
  if (token) {
    // Secure in prod; SameSite=Strict prevents CSRF; JS-readable so we can
    // clear it on logout. Max-age matches the access token expiry (15 min).
    document.cookie = `foundry_access_token=${token}; path=/; max-age=900; SameSite=Strict`;
  } else {
    // Clear the cookie when there is no token (after logout)
    document.cookie =
      "foundry_access_token=; path=/; max-age=0; SameSite=Strict";
  }
}

function AuthSessionBootstrap({ children }: { children: React.ReactNode }) {
  useCurrentUser(); // restores session from localStorage on mount

  // Sync token to cookie so middleware can read it
  useEffect(() => {
    syncTokenCookie();
  });

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AuthSessionBootstrap>{children}</AuthSessionBootstrap>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
