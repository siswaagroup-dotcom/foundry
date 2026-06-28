import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { deleteSocialMedia } from "@/services/social.server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await deleteSocialMedia(auth.ctx.workspaceId, auth.ctx.userId, id);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}
