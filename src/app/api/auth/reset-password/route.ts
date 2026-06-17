// POST /api/auth/reset-password
import { NextRequest } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/services/auth.server";
import { apiSuccess, apiError } from "@/lib/api-response";

const schema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Validation failed";
      return apiError(message, 400, "VALIDATION_ERROR");
    }

    const result = await resetPassword(parsed.data);

    if (!result.success) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess(result.data);
  } catch (error) {
    console.error("[api.auth.reset-password]", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
