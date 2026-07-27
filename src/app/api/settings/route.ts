import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { getSettings, updateSettings } from "@/services/settings.server";

const stringValue = z.string();

const stageSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  position: z.number().int().positive(),
});

const patchSchema = z.object({
  workspace: z
    .object({
      name: stringValue.optional(),
      logoUrl: stringValue.optional(),
      timezone: stringValue.optional(),
      currency: z.string().trim().length(3).optional(),
      dateFormat: stringValue.optional(),
      language: stringValue.optional(),
    })
    .partial()
    .optional(),
  profile: z
    .object({
      name: stringValue.optional(),
      avatarUrl: stringValue.optional(),
      phone: stringValue.optional(),
      jobTitle: stringValue.optional(),
    })
    .partial()
    .optional(),
  password: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Za-z]/, "Password must include a letter")
        .regex(/[0-9]/, "Password must include a number"),
    })
    .optional(),
  expensePolicies: z
    .object({
      approvalLevels: z.coerce.number().int().min(1).max(10).optional(),
      autoApprovalLimit: stringValue.optional(),
      defaultCurrency: z.string().trim().length(3).optional(),
      reimbursementRules: stringValue.optional(),
    })
    .partial()
    .optional(),
  crm: z
    .object({
      stages: z.array(stageSchema).min(1),
    })
    .optional(),
  integrations: z
    .object({
      resend: z.boolean().optional(),
      resendCredentials: z.object({ newApiKey: z.string().optional() }).optional(),
      openai: z.boolean().optional(),
      openaiCredentials: z.object({ newApiKey: z.string().optional() }).optional(),
      github: z.boolean().optional(),
      githubCredentials: z.object({ newApiKey: z.string().optional() }).optional(),
    })
    .partial()
    .optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const result = await getSettings(auth.ctx.workspaceId, auth.ctx.userId);
  if (!result.success) return apiError(result.error, result.status, result.code);

  return apiSuccess(result.data);
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }

  const result = await updateSettings(auth.ctx.workspaceId, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status, result.code);

  return apiSuccess(result.data);
}
