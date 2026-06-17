// POST /api/admin/cleanup-invitations
// One-time utility route: removes stale invitation rows created by the
// old in-memory service layer before the real DB integration was active.
//
// SECURITY: Requires the ADMIN_CLEANUP_SECRET header to match
//           process.env.ADMIN_CLEANUP_SECRET
// Run once, then delete this file.
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_CLEANUP_SECRET) {
    return apiError("Unauthorized", 401);
  }

  try {
    // 1. Delete rows with NULL token_hash
    const nullResult = await db.query(
      "DELETE FROM workspace_invitations WHERE token_hash IS NULL"
    );

    // 2. Delete rows with invalid token_hash (not 64-char hex)
    const invalidResult = await db.query(
      `DELETE FROM workspace_invitations
       WHERE token_hash IS NOT NULL
         AND (length(token_hash) <> 64 OR token_hash !~ '^[0-9a-f]{64}$')`
    );

    // 3. Expire overdue pending invitations
    const expireResult = await db.query(
      `UPDATE workspace_invitations
       SET status = 'expired'
       WHERE status = 'pending' AND expires_at < NOW()`
    );

    // 4. Count what remains
    const { rows: countRows } = await db.query<{
      total: string; pending: string; accepted: string; expired: string; revoked: string;
    }>(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'pending')  AS pending,
         COUNT(*) FILTER (WHERE status = 'accepted') AS accepted,
         COUNT(*) FILTER (WHERE status = 'expired')  AS expired,
         COUNT(*) FILTER (WHERE status = 'revoked')  AS revoked
       FROM workspace_invitations`
    );

    return apiSuccess({
      deletedNullHash:    nullResult.rowCount ?? 0,
      deletedInvalidHash: invalidResult.rowCount ?? 0,
      markedExpired:      expireResult.rowCount ?? 0,
      remaining:          countRows[0],
    });
  } catch (err) {
    console.error("[cleanup-invitations]", err);
    return apiError("Cleanup failed", 500);
  }
}
