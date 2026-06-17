"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuth as useAuthContext } from "@/context/AuthContext";
import {
  forgotPassword,
  getCurrentSession,
  logout,
  resetPassword,
  signIn,
  signUp,
  type AuthSession,
  type CurrentSession,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
} from "@/services/auth.service";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

function applySession(
  setSession: ReturnType<typeof useAuthContext>["setSession"],
  session: CurrentSession | AuthSession | null
) {
  setSession(session);
  return session;
}

// ─── useCurrentUser ──────────────────────────────────────────────────────────
// Fetches current session on mount; syncs result into AuthContext.
export function useCurrentUser() {
  const { setSession } = useAuthContext();

  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentSession,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!query.isLoading) {
      setSession(query.data ?? null);
    }
  }, [query.data, query.isLoading, setSession]);

  return query;
}

// ─── useSignIn ────────────────────────────────────────────────────────────────
export function useSignIn() {
  const queryClient = useQueryClient();
  const { setSession } = useAuthContext();

  return useMutation({
    mutationFn: (input: SignInInput) => signIn(input),
    onSuccess: (session) => {
      applySession(setSession, session);
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        user: session.user,
        workspace: session.workspace,
        workspaceId: session.workspaceId,
        workspaceSlug: session.workspaceSlug,
        workspaceName: session.workspaceName,
      });
    },
  });
}

// ─── useSignUp ────────────────────────────────────────────────────────────────
export function useSignUp() {
  const queryClient = useQueryClient();
  const { setSession } = useAuthContext();

  return useMutation({
    mutationFn: (input: SignUpInput) => signUp(input),
    onSuccess: (session) => {
      applySession(setSession, session);
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        user: session.user,
        workspace: session.workspace,
        workspaceId: session.workspaceId,
        workspaceSlug: session.workspaceSlug,
        workspaceName: session.workspaceName,
      });
    },
  });
}

// ─── useLogout ────────────────────────────────────────────────────────────────
export function useLogout() {
  const queryClient = useQueryClient();
  const { setSession } = useAuthContext();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setSession(null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      // Clear the middleware cookie immediately
      if (typeof document !== "undefined") {
        document.cookie =
          "foundry_access_token=; path=/; max-age=0; SameSite=Strict";
      }
    },
  });
}

// ─── useForgotPassword ────────────────────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input),
  });
}

// ─── useResetPassword ─────────────────────────────────────────────────────────
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => resetPassword(input),
  });
}

// Re-export context hook for convenience
export { useAuthContext as useAuth };
