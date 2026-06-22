// GET /api/expenses/:id   PATCH /api/expenses/:id   DELETE /api/expenses/:id
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getExpense, updateExpense, deleteExpense } from "@/services/expense.server";

const updateSchema = z.object({
  name:           z.string().trim().min(1).max(500).optional(),
  detail:         z.string().nullable().optional(),
  category:       z.string().optional(),
  vendor:         z.string().nullable().optional(),
  currency:       z.string().length(3).optional(),
  amountPlanned:  z.number().nonnegative().optional(),
  amountIncurred: z.number().nonnegative().nullable().optional(),
  status:         z.enum(["planned","pending","approved","incurred","rejected","paid"]).optional(),
  expenseDate:    z.string().optional(),
  clientId:       z.string().uuid().nullable().optional(),
  notes:          z.string().nullable().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await getExpense(auth.ctx.workspaceId, id);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }
  const result = await updateExpense(auth.ctx.workspaceId, id, parsed.data);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await deleteExpense(auth.ctx.workspaceId, id);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}
