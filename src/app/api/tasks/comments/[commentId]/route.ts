// DELETE /api/tasks/comments/:commentId
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { deleteComment } from "@/services/task.server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { commentId } = await params;
  const result = await deleteComment(auth.ctx.workspaceId, commentId, auth.ctx.userId);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}
