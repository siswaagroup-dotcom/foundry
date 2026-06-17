"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  AuthSession,
  AuthUser,
  AuthWorkspace,
  CurrentSession,
} from "@/services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  workspace: AuthWorkspace | null;
  workspaceId: string | null;
  workspaceSlug: string | null;
  workspaceName: string | null;
  isAuthenticated: boolean;
  setSession: (session: CurrentSession | AuthSession | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<CurrentSession | null>(null);

  const setSession = useCallback((nextSession: CurrentSession | AuthSession | null) => {
    if (!nextSession) {
      setSessionState(null);
      return;
    }

    setSessionState({
      user: nextSession.user,
      workspace: nextSession.workspace,
      workspaceId: nextSession.workspaceId,
      workspaceSlug: nextSession.workspaceSlug,
      workspaceName: nextSession.workspaceName,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      workspace: session?.workspace ?? null,
      workspaceId: session?.workspaceId ?? null,
      workspaceSlug: session?.workspaceSlug ?? null,
      workspaceName: session?.workspaceName ?? null,
      isAuthenticated: Boolean(session?.user),
      setSession,
    }),
    [session, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
