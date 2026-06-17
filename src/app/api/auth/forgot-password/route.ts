// POST /api/auth/forgot-password
import { NextRequest } from "next/server";
import { z } from "zod";
import { forgotPassword } from "@/services/auth.server";
import { apiSuccess, apiError } from "@/lib/api-response";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Validation failed";
      return apiError(message, 400, "VALIDATION_ERROR");
    }

    const result = await forgotPassword(parsed.data);

    if (!result.success) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess(result.data);
  } catch (error) {
    console.error("[api.auth.forgot-password]", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
