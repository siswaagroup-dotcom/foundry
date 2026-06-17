// PATCH /api/team/members/:id   — change role
// DELETE /api/team/members/:id  — remove member
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { changeMemberRole, removeMember } from "@/services/team.server";

const patchSchema = z.object({
  role: z.enum(["Admin", "Manager", "Member", "Viewer"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400);
  }
  const result = await changeMemberRole(auth.ctx.workspaceId, id, parsed.data.role, auth.ctx.userId);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await removeMember(auth.ctx.workspaceId, id);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}
