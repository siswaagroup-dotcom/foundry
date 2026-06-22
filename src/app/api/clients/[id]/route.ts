// GET /api/clients/:id   PATCH /api/clients/:id   DELETE /api/clients/:id
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getClient, updateClient, deleteClient } from "@/services/client.server";

const updateSchema = z.object({
  name:            z.string().trim().min(1).max(255).optional(),
  companyName:     z.string().optional(),
  industry:        z.string().optional(),
  email:           z.string().email().nullable().optional(),
  phone:           z.string().nullable().optional(),
  location:        z.string().nullable().optional(),
  timezone:        z.string().nullable().optional(),
  tier:            z.enum(["enterprise", "premium", "standard"]).optional(),
  priority:        z.enum(["high", "normal"]).optional(),
  crmStatus:       z.enum(["lead","qualified","proposal_sent","negotiation","advance_received","active_client","completed"]).optional(),
  quotedAmount:    z.number().nonnegative().nullable().optional(),
  advanceReceived: z.number().nonnegative().nullable().optional(),
  paidAmount:      z.number().nonnegative().nullable().optional(),
  notes:           z.string().nullable().optional(),
  tags:            z.array(z.string()).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await getClient(auth.ctx.workspaceId, id);
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
  const result = await updateClient(auth.ctx.workspaceId, id, parsed.data);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await deleteClient(auth.ctx.workspaceId, id);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data);
}
