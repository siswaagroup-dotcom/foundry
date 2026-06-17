// POST /api/auth/signup
import { NextRequest } from "next/server";
import { z } from "zod";
import { signUp } from "@/services/auth.server";
import { apiSuccess, apiError } from "@/lib/api-response";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  workspaceName: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(255, "Workspace name must be 255 characters or less"),
  businessType: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Validation failed";
      return apiError(message, 400, "VALIDATION_ERROR");
    }

    const result = await signUp(parsed.data, req);
    if (!result.success) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess(result.data, 201);
  } catch (error) {
    console.error("[api.auth.signup]", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
