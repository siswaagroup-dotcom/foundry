import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { getSocialAnalytics } from "@/services/social.server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const result = await getSocialAnalytics(auth.ctx.workspaceId);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}
