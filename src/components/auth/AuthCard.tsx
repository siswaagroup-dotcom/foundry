"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH_COPY } from "@/constants/auth";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { Divider } from "@/components/auth/Divider";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialLogin } from "@/components/auth/SocialLogin";
import type { AuthMode, AuthTabMode } from "@/types/auth";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  // Stores the dev reset token passed back from ForgotPasswordForm
  const [pendingResetToken, setPendingResetToken] = useState<string | undefined>();

  const isTabbedMode = mode === "signin" || mode === "signup";
  const copy = AUTH_COPY[mode];

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const handleTabChange = useCallback((value: AuthTabMode) => {
    setMode(value);
  }, []);

  const showForgotPassword = useCallback(() => {
    setMode("forgot");
  }, []);

  const showSignIn = useCallback(() => {
    setPendingResetToken(undefined);
    setMode("signin");
  }, []);

  // Called by ForgotPasswordForm after the API call succeeds.
  // In dev, the API returns the raw token so the user doesn't need email.
  const showReset = useCallback((resetToken?: string) => {
    setPendingResetToken(resetToken);
    setMode("reset");
  }, []);

  function renderForm() {
    switch (mode) {
      case "signin":
        return <SignInForm onForgotPassword={showForgotPassword} />;
      case "signup":
        return <SignUpForm />;
      case "forgot":
        return (
          <ForgotPasswordForm
            onBack={showSignIn}
            onSent={showReset}
          />
        );
      case "reset":
        return (
          <ResetPasswordForm
            onBack={showForgotPassword}
            onComplete={showSignIn}
            resetToken={pendingResetToken}
          />
        );
      default:
        return null;
    }
  }

  return (
    <section className="auth-fade-in flex max-h-[calc(100dvh-16px)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-auth sm:max-h-[calc(100dvh-32px)] sm:p-4 md:max-w-[420px] lg:max-h-[calc(100dvh-48px)] lg:max-w-[480px] lg:rounded-[22px] lg:bg-white lg:p-5 lg:shadow-authDesktop xl:p-6">
      <AuthHeader title={copy.title} subtitle={copy.subtitle} />

      {isTabbedMode ? (
        <div className="mt-3 sm:mt-4">
          <AuthTabs value={mode} onChange={handleTabChange} />
        </div>
      ) : null}

      <div className="min-h-0">
        <div
          key={mode}
          className={
            isTabbedMode ? "auth-fade-in mt-3 sm:mt-4" : "auth-fade-in mt-4"
          }
        >
          {renderForm()}
        </div>
      </div>

      {isTabbedMode ? (
        <>
          <div className="mt-3 sm:mt-4">
            <Divider />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <SocialLogin />
          </div>
        </>
      ) : null}
    </section>
  );
}
