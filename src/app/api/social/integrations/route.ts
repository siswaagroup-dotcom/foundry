import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { getSocialDashboard, saveSocialIntegration } from "@/services/social.server";

const schema = z.object({
  platform: z.enum(["facebook", "instagram", "linkedin", "x", "youtube"]),
  connectionType: z.enum(["oauth", "manual"]),
  displayName: z.string().trim().min(1).max(255),
  connectionName: z.string().trim().optional(),
  credentials: z.record(z.string()).default({}),
  accountName: z.string().trim().optional(),
  handle: z.string().trim().optional(),
  platformUserId: z.string().trim().optional(),
  scopes: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  externalAccountId: z.string().trim().optional(),
  pageId: z.string().trim().optional(),
  channelId: z.string().trim().optional(),
  organizationId: z.string().trim().optional(),
  avatarUrl: z.string().trim().optional(),
  expiresAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const result = await getSocialDashboard(auth.ctx.workspaceId);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data.integrations);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }

  const result = await saveSocialIntegration(auth.ctx.workspaceId, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data, 201);
}
