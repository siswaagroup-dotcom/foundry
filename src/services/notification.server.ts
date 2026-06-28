// =============================================================================
// NOTIFICATION SERVICE — server-side only (API route handlers)
// =============================================================================
import { db } from "@/lib/db";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationType =
  | "member_invited"
  | "member_joined"
  | "role_changed"
  | "team_role_changed"
  | "team_member_removed"
  | "task_assigned"
  | "task_updated"
  | "task_due_today"
  | "task_due_tomorrow"
  | "task_overdue"
  | "task_comment_added"
  | "task_mentioned"
  | "project_created"
  | "project_status_changed"
  | "milestone_completed"
  | "expense_submitted"
  | "expense_approved"
  | "expense_rejected"
  | "expense_changes_requested"
  | "expense_reimbursement_completed"
  | "client_added"
  | "client_stage_changed"
  | "client_proposal_sent"
  | "client_advance_received"
  | "client_project_won"
  | "settings_workspace_updated"
  | "settings_integrations_connected"
  | "settings_api_key_changed"
  | "social_publish_success"
  | "social_publish_failed"
  | "social_token_expired"
  | "social_connection_lost"
  | "social_scheduled_published"
  | "social_approval_required";


export type NotificationEntityType =
  | "task"
  | "project"
  | "expense"
  | "client"
  | "social"
  | "social_post"
  | "social_account"
  | "social_integration"
  | "invitation"
  | "team"
  | "settings"
  | "workspace"
  | "invoice"
  | "billing"
  | "report";

export interface NotificationItem {
  id: string;
  workspaceId: string;
  userId: string;
  actorId: string | null;
  type: NotificationType;
  title: string;
  description: string | null;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
  };
}

export interface NotificationQueryOptions {
  page?: number;
  limit?: number;
  filter?: string;
  priority?: string;
  type?: string;
  dateRange?: string;
  memberId?: string;
  sort?: "asc" | "desc";
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const { rows } = await db.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1`,
    [tableName, columnName],
  );
  return rows.length > 0;
}

function toPriority(value: string | null | undefined): NotificationPriority {
  return (value === "low" || value === "high" || value === "urgent" ? value : "normal") as NotificationPriority;
}

function buildDateClause(dateRange: string | undefined): string | null {
  if (!dateRange) return null;
  switch (dateRange) {
    case "today":
      return "created_at >= NOW() - INTERVAL '24 hours'";
    case "yesterday":
      return "created_at >= NOW() - INTERVAL '48 hours' AND created_at < NOW() - INTERVAL '24 hours'";
    case "7d":
      return "created_at >= NOW() - INTERVAL '7 days'";
    case "30d":
      return "created_at >= NOW() - INTERVAL '30 days'";
    default:
      return null;
  }
}

function buildFilterClause(filter: string | undefined): string | null {
  switch (filter) {
    case "unread":
      return "is_read = FALSE";
    case "tasks":
      return "type LIKE 'task_%'";
    case "projects":
      return "type LIKE 'project_%'";
    case "expenses":
      return "type LIKE 'expense_%'";
    case "clients":
      return "type LIKE 'client_%'";
    case "team":
      return "type LIKE 'team_%'";
    case "settings":
      return "type LIKE 'settings_%'";
    default:
      return null;
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_ENTITY_TYPES = new Set([
  "task",
  "project",
  "client",
  "expense",
  "social",
  "social_post",
  "social_account",
  "social_integration",
  "invitation",
  "team",
  "settings",
  "workspace",
  "invoice",
  "billing",
  "report",
]);

function assertUuid(field: string, value: string): void {
  if (!UUID_RE.test(value)) {
    throw new Error(`Invalid notification ${field}: expected UUID`);
  }
}

function assertOptionalUuid(field: string, value: string | null | undefined): void {
  if (value != null) {
    assertUuid(field, value);
  }
}

function assertOptionalEntityType(value: NotificationEntityType | null | undefined): void {
  if (value != null && !VALID_ENTITY_TYPES.has(value)) {
    throw new Error(`Invalid notification entityType: ${value}`);
  }
}

export async function createNotification(input: {
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  description?: string | null;
  actorId?: string | null;
  entityType?: NotificationEntityType | null;
  entityId?: string | null;
  priority?: NotificationPriority;
  client?: { query: typeof db.query };
}): Promise<void> {
  assertUuid("workspaceId", input.workspaceId);
  assertUuid("userId", input.userId);
  assertOptionalUuid("actorId", input.actorId);
  assertOptionalUuid("entityId", input.entityId);
  assertOptionalEntityType(input.entityType);

  const executor = input.client ?? db;
  const priorityColumnExists = await columnExists("notifications", "priority");
  const cols: string[] = ["workspace_id", "user_id", "type", "title", "body", "is_read", "actor_id"];
  const params: unknown[] = [input.workspaceId, input.userId, input.type, input.title, input.description ?? null, false, input.actorId ?? null];
  const values: string[] = ["$1", "$2", "$3", "$4", "$5", "$6", "$7"];

  if (input.entityType) {
    cols.push("reference_type");
    values.push(`$${params.length + 1}`);
    params.push(input.entityType);
  }

  if (input.entityId) {
    cols.push("reference_id");
    values.push(`$${params.length + 1}`);
    params.push(input.entityId);
  }

  if (priorityColumnExists) {
    cols.push("priority");
    values.push(`$${params.length + 1}`);
    params.push(input.priority ?? "normal");
  }

  await executor.query(`INSERT INTO notifications (${cols.join(", ")}) VALUES (${values.join(", ")})`, params);
}

export async function markNotificationAsRead(workspaceId: string, userId: string, notificationId: string): Promise<void> {
  await db.query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND workspace_id = $2 AND user_id = $3 AND deleted_at IS NULL`,
    [notificationId, workspaceId, userId],
  );
}

export async function markAllNotificationsAsRead(workspaceId: string, userId: string): Promise<void> {
  await db.query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
     WHERE workspace_id = $1 AND user_id = $2 AND deleted_at IS NULL AND is_read = FALSE`,
    [workspaceId, userId],
  );
}

export async function deleteNotification(workspaceId: string, userId: string, notificationId: string): Promise<void> {
  await db.query(
    `UPDATE notifications
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND workspace_id = $2 AND user_id = $3 AND deleted_at IS NULL`,
    [notificationId, workspaceId, userId],
  );
}

export async function getNotifications(
  workspaceId: string,
  userId: string,
  options: NotificationQueryOptions = {},
): Promise<NotificationListResponse> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 15));
  const offset = (page - 1) * limit;
  const filterClause = buildFilterClause(options.filter);
  const dateClause = buildDateClause(options.dateRange);

  const conditions: string[] = ["workspace_id = $1", "user_id = $2", "deleted_at IS NULL"];
  const params: unknown[] = [workspaceId, userId];
  let idx = 3;

  if (filterClause) {
    conditions.push(filterClause.replace(/\$\d+/, ""));
  }

  if (options.priority) {
    conditions.push(`COALESCE(priority, 'normal') = $${idx++}`);
    params.push(options.priority);
  }

  if (options.type) {
    conditions.push(`type = $${idx++}`);
    params.push(options.type);
  }

  if (options.memberId) {
    conditions.push(`actor_id = $${idx++}`);
    params.push(options.memberId);
  }

  if (dateClause) {
    conditions.push(`(${dateClause})`);
  }

  const whereClause = conditions.join(" AND ");
  const { rows } = await db.query<{
    id: string;
    workspace_id: string;
    user_id: string;
    actor_id: string | null;
    type: NotificationType;
    title: string;
    body: string | null;
    reference_type: string | null;
    reference_id: string | null;
    priority: string | null;
    is_read: boolean;
    created_at: string;
    updated_at: string | null;
  }>(
    `SELECT
    id,
    workspace_id,
    user_id,
    type,
    title,
    body,
    is_read,
    read_at,
    reference_type,
    reference_id,
    actor_id,
    created_at,
    deleted_at,
    priority
     FROM notifications
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset],
  );

  const { rows: countRows } = await db.query<{ total: string }>(
    `SELECT COUNT(*)::int AS total
     FROM notifications
     WHERE ${whereClause}`,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);
  const items: NotificationItem[] = rows.map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    actorId: row.actor_id,
    type: row.type,
    title: row.title,
    description: row.body,
    entityType: row.reference_type as NotificationEntityType | null,
    entityId: row.reference_id,
    priority: toPriority(row.priority),
    isRead: row.is_read,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return {
    items,
    unreadCount: await getUnreadCount(workspaceId, userId),
    pagination: {
      page,
      limit,
      hasMore: offset + items.length < total,
      total,
    },
  };
}

export async function getUnreadCount(workspaceId: string, userId: string): Promise<number> {
  const { rows } = await db.query<{ count: string }>(
    `SELECT COUNT(*)::int AS count
     FROM notifications
     WHERE workspace_id = $1 AND user_id = $2 AND deleted_at IS NULL AND is_read = FALSE`,
    [workspaceId, userId],
  );
  return Number(rows[0]?.count ?? 0);
}

export async function createBulkNotifications(
  items: Array<{
    workspaceId: string;
    userId: string;
    type: NotificationType;
    title: string;
    description?: string | null;
    actorId?: string | null;
    entityType?: NotificationEntityType | null;
    entityId?: string | null;
    priority?: NotificationPriority;
  }>,
): Promise<void> {
  if (!items.length) return;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const priorityColumnExists = await columnExists("notifications", "priority");
    for (const item of items) {
      assertUuid("workspaceId", item.workspaceId);
      assertUuid("userId", item.userId);
      assertOptionalUuid("actorId", item.actorId);
      assertOptionalUuid("entityId", item.entityId);
      assertOptionalEntityType(item.entityType);

      const cols: string[] = ["workspace_id", "user_id", "type", "title", "body", "is_read", "actor_id"];
      const params: unknown[] = [item.workspaceId, item.userId, item.type, item.title, item.description ?? null, false, item.actorId ?? null];
      const values: string[] = ["$1", "$2", "$3", "$4", "$5", "$6", "$7"];
      if (item.entityType) {
        cols.push("reference_type");
        values.push(`$${params.length + 1}`);
        params.push(item.entityType);
      }
      if (item.entityId) {
        cols.push("reference_id");
        values.push(`$${params.length + 1}`);
        params.push(item.entityId);
      }
      if (priorityColumnExists) {
        cols.push("priority");
        values.push(`$${params.length + 1}`);
        params.push(item.priority ?? "normal");
      }
      await client.query(`INSERT INTO notifications (${cols.join(", ")}) VALUES (${values.join(", ")})`, params);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
