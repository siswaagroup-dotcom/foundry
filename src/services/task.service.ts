// =============================================================================
// TASK SERVICE — client-side fetch wrapper
// =============================================================================
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type { Task, TaskComment, TaskFilters, CreateTaskInput, UpdateTaskInput } from "./task.server";

export type { Task, TaskComment, TaskFilters, CreateTaskInput, UpdateTaskInput };
export type { TaskStatus, TaskPriority } from "./task.server";

const BASE = "/api/tasks";

function buildQuery(filters: TaskFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.status)     params.set("status",     filters.status);
  if (filters.priority)   params.set("priority",   filters.priority);
  if (filters.search)     params.set("search",     filters.search);
  if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  return apiGet<Task[]>(`${BASE}${buildQuery(filters)}`);
}

export function fetchTask(id: string): Promise<Task> {
  return apiGet<Task>(`${BASE}/${id}`);
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return apiPost<Task>(BASE, input);
}

export function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return apiPatch<Task>(`${BASE}/${id}`, input);
}

export function deleteTask(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`${BASE}/${id}`);
}

export function fetchComments(taskId: string): Promise<TaskComment[]> {
  return apiGet<TaskComment[]>(`${BASE}/${taskId}/comments`);
}

export function addComment(taskId: string, body: string): Promise<TaskComment> {
  return apiPost<TaskComment>(`${BASE}/${taskId}/comments`, { body });
}

export function deleteComment(commentId: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`${BASE}/comments/${commentId}`);
}
