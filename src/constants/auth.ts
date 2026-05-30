import type { AuthMode, AuthTab, SocialProvider } from "@/types/auth";

export const AUTH_TABS: AuthTab[] = [
  { id: "signin", label: "Sign In" },
  { id: "signup", label: "Sign Up" },
];

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  { id: "google", label: "Google" },
  { id: "facebook", label: "Facebook" },
];

export const AUTH_COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in to continue your work",
  },
  signup: {
    title: "Create account",
    subtitle: "Start building with Foundry",
  },
  forgot: {
    title: "Reset password",
    subtitle: "Enter your email to continue",
  },
  reset: {
    title: "New password",
    subtitle: "Create a secure password",
  },
};
