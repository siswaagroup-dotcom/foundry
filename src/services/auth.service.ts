const BASE = "/api/auth";

const ACCESS_KEY = "foundry_access_token";
const REFRESH_KEY = "foundry_refresh_token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthWorkspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  workspace: AuthWorkspace;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
}

export type CurrentSession = Omit<AuthSession, "accessToken" | "refreshToken">;

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
  businessType?: string;
  timezone?: string;
  currency?: string;
}

export interface SignInInput {
  email: string;
  password: string;
  remember?: boolean;
}

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error?: { message?: string; code?: string } };

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!json?.success) {
    throw new Error(json?.error?.message ?? "Request failed");
  }

  return json.data;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return parseResponse<T>(response);
}

export async function signUp(input: SignUpInput): Promise<AuthSession> {
  const session = await post<AuthSession>("/signup", input);
  setTokens(session.accessToken, session.refreshToken);
  return session;
}

export async function signIn(input: SignInInput): Promise<AuthSession> {
  const session = await post<AuthSession>("/login", {
    email: input.email,
    password: input.password,
  });
  setTokens(session.accessToken, session.refreshToken);
  return session;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  clearTokens();

  if (refreshToken) {
    await post("/logout", { refreshToken }).catch(() => undefined);
  }
}

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    const refreshed = await refreshTokens();

    if (!refreshed) {
      // Both access and refresh tokens are invalid/expired.
      // Clear everything and redirect to login — do not loop.
      clearTokens();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
      return null;
    }

    return getCurrentSession();
  }

  return parseResponse<CurrentSession>(response);
}

export async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return false;
  }

  try {
    const tokens = await post<{ accessToken: string; refreshToken: string }>(
      "/refresh",
      { refreshToken }
    );
    setTokens(tokens.accessToken, tokens.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// ─── Forgot / Reset Password ─────────────────────────────────────────────────

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<{ message: string; resetToken?: string }> {
  return post<{ message: string; resetToken?: string }>(
    "/forgot-password",
    input
  );
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<{ message: string }> {
  return post<{ message: string }>("/reset-password", input);
}
