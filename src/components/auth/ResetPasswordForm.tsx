"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useResetPassword } from "@/hooks/useAuth";
import { resetPasswordSchema } from "@/lib/validations/auth";
import type { ResetPasswordValues } from "@/types/auth";

type ResetPasswordFormProps = {
  onBack: () => void;
  onComplete: () => void;
  // resetToken is passed from ForgotPasswordForm in dev mode.
  // In production this would come from the URL query param (?token=...).
  resetToken?: string;
};

export function ResetPasswordForm({
  onBack,
  onComplete,
  resetToken,
}: ResetPasswordFormProps) {
  const { toast } = useToast();
  const mutation = useResetPassword();

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    const token = resetToken ?? "";

    if (!token) {
      toast({
        title: "Missing reset token",
        description: "Please request a new password reset link.",
        variant: "error",
      });
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        token,
        password: values.password,
      });
      toast({
        title: "Password reset",
        description: result.message,
        variant: "success",
      });
      onComplete();
    } catch (err) {
      toast({
        title: "Reset failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }

  const isPending = mutation.isPending;

  return (
    <form className="w-full space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1.5">
        <Label htmlFor="reset-password">New Password</Label>
        <div className="relative">
          <Input
            id="reset-password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            disabled={isPending}
            {...register("password")}
          />
          <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>
        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.password?.message}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="reset-confirm-password"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            disabled={isPending}
            {...register("confirmPassword")}
          />
          <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>
        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.confirmPassword?.message}
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full gap-2 text-sm sm:h-11 lg:h-12"
      >
        {isPending ? "Resetting..." : "Reset Password"}
        <ArrowRight className="h-4 w-4" />
      </Button>

      <button
        type="button"
        onClick={onBack}
        disabled={isPending}
        className="mx-auto flex items-center gap-2 text-xs font-medium text-[#6b7280] transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </button>
    </form>
  );
}
