// POST /api/expenses/:id/attachments
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { addExpenseAttachment } from "@/services/expense.server";

const schema = z.object({
  fileName:      z.string().trim().min(1).max(500),
  fileUrl:       z.string().trim().url(),
  fileSizeBytes: z.number().int().positive().nullable().optional(),
  mimeType:      z.string().trim().max(100).nullable().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }

  const result = await addExpenseAttachment(auth.ctx.workspaceId, id, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data, 201);
}
