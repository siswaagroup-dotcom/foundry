import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { verifyAccessToken } from "@/lib/jwt";
import { getMe } from "@/services/auth.server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return apiError("Authorization header required", 401, "MISSING_TOKEN");
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return apiError("Invalid or expired access token", 401, "INVALID_TOKEN");
    }

    const result = await getMe(payload.sub);

    if (!result.success) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess(result.data);
  } catch (error) {
    console.error("[api.auth.me]", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
