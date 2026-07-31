import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { deleteSocialPost, getSocialPost, updateSocialPost } from "@/services/social.server";

type Params = { params: Promise<{ id: string }> };

const mediaSchema = z.object({
  fileUrl: z.string().url(),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().positive().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const schema = z.object({
  title: z.string().trim().optional(),
  caption: z.string().trim().min(1).optional(),
  accountIds: z.array(z.string().uuid()).optional(),
  status: z.enum(["draft", "scheduled", "publishing", "published", "failed"]).optional(),
  scheduledAt: z.string().nullable().optional(),
  campaign: z.string().trim().optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  linkUrl: z.string().trim().optional(),
  media: z.array(mediaSchema).optional(),
});

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await getSocialPost(auth.ctx.workspaceId, id);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }
  const result = await updateSocialPost(auth.ctx.workspaceId, auth.ctx.userId, id, parsed.data);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await deleteSocialPost(auth.ctx.workspaceId, auth.ctx.userId, id);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}
