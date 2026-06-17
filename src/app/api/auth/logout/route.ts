// POST /api/auth/logout
import { NextRequest } from "next/server";
import { signOut } from "@/services/auth.server";
import { verifyRefreshToken } from "@/lib/jwt";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const refreshToken: string = body?.refreshToken ?? "";

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await signOut(payload.sessionId);
      } catch {
        // Token invalid/expired — still treat as successful logout
      }
    }

    return apiSuccess({ message: "Logged out successfully" });
  } catch (error) {
    console.error("[api.auth.logout]", error);
    return apiError("Logout failed", 500, "INTERNAL_ERROR");
  }
}
