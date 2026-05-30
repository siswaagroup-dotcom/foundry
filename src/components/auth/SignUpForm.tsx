"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

import { signUpSchema } from "@/lib/validations/auth";
import type { SignUpValues } from "@/types/auth";

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  async function onSubmit(values: SignUpValues) {
    setIsLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    toast({
      title: "Account created",
      description: `Your Foundry workspace is ready, ${values.name}.`,
      variant: "success",
    });
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-2.5 sm:space-y-3"
    >
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">
          Full Name
        </Label>

        <div className="relative">
          <Input
            id="signup-name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            {...register("name")}
            className="h-10 pr-10 text-sm sm:h-11 lg:h-12"
          />

          <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>

        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.name?.message}
        </p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">
          Email
        </Label>

        <div className="relative">
          <Input
            id="signup-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            {...register("email")}
            className="h-10 pr-10 text-sm sm:h-11 lg:h-12"
          />

          <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>

        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.email?.message}
        </p>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">
          Password
        </Label>

        <div className="relative">
          <Input
            id="signup-password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            {...register("password")}
            className="h-10 pr-10 text-sm sm:h-11 lg:h-12"
          />

          <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
        </div>

        <p className="min-h-3 text-[11px] leading-3 text-primary">
          {errors.password?.message}
        </p>
      </div>

      {/* Terms */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <Checkbox
                id="terms"
                disabled={isLoading}
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            )}
          />

          <Label
            htmlFor="terms"
            className="cursor-pointer text-xs font-normal leading-4 text-[#6b7280]"
          >
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>

        <p className="min-h-3 pl-6 text-[11px] leading-3 text-primary">
          {errors.terms?.message}
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-10 w-full gap-2 text-sm sm:h-11 lg:h-12"
      >
        {isLoading ? "Creating account..." : "Create Account"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
