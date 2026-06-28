import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { scheduleSocialPost } from "@/services/social.server";

type Params = { params: Promise<{ id: string }> };
const schema = z.object({ scheduledAt: z.string().min(1) });

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Scheduled date is required", 400, "VALIDATION_ERROR");
  const result = await scheduleSocialPost(auth.ctx.workspaceId, auth.ctx.userId, id, parsed.data.scheduledAt);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}
