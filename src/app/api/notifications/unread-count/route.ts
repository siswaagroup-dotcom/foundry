import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { getUnreadCount } from "@/services/notification.server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const count = await getUnreadCount(auth.ctx.workspaceId, auth.ctx.userId);
  return apiSuccess(count);
}
