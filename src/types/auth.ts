import type { z } from "zod";
import type {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

export type AuthMode = "signin" | "signup" | "forgot" | "reset";
export type AuthTabMode = "signin" | "signup";

export type AuthTab = {
  id: AuthTabMode;
  label: string;
};

export type SocialProvider = {
  id: "google";
  label: string;
};

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
