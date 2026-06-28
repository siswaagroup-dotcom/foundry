import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { publishSocialPost } from "@/services/social.server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    console.log("Incoming publish request");
    const auth = await requireAuth(req);
    if (!auth.ok) {
      console.error("Publish auth failed");
      return auth.response;
    }
    const { id } = await params;
    console.log("workspaceId", auth.ctx.workspaceId);
    console.log("userId", auth.ctx.userId);
    console.log("postId", id);

    const result = await publishSocialPost(auth.ctx.workspaceId, auth.ctx.userId, id);
    console.log("publishSocialPost response", result);
    if (!result.success) return apiError(result.error, result.status, result.code);
    return apiSuccess(result.data);
  } catch (error) {
    console.error("Unhandled publish route error", error);
    return apiError(
      error instanceof Error ? error.message : "Unhandled publish route error",
      500,
      "PUBLISH_ROUTE_ERROR"
    );
  }
}
