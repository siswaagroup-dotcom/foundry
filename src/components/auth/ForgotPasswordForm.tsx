"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useForgotPassword } from "@/hooks/useAuth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import type { ForgotPasswordValues } from "@/types/auth";

type ForgotPasswordFormProps = {
  onBack: () => void;
  // onSent receives the resetToken (available in dev) so ResetPasswordForm
  // can pre-fill it without the user having to check their email in dev mode.
  onSent: (resetToken?: string) => void;
};

export function ForgotPasswordForm({ onBack, onSent }: ForgotPasswordFormProps) {
  const { toast } = useToast();
  const mutation = useForgotPassword();

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      const result = await mutation.mutateAsync({ email: values.email });
      toast({
        title: "Reset link sent",
        description: result.message,
        variant: "success",
      });
      // Pass dev token (if present) to the reset form
      onSent(result.resetToken);
    } catch (err) {
      toast({
        title: "Request failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    }
  }

  const isPending = mutation.isPending;

  return (
    <form className="w-full space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <div className="relative">
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={isPending}
            {...register("email")}
          />
          <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>
        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.email?.message}
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full gap-2 text-sm sm:h-11 lg:h-12"
      >
        {isPending ? "Sending..." : "Continue"}
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
