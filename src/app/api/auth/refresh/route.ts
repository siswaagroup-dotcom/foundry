// POST /api/auth/refresh
import { NextRequest } from "next/server";
import { verifyRefreshToken } from "@/lib/jwt";
import { refreshSession } from "@/services/auth.server";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const refreshToken: string = body?.refreshToken ?? "";

    if (!refreshToken) {
      return apiError("Refresh token required", 400, "MISSING_TOKEN");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return apiError("Invalid or expired refresh token", 401, "INVALID_TOKEN");
    }

    const result = await refreshSession(payload.sessionId, payload.sub, req);
    if (!result.success) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess(result.data);
  } catch (error) {
    console.error("[api.auth.refresh]", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
