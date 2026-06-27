import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { markAllNotificationsAsRead } from "@/services/notification.server";

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  await markAllNotificationsAsRead(auth.ctx.workspaceId, auth.ctx.userId);
  return apiSuccess({ success: true });
}
