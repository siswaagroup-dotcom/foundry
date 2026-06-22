// GET /api/expenses/analytics
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getExpenseAnalytics } from "@/services/expense.server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const result = await getExpenseAnalytics(auth.ctx.workspaceId);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}
