import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { deleteNotification } from "@/services/notification.server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  await deleteNotification(auth.ctx.workspaceId, auth.ctx.userId, id);
  return apiSuccess({ id });
}
