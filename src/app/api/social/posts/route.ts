import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { createSocialPost, getSocialPosts } from "@/services/social.server";

const mediaSchema = z.object({
  fileUrl: z.string().url(),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().positive().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const schema = z.object({
  title: z.string().trim().optional(),
  caption: z.string().trim().min(1),
  accountIds: z.array(z.string().uuid()).default([]),
  status: z.enum(["draft", "scheduled", "publishing", "published", "failed"]).optional(),
  scheduledAt: z.string().nullable().optional(),
  campaign: z.string().trim().optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  linkUrl: z.string().trim().optional(),
  media: z.array(mediaSchema).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const result = await getSocialPosts(auth.ctx.workspaceId);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  console.log("Create social post route body", body);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("Create social post validation failed", {
      issues: parsed.error.errors,
      body,
    });
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }
  console.log("Create social post parsed media", {
    media: parsed.data.media ?? [],
    mediaCount: parsed.data.media?.length ?? 0,
  });
  const result = await createSocialPost(auth.ctx.workspaceId, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data, 201);
}
