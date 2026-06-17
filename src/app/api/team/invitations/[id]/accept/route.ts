// POST /api/team/invitations/:id/accept
// Called by the accept-invitation page after user signs in or signs up.
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/api-response";
import { acceptInvitation } from "@/services/team.server";

const schema = z.object({
  token:    z.string().min(1, "Token is required"),
  name:     z.string().optional(),
  password: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }
  const result = await acceptInvitation(parsed.data, req);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}
