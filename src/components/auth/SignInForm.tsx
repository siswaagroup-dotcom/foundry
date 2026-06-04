"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

import { signInSchema } from "@/lib/validations/auth";
import type { SignInValues } from "@/types/auth";

type SignInFormProps = {
  onForgotPassword: () => void;
};

export function SignInForm({ onForgotPassword }: SignInFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(values: SignInValues) {
    toast({
      title: "Signed in successfully",
      description: `Welcome back to Foundry, ${values.email}.`,
      variant: "success",
    });
    startTransition(() => router.replace("/dashboard"));
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-2.5 sm:space-y-3"
    >
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="signin-email">
          Email
        </Label>

        <div className="relative">
          <Input
            id="signin-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className="h-10 pr-10 text-sm sm:h-11 lg:h-12"
            {...register("email")}
          />

          <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>

        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.email?.message}
        </p>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signin-password">
          Password
        </Label>

        <div className="relative">
          <Input
            id="signin-password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            className="h-10 pr-10 text-sm sm:h-11 lg:h-12"
            {...register("password")}
          />

          <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>

        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.password?.message}
        </p>
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="remember"
            render={({ field }) => (
          <Checkbox
                id="remember"
                disabled={isPending}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Label
            htmlFor="remember"
            className="cursor-pointer text-xs font-normal text-[#6b7280]"
          >
            Remember me
          </Label>
        </div>

        <button
          type="button"
          onClick={onForgotPassword}
          disabled={isPending}
          className="text-xs font-medium text-primary"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full gap-2 text-sm sm:h-11 lg:h-12"
      >
        {isPending ? "Signing in..." : "Sign In"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
