// GET /api/team/members
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getMembers } from "@/services/team.server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const result = await getMembers(auth.ctx.workspaceId);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}
