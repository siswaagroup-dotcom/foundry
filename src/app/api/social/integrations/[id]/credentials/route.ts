import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { getSocialIntegrationCredentials } from "@/services/social.server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const result = await getSocialIntegrationCredentials(id, auth.ctx.workspaceId);
  if (!result.success) return apiError(result.error, result.status, result.code);

  return apiSuccess(result.data);
}
