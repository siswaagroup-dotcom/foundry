import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requireAuth } from "@/lib/require-auth";
import { getCrmPipeline } from "@/services/client.server";
import {
  getNotifications,
  getUnreadCount,
} from "@/services/notification.server";
import type {
  DashboardResponse,
  ExpenseStatus,
  Priority,
  TaskStatus,
} from "@/types/dashboard";

function sqlMonthLabel(column: string): string {
  return `TO_CHAR(${column}, 'Mon')`;
}

async function hasCrmColumns(): Promise<boolean> {
  const { rows } = await db.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='crm_status' LIMIT 1",
  );
  return rows.length > 0;
}

function formatActivityAction(entityType: string, action: string): string {
  if (!action) return entityType;
  return `${action.replace(/_/g, " ")} ${entityType.replace(/_/g, " ")}`;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const workspaceId = auth.ctx.workspaceId;
    const userId = auth.ctx.userId;
    const now = new Date();

    const [
      clientSummary,
      taskSummary,
      expenseSummary,
      invoiceSummary,
      memberSummary,
      recentClients,
      tasksToday,
      upcomingDeadlines,
      recentExpenses,
      overdueItems,
      activityRows,
      notificationsResult,
      unreadCount,
      pipelineResult,
    ] = await Promise.all([
      db.query<{ total_clients: string; active_projects: string }>(
        `SELECT COUNT(*) AS total_clients,
                  COUNT(*) FILTER (WHERE active_project) AS active_projects
           FROM (
             SELECT c.id,
                    (COUNT(DISTINCT t.id) > 0) AS active_project
             FROM clients c
             LEFT JOIN tasks t ON t.client_id = c.id AND t.deleted_at IS NULL
             WHERE c.workspace_id = $1
               AND c.deleted_at IS NULL
             GROUP BY c.id
           ) client_status`,
        [workspaceId],
      ),
      db.query<{
        total_tasks: string;
        completed_tasks: string;
        overdue_tasks: string;
      }>(
        `SELECT COUNT(*) AS total_tasks,
                  COUNT(*) FILTER (WHERE status = 'done') AS completed_tasks,
                  COUNT(*) FILTER (WHERE status != 'done' AND due_date < NOW()) AS overdue_tasks
           FROM tasks
           WHERE workspace_id = $1
             AND deleted_at IS NULL`,
        [workspaceId],
      ),
      db.query<{ total_expenses: string; month_expenses: string }>(
        `SELECT COALESCE(SUM(amount_planned), 0) AS total_expenses,
                  COALESCE(SUM(CASE WHEN date_trunc('month', expense_date) = date_trunc('month', NOW()) THEN amount_planned END), 0) AS month_expenses
           FROM expenses
           WHERE workspace_id = $1
             AND deleted_at IS NULL`,
        [workspaceId],
      ),
      db.query<{
        total_revenue: string;
        month_revenue: string;
        unpaid_invoices: string;
      }>(
        `SELECT COALESCE(SUM(amount), 0) AS total_revenue,
                  COALESCE(SUM(CASE WHEN date_trunc('month', invoice_date) = date_trunc('month', NOW()) THEN amount END), 0) AS month_revenue,
                  COUNT(*) FILTER (WHERE status IN ('open', 'draft', 'uncollectible')) AS unpaid_invoices
           FROM invoices
           WHERE workspace_id = $1`,
        [workspaceId],
      ),
      db.query<{ total_members: string }>(
        `SELECT COUNT(*) AS total_members
           FROM workspace_members
           WHERE workspace_id = $1
             AND status = 'active'`,
        [workspaceId],
      ),
      db.query<{
        id: string;
        name: string;
        industry: string | null;
        active_project: boolean;
        created_at: string;
      }>(
        `SELECT c.id, c.name, c.industry,
                  (COUNT(DISTINCT t.id) > 0) AS active_project,
                  c.created_at
           FROM clients c
           LEFT JOIN tasks t ON t.client_id = c.id AND t.deleted_at IS NULL
           WHERE c.workspace_id = $1
             AND c.deleted_at IS NULL
           GROUP BY c.id
           ORDER BY c.created_at DESC
           LIMIT 4`,
        [workspaceId],
      ),
      db.query<{
        id: string;
        title: string;
        status: string;
        priority: string;
        due_date: string | null;
        client_name: string | null;
      }>(
        `SELECT t.id, t.title, t.status, t.priority, t.due_date,
                  c.name AS client_name
           FROM tasks t
           LEFT JOIN clients c ON c.id = t.client_id
           WHERE t.workspace_id = $1
             AND t.deleted_at IS NULL
             AND DATE(t.due_date) = CURRENT_DATE
           ORDER BY t.due_date ASC NULLS LAST
           LIMIT 10`,
        [workspaceId],
      ),
      db.query<{
        id: string;
        title: string;
        status: string;
        due_date: string;
      }>(
        `SELECT id, title, status, due_date
           FROM tasks
           WHERE workspace_id = $1
             AND deleted_at IS NULL
             AND due_date IS NOT NULL
             AND status != 'done'
             AND due_date >= NOW()
           ORDER BY due_date ASC
           LIMIT 4`,
        [workspaceId],
      ),
      db.query<{
        id: string;
        name: string;
        category: string;
        amount_planned: string;
        status: string;
        expense_date: string;
      }>(
        `SELECT id, name, category, amount_planned, status, expense_date
           FROM expenses
           WHERE workspace_id = $1
             AND deleted_at IS NULL
           ORDER BY created_at DESC
           LIMIT 4`,
        [workspaceId],
      ),
      db.query<{
        id: string;
        title: string;
        type: string;
        due_date: string;
        amount_planned: string | null;
      }>(
        `
  SELECT
      id,
      title,
      'Task'::text AS type,
      due_date,
      NULL::numeric::text AS amount_planned
  FROM tasks
  WHERE workspace_id = $1
    AND deleted_at IS NULL
    AND due_date < NOW()
    AND status <> 'done'

  UNION ALL

  SELECT
      id,
      name AS title,
      'Expense'::text AS type,
      expense_date AS due_date,
      amount_planned::text AS amount_planned
  FROM expenses
  WHERE workspace_id = $1
    AND deleted_at IS NULL
    AND expense_date < NOW()
    AND status <> 'paid'

  ORDER BY due_date DESC
  LIMIT 5
  `,
        [workspaceId],
      ),
      db.query<{
        id: string;
        actor_name: string | null;
        entity_type: string;
        action: string;
        created_at: string;
      }>(
        `SELECT al.id, u.name AS actor_name, al.entity_type, al.action, al.created_at
           FROM activity_logs al
           LEFT JOIN users u ON u.id = al.actor_id
           WHERE al.workspace_id = $1
           ORDER BY al.created_at DESC
           LIMIT 10`,
        [workspaceId],
      ),
      getNotifications(workspaceId, userId, {
        page: 1,
        limit: 5,
        sort: "desc",
      }),
      getUnreadCount(workspaceId, userId),
      getCrmPipeline(workspaceId),
    ]);

    const statsRow = clientSummary.rows[0];
    const taskRow = taskSummary.rows[0];
    const expenseRow = expenseSummary.rows[0];
    const invoiceRow = invoiceSummary.rows[0];
    const memberRow = memberSummary.rows[0];

    const stats = {
      activeProjects: Number(statsRow.active_projects ?? 0),
      onlineMembers: Number(memberRow.total_members ?? 0),
      revenue: Number(invoiceRow.month_revenue ?? 0),
      expenses: Number(expenseRow.month_expenses ?? 0),
      clients: Number(statsRow.total_clients ?? 0),
      totalTasks: Number(taskRow.total_tasks ?? 0),
      completedTasks: Number(taskRow.completed_tasks ?? 0),
      pendingTasks: Number(
        (taskRow.total_tasks ? Number(taskRow.total_tasks) : 0) -
          (taskRow.completed_tasks ? Number(taskRow.completed_tasks) : 0),
      ),
      overdueTasks: Number(taskRow.overdue_tasks ?? 0),
      totalRevenue: Number(invoiceRow.total_revenue ?? 0),
      unpaidInvoices: Number(invoiceRow.unpaid_invoices ?? 0),
      totalExpenses: Number(expenseRow.total_expenses ?? 0),
      unreadNotifications: Number(unreadCount ?? 0),
      teamMembers: Number(memberRow.total_members ?? 0),
    };

    const months = await db.query<{
      month: string;
      month_date: string;
      revenue: string;
      expense: string;
      tasks: string;
    }>(
      `
WITH monthly_data AS (

    SELECT
        date_trunc('month', invoice_date) AS month_date,
        SUM(amount)::numeric AS revenue,
        0::numeric AS expense,
        0::numeric AS tasks
    FROM invoices
    WHERE workspace_id = $1
      AND invoice_date >= date_trunc('month', NOW()) - INTERVAL '5 months'
    GROUP BY date_trunc('month', invoice_date)

    UNION ALL

    SELECT
        date_trunc('month', expense_date) AS month_date,
        0::numeric,
        SUM(amount_planned)::numeric,
        0::numeric
    FROM expenses
    WHERE workspace_id = $1
      AND deleted_at IS NULL
      AND expense_date >= date_trunc('month', NOW()) - INTERVAL '5 months'
    GROUP BY date_trunc('month', expense_date)

    UNION ALL

    SELECT
        date_trunc('month', due_date) AS month_date,
        0::numeric,
        0::numeric,
        COUNT(*)::numeric
    FROM tasks
    WHERE workspace_id = $1
      AND deleted_at IS NULL
      AND due_date >= date_trunc('month', NOW()) - INTERVAL '5 months'
    GROUP BY date_trunc('month', due_date)

)

SELECT
    TO_CHAR(month_date, 'Mon') AS month,
    month_date,
    SUM(revenue)::text AS revenue,
    SUM(expense)::text AS expense,
    SUM(tasks)::text AS tasks
FROM monthly_data
GROUP BY month_date
ORDER BY month_date;
`,
      [workspaceId],
    );

    const chartMap = new Map<
      string,
      { month: string; revenue: number; expenses: number; tasks: number }
    >();
    months.rows.forEach((row) => {
      const month = row.month;
      const existing = chartMap.get(month) ?? {
        month,
        revenue: 0,
        expenses: 0,
        tasks: 0,
      };
      chartMap.set(month, {
        month,
        revenue: existing.revenue + Number(row.revenue),
        expenses: existing.expenses + Number(row.expense),
        tasks: existing.tasks + Number(row.tasks),
      });
    });

    const chartData = Array.from(chartMap.values()).slice(-6);

    const taskProductivityRows = await db.query<{
      team: string;
      value: string;
    }>(
      `SELECT COALESCE(u.name, 'Unassigned') AS team,
              COUNT(*)::text AS value
       FROM task_assignees ta
       JOIN tasks t ON t.id = ta.task_id
       LEFT JOIN users u ON u.id = ta.user_id
       WHERE t.workspace_id = $1
         AND t.deleted_at IS NULL
       GROUP BY u.name
       ORDER BY COUNT(*) DESC
       LIMIT 6`,
      [workspaceId],
    );

    const expenseStatusRows = await db.query<{ status: string; total: string }>(
      `SELECT status, COALESCE(SUM(amount_planned), 0) AS total
       FROM expenses
       WHERE workspace_id = $1
         AND deleted_at IS NULL
       GROUP BY status`,
      [workspaceId],
    );

    const productivity = taskProductivityRows.rows.map((row) => ({
      team: row.team,
      value: Number(row.value),
    }));

    const expenseStatusTotals = expenseStatusRows.rows.map((row) => ({
      status: row.status,
      total: Number(row.total),
    }));

    const pipeline = pipelineResult.success ? pipelineResult.data : {};

    const normalizeExpenseStatus = (status: string): ExpenseStatus =>
      status === "planned"
        ? "Planned"
        : status === "submitted"
          ? "Submitted"
          : status === "approved"
            ? "Approved"
            : status === "pending"
              ? "Pending"
              : ((status.charAt(0).toUpperCase() +
                  status.slice(1)) as ExpenseStatus);

    const response: DashboardResponse = {
      stats,
      charts: {
        revenue: chartData,
        productivity,
      },
      recentClients: recentClients.rows.map((row) => ({
        id: row.id,
        name: row.name,
        industry: row.industry ?? "Unknown",
        status: row.active_project ? "Active" : "At Risk",
        revenue: 0,
        contact: "",
        email: "",
      })),
      recentTasks: tasksToday.rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.client_name ?? "General",
        priority: (row.priority === "urgent"
          ? "Urgent"
          : row.priority === "high"
            ? "High"
            : row.priority === "low"
              ? "Low"
              : "Medium") as any,
        dueTime: row.due_date
          ? new Date(row.due_date).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "",
        status:
          row.status === "done"
            ? "Done"
            : row.status === "planning"
              ? "In Progress"
              : row.status === "doing"
                ? "In Progress"
                : row.status === "review"
                  ? "In Progress"
                  : row.status === "blocked"
                    ? "Blocked"
                    : "Todo",
        completed: row.status === "done",
      })),
      recentExpenses: recentExpenses.rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        amount: Number(row.amount_planned),
        status: normalizeExpenseStatus(row.status),
        owner: "",
      })),
      upcomingDeadlines: upcomingDeadlines.rows.map((row) => ({
        id: row.id,
        project: row.title,
        dueDate: new Date(row.due_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        status: row.status === "blocked" ? "Blocked" : "On Track",
      })),
      overdueItems: overdueItems.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: row.type,
        daysOverdue: Math.max(
          1,
          Math.floor(
            (now.getTime() - new Date(row.due_date).getTime()) / 86_400_000,
          ),
        ),
        amount: row.amount_planned ? Number(row.amount_planned) : undefined,
      })),
      teamActivity: activityRows.rows.map((row) => ({
        id: row.id,
        user: row.actor_name ?? "System",
        initials: (row.actor_name ?? "System")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        action: formatActivityAction(row.entity_type, row.action),
        timestamp: new Date(row.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      })),
      pipeline,
      notifications: notificationsResult.items.map((notification) => ({
        id: notification.id,
        title: notification.title,
        body: notification.description ?? "",
        createdAt: notification.createdAt,
      })),
      unreadNotifications: Number(unreadCount ?? 0),
      expenseStatusTotals,
    };

    return apiSuccess(response);
  } catch (err) {
    console.error("[dashboard]", err);
    return apiError("Failed to load dashboard data", 500);
  }
}
