// =============================================================================
// SERVER-SIDE AUTH GUARD — used by all API route handlers.
// Extracts and verifies the JWT, returns userId + workspaceId.
// =============================================================================
import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export interface AuthContext {
  userId: string;
  workspaceId: string;
  email: string;
}

export type AuthResult =
  | { ok: true; ctx: AuthContext }
  | { ok: false; response: ReturnType<typeof apiError> };

export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return { ok: false, response: apiError("Unauthorized", 401, "MISSING_TOKEN") };
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return { ok: false, response: apiError("Invalid or expired token", 401, "INVALID_TOKEN") };
  }

  // Resolve the user's active workspace
  const { rows } = await db.query<{ workspace_id: string }>(
    `SELECT wm.workspace_id
     FROM workspace_members wm
     JOIN workspaces w ON w.id = wm.workspace_id
     WHERE wm.user_id = $1
       AND wm.status = 'active'
       AND w.deleted_at IS NULL
     ORDER BY wm.joined_at ASC NULLS LAST
     LIMIT 1`,
    [payload.sub]
  );

  if (rows.length === 0) {
    return { ok: false, response: apiError("No active workspace", 403, "WORKSPACE_MISSING") };
  }

  return {
    ok: true,
    ctx: { userId: payload.sub, email: payload.email, workspaceId: rows[0].workspace_id },
  };
}
