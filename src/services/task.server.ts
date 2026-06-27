// =============================================================================
// TASK SERVICE — server-side (API route handlers only)
// All queries are workspace-scoped for multi-tenant isolation.
// =============================================================================
import { db } from "@/lib/db";
import { createNotification } from "@/services/notification.server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "planning" | "doing" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  assignees: TaskAssignee[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  userId: string;
  name: string;
  initials: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  assigneeId?: string;
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number; code?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function attachTaskDetails(
  taskRows: Array<{
    id: string; workspace_id: string; title: string; description: string | null;
    status: string; priority: string; due_date: string | null;
    created_by: string; created_at: string; updated_at: string;
  }>
): Promise<Task[]> {
  if (taskRows.length === 0) return [];

  const taskIds = taskRows.map((t) => t.id);

  // Fetch tags
  const { rows: tagRows } = await db.query<{ task_id: string; tag: string }>(
    `SELECT task_id, tag FROM task_tags WHERE task_id = ANY($1)`,
    [taskIds]
  );

  // Fetch assignees with user names
  const { rows: assigneeRows } = await db.query<{
    task_id: string; user_id: string; name: string;
  }>(
    `SELECT ta.task_id, ta.user_id, u.name
     FROM task_assignees ta
     JOIN users u ON u.id = ta.user_id
     WHERE ta.task_id = ANY($1)`,
    [taskIds]
  );

  const tagsByTask = new Map<string, string[]>();
  tagRows.forEach((r) => {
    const list = tagsByTask.get(r.task_id) ?? [];
    list.push(r.tag);
    tagsByTask.set(r.task_id, list);
  });

  const assigneesByTask = new Map<string, TaskAssignee[]>();
  assigneeRows.forEach((r) => {
    const list = assigneesByTask.get(r.task_id) ?? [];
    list.push({ userId: r.user_id, name: r.name, initials: getInitials(r.name) });
    assigneesByTask.set(r.task_id, list);
  });

  return taskRows.map((t) => ({
    id: t.id,
    workspaceId: t.workspace_id,
    title: t.title,
    description: t.description,
    status: t.status as TaskStatus,
    priority: t.priority as TaskPriority,
    dueDate: t.due_date,
    tags: tagsByTask.get(t.id) ?? [],
    assignees: assigneesByTask.get(t.id) ?? [],
    createdBy: t.created_by,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
}

// ─── getTasks ─────────────────────────────────────────────────────────────────

export async function getTasks(
  workspaceId: string,
  filters: TaskFilters = {}
): Promise<ServiceResult<Task[]>> {
  try {
    const conditions: string[] = ["t.workspace_id = $1", "t.deleted_at IS NULL"];
    const params: unknown[] = [workspaceId];
    let idx = 2;

    if (filters.status) {
      conditions.push(`t.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.priority) {
      conditions.push(`t.priority = $${idx++}`);
      params.push(filters.priority);
    }
    if (filters.search) {
      conditions.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
      params.push(`%${filters.search}%`);
      idx++;
    }
    if (filters.assigneeId) {
      conditions.push(
        `EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = $${idx++})`
      );
      params.push(filters.assigneeId);
    }

    const { rows } = await db.query(
      `SELECT t.id, t.workspace_id, t.title, t.description, t.status, t.priority,
              t.due_date, t.created_by, t.created_at, t.updated_at
       FROM tasks t
       WHERE ${conditions.join(" AND ")}
       ORDER BY t.created_at ASC`,
      params
    );

    const tasks = await attachTaskDetails(rows);
    return { success: true, data: tasks };
  } catch (err) {
    console.error("[task.getTasks]", err);
    return { success: false, error: "Failed to fetch tasks", status: 500 };
  }
}

// ─── getTask ──────────────────────────────────────────────────────────────────

export async function getTask(
  workspaceId: string,
  taskId: string
): Promise<ServiceResult<Task>> {
  try {
    const { rows } = await db.query(
      `SELECT t.id, t.workspace_id, t.title, t.description, t.status, t.priority,
              t.due_date, t.created_by, t.created_at, t.updated_at
       FROM tasks t
       WHERE t.id = $1 AND t.workspace_id = $2 AND t.deleted_at IS NULL`,
      [taskId, workspaceId]
    );

    if (rows.length === 0) {
      return { success: false, error: "Task not found", status: 404 };
    }

    const [task] = await attachTaskDetails(rows);
    return { success: true, data: task };
  } catch (err) {
    console.error("[task.getTask]", err);
    return { success: false, error: "Failed to fetch task", status: 500 };
  }
}

// ─── createTask ───────────────────────────────────────────────────────────────

export async function createTask(
  workspaceId: string,
  userId: string,
  input: CreateTaskInput
): Promise<ServiceResult<Task>> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO tasks (workspace_id, title, description, status, priority, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        workspaceId,
        input.title.trim(),
        input.description?.trim() || null,
        input.status ?? "todo",
        input.priority ?? "medium",
        input.dueDate ?? null,
        userId,
      ]
    );

    const taskId = rows[0].id;

    // Insert tags
    if (input.tags && input.tags.length > 0) {
      for (const tag of input.tags) {
        await client.query(
          "INSERT INTO task_tags (task_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [taskId, tag.trim()]
        );
      }
    }

    // Auto-assign creator
    await client.query(
      `INSERT INTO task_assignees (task_id, user_id, assigned_by)
       VALUES ($1, $2, $2) ON CONFLICT DO NOTHING`,
      [taskId, userId]
    );

    await client.query("COMMIT");

    await createNotification({
      workspaceId,
      userId: userId,
      type: "task_assigned",
      title: "Task created",
      description: `Task "${input.title.trim()}" was created for you`,
      actorId: userId,
      entityType: "task",
      entityId: taskId,
      priority: "normal",
    });

    const result = await getTask(workspaceId, taskId);
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[task.createTask]", err);
    return { success: false, error: "Failed to create task", status: 500 };
  } finally {
    client.release();
  }
}

// ─── updateTask ───────────────────────────────────────────────────────────────

export async function updateTask(
  workspaceId: string,
  taskId: string,
  userId: string,
  input: UpdateTaskInput
): Promise<ServiceResult<Task>> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Verify ownership
    const { rows: existing } = await client.query(
      "SELECT id FROM tasks WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL",
      [taskId, workspaceId]
    );
    if (existing.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Task not found", status: 404 };
    }

    const sets: string[] = ["updated_at = NOW()"];
    const params: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined)       { sets.push(`title = $${idx++}`);       params.push(input.title.trim()); }
    if (input.description !== undefined) { sets.push(`description = $${idx++}`); params.push(input.description?.trim() || null); }
    if (input.status !== undefined)      { sets.push(`status = $${idx++}`);      params.push(input.status); }
    if (input.priority !== undefined)    { sets.push(`priority = $${idx++}`);    params.push(input.priority); }
    if ("dueDate" in input)              { sets.push(`due_date = $${idx++}`);     params.push(input.dueDate ?? null); }

    if (params.length > 0) {
      params.push(taskId, workspaceId);
      await client.query(
        `UPDATE tasks SET ${sets.join(", ")} WHERE id = $${idx} AND workspace_id = $${idx + 1}`,
        params
      );
    }

    // Replace tags if provided
    if (input.tags !== undefined) {
      await client.query("DELETE FROM task_tags WHERE task_id = $1", [taskId]);
      for (const tag of input.tags) {
        if (tag.trim()) {
          await client.query(
            "INSERT INTO task_tags (task_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [taskId, tag.trim()]
          );
        }
      }
    }

    await createNotification({
      workspaceId,
      userId: userId,
      type: "task_updated",
      title: "Task updated",
      description: `Task "${input.title?.trim() ?? "updated"}" was updated`,
      actorId: userId,
      entityType: "task",
      entityId: taskId,
      priority: "normal",
      client,
    });

    await client.query("COMMIT");
    return getTask(workspaceId, taskId);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[task.updateTask]", err);
    return { success: false, error: "Failed to update task", status: 500 };
  } finally {
    client.release();
  }
}

// ─── deleteTask ───────────────────────────────────────────────────────────────

export async function deleteTask(
  workspaceId: string,
  taskId: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    const { rowCount } = await db.query(
      `UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL`,
      [taskId, workspaceId]
    );
    if ((rowCount ?? 0) === 0) {
      return { success: false, error: "Task not found", status: 404 };
    }
    return { success: true, data: { id: taskId } };
  } catch (err) {
    console.error("[task.deleteTask]", err);
    return { success: false, error: "Failed to delete task", status: 500 };
  }
}

// ─── getComments ──────────────────────────────────────────────────────────────

export async function getComments(
  workspaceId: string,
  taskId: string
): Promise<ServiceResult<TaskComment[]>> {
  try {
    const { rows } = await db.query<{
      id: string; task_id: string; author_id: string; name: string;
      body: string; created_at: string; updated_at: string;
    }>(
      `SELECT tc.id, tc.task_id, tc.author_id, u.name, tc.body, tc.created_at, tc.updated_at
       FROM task_comments tc
       JOIN users u ON u.id = tc.author_id
       WHERE tc.task_id = $1 AND tc.workspace_id = $2 AND tc.deleted_at IS NULL
       ORDER BY tc.created_at ASC`,
      [taskId, workspaceId]
    );

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id, taskId: r.task_id, authorId: r.author_id,
        authorName: r.name, authorInitials: getInitials(r.name),
        body: r.body, createdAt: r.created_at, updatedAt: r.updated_at,
      })),
    };
  } catch (err) {
    console.error("[task.getComments]", err);
    return { success: false, error: "Failed to fetch comments", status: 500 };
  }
}

// ─── addComment ───────────────────────────────────────────────────────────────

export async function addComment(
  workspaceId: string,
  taskId: string,
  userId: string,
  body: string
): Promise<ServiceResult<TaskComment>> {
  try {
    // Verify task belongs to workspace
    const { rows: taskRows } = await db.query(
      "SELECT id FROM tasks WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL",
      [taskId, workspaceId]
    );
    if (taskRows.length === 0) {
      return { success: false, error: "Task not found", status: 404 };
    }

    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO task_comments (task_id, workspace_id, author_id, body)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [taskId, workspaceId, userId, body.trim()]
    );

    await createNotification({
      workspaceId,
      userId,
      type: "task_comment_added",
      title: "New comment on task",
      description: "A new comment was added to the task",
      actorId: userId,
      entityType: "task",
      entityId: taskId,
      priority: "normal",
    });

    const commentId = rows[0].id;
    const { rows: full } = await db.query<{
      id: string; task_id: string; author_id: string; name: string;
      body: string; created_at: string; updated_at: string;
    }>(
      `SELECT tc.id, tc.task_id, tc.author_id, u.name, tc.body, tc.created_at, tc.updated_at
       FROM task_comments tc JOIN users u ON u.id = tc.author_id WHERE tc.id = $1`,
      [commentId]
    );

    const r = full[0];
    return {
      success: true,
      data: {
        id: r.id, taskId: r.task_id, authorId: r.author_id,
        authorName: r.name, authorInitials: getInitials(r.name),
        body: r.body, createdAt: r.created_at, updatedAt: r.updated_at,
      },
    };
  } catch (err) {
    console.error("[task.addComment]", err);
    return { success: false, error: "Failed to add comment", status: 500 };
  }
}

// ─── deleteComment ────────────────────────────────────────────────────────────

export async function deleteComment(
  workspaceId: string,
  commentId: string,
  userId: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    const { rowCount } = await db.query(
      `UPDATE task_comments SET deleted_at = NOW()
       WHERE id = $1 AND workspace_id = $2 AND author_id = $3 AND deleted_at IS NULL`,
      [commentId, workspaceId, userId]
    );
    if ((rowCount ?? 0) === 0) {
      return { success: false, error: "Comment not found or not yours", status: 404 };
    }
    return { success: true, data: { id: commentId } };
  } catch (err) {
    console.error("[task.deleteComment]", err);
    return { success: false, error: "Failed to delete comment", status: 500 };
  }
}
