// GET /api/tasks   — list all tasks for the authenticated workspace
// POST /api/tasks  — create a new task
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getTasks, createTask, type TaskFilters, type TaskStatus, type TaskPriority } from "@/services/task.server";

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  description: z.string().optional(),
  status: z.enum(["todo", "planning", "doing", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = req.nextUrl;
  const filters: TaskFilters = {
    status:     (searchParams.get("status")     as TaskStatus)   || undefined,
    priority:   (searchParams.get("priority")   as TaskPriority) || undefined,
    search:     searchParams.get("search")     || undefined,
    assigneeId: searchParams.get("assigneeId") || undefined,
  };

  const result = await getTasks(auth.ctx.workspaceId, filters);
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

  const result = await createTask(auth.ctx.workspaceId, auth.ctx.userId, parsed.data);
  if (!result.success) return apiError(result.error, result.status);
  return apiSuccess(result.data, 201);
}
