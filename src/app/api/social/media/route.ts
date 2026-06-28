import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { createSocialMedia, getSocialMedia } from "@/services/social.server";

const schema = z.object({
  fileName: z.string().trim().min(1),
  fileUrl: z.string().url(),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().positive().optional(),
  mediaType: z.enum(["image", "video", "document"]),
  altText: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const result = await getSocialMedia(auth.ctx.workspaceId);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }
  const result = await createSocialMedia(auth.ctx.workspaceId, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status, result.code);
  return apiSuccess(result.data, 201);
}
