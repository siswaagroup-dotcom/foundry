// POST /api/team/invite
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { inviteMember } from "@/services/team.server";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  role:  z.enum(["Admin", "Manager", "Member", "Viewer"]),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }

  const result = await inviteMember(
    auth.ctx.workspaceId,
    auth.ctx.userId,
    parsed.data.email,
    parsed.data.role
  );
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data, 201);
}
