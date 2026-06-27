import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { getNotifications } from "@/services/notification.server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = req.nextUrl;
  const result = await getNotifications(auth.ctx.workspaceId, auth.ctx.userId, {
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 15),
    filter: searchParams.get("filter") ?? undefined,
    priority: searchParams.get("priority") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    dateRange: searchParams.get("dateRange") ?? undefined,
    memberId: searchParams.get("memberId") ?? undefined,
    sort: (searchParams.get("sort") as "asc" | "desc") ?? "desc",
  });

  return apiSuccess(result);
}
