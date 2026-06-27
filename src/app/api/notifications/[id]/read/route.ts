import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { markNotificationAsRead } from "@/services/notification.server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  await markNotificationAsRead(auth.ctx.workspaceId, auth.ctx.userId, id);
  return apiSuccess({ id });
}
