// GET /api/clients/:id/timeline
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getClientTimeline } from "@/services/client.server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await getClientTimeline(auth.ctx.workspaceId, id);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}
