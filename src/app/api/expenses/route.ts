// GET /api/expenses   POST /api/expenses
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getExpenses, createExpense } from "@/services/expense.server";
import type { ExpenseFilters } from "@/types/expense";

const createSchema = z.object({
  name:           z.string().trim().min(1).max(500),
  detail:         z.string().optional(),
  category:       z.string().min(1),
  vendor:         z.string().optional(),
  currency:       z.string().length(3).optional(),
  amountPlanned:  z.number().nonnegative(),
  amountIncurred: z.number().nonnegative().optional(),
  status:         z.enum(["planned","pending","approved","incurred","rejected","paid"]).optional(),
  expenseDate:    z.string().min(1),
  clientId:       z.string().uuid().optional(),
  notes:          z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const sp = req.nextUrl.searchParams;
  const filters: ExpenseFilters = {
    status:    (sp.get("status")    || undefined) as ExpenseFilters["status"],
    category:  sp.get("category")  || undefined,
    search:    sp.get("search")    || undefined,
    ownerId:   sp.get("ownerId")   || undefined,
    dateFrom:  sp.get("dateFrom")  || undefined,
    dateTo:    sp.get("dateTo")    || undefined,
    amountMin: sp.has("amountMin") ? parseFloat(sp.get("amountMin")!) : undefined,
    amountMax: sp.has("amountMax") ? parseFloat(sp.get("amountMax")!) : undefined,
  };

  const result = await getExpenses(auth.ctx.workspaceId, filters);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }

  const result = await createExpense(auth.ctx.workspaceId, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data, 201);
}
