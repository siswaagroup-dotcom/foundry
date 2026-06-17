// GET /api/clients   POST /api/clients
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getClients, createClient } from "@/services/client.server";
import type { ClientFilters } from "@/types/client";

const createSchema = z.object({
  name:         z.string().trim().min(1, "Client name is required").max(255),
  companyName:  z.string().optional(),
  industry:     z.string().optional(),
  email:        z.string().email("Invalid email").optional().or(z.literal("")),
  phone:        z.string().optional(),
  location:     z.string().optional(),
  timezone:     z.string().optional(),
  tier:         z.enum(["enterprise", "premium", "standard"]).optional(),
  priority:     z.enum(["high", "normal"]).optional(),
  notes:        z.string().optional(),
  tags:         z.array(z.string()).optional(),
  contactName:  z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const sp = req.nextUrl.searchParams;
  const filters: ClientFilters = {
    search:   sp.get("search")   || undefined,
    tier:     (sp.get("tier")    || undefined) as ClientFilters["tier"],
    priority: (sp.get("priority") || undefined) as ClientFilters["priority"],
    tag:      sp.get("tag")      || undefined,
  };

  const result = await getClients(auth.ctx.workspaceId, filters);
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

  const result = await createClient(auth.ctx.workspaceId, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data, 201);
}
