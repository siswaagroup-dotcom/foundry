// GET  /api/tasks/:id/comments
// POST /api/tasks/:id/comments
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getComments, addComment } from "@/services/task.server";

const addSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(5000),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await getComments(auth.ctx.workspaceId, id);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400);
  }
  const result = await addComment(auth.ctx.workspaceId, id, auth.ctx.userId, parsed.data.body);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data, 201);
}
