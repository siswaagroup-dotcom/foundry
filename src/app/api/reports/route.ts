// GET /api/reports?tab=overview|financial|crm|team|expenses
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

// ─── V017 runtime detection (cached) ─────────────────────────────────────────
// crm_status, quoted_amount, advance_received, paid_amount only exist after V017
let _hasCrm: boolean | null = null;

async function hasCrmColumns(): Promise<boolean> {
  if (_hasCrm !== null) return _hasCrm;
  const { rows } = await db.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='crm_status' LIMIT 1"
  );
  _hasCrm = rows.length > 0;
  return _hasCrm;
}

// ─── Overview ─────────────────────────────────────────────────────────────────

async function overviewData(wid: string) {
  const hasCrm = await hasCrmColumns();

  const clientSQL = hasCrm
    ? `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE crm_status IN ('lead','qualified')) AS leads,
              COUNT(*) FILTER (WHERE crm_status='active_client')         AS active
       FROM clients WHERE workspace_id=$1 AND deleted_at IS NULL`
    : `SELECT COUNT(*) AS total, 0::bigint AS leads, 0::bigint AS active
       FROM clients WHERE workspace_id=$1 AND deleted_at IS NULL`;

  const [expRow, clientRow, taskRow, memberRow] = await Promise.all([
    db.query<{ total_planned: string; total_incurred: string; approved: string; pending: string }>(
      `SELECT
         COALESCE(SUM(amount_planned),0)                                      AS total_planned,
         COALESCE(SUM(amount_incurred),0)                                     AS total_incurred,
         COALESCE(SUM(CASE WHEN status='approved' THEN amount_planned END),0) AS approved,
         COALESCE(SUM(CASE WHEN status='pending'  THEN amount_planned END),0) AS pending
       FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL`,
      [wid]
    ),
    db.query<{ total: string; leads: string; active: string }>(clientSQL, [wid]),
    db.query<{ total: string; done: string }>(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status='done') AS done
       FROM tasks WHERE workspace_id=$1 AND deleted_at IS NULL`,
      [wid]
    ),
    db.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM workspace_members wm
       JOIN workspaces w ON w.id=wm.workspace_id
       WHERE wm.workspace_id=$1 AND wm.status='active' AND w.deleted_at IS NULL`,
      [wid]
    ),
  ]);

  const e = expRow.rows[0];
  const c = clientRow.rows[0];
  const t = taskRow.rows[0];
  const m = memberRow.rows[0];
  const revenue  = parseFloat(e.approved);
  const expenses = parseFloat(e.total_incurred);
  const total    = parseInt(t.total);
  const done     = parseInt(t.done);

  return {
    revenue, expenses, profit: revenue - expenses,
    totalClients:  parseInt(c.total),
    activeClients: parseInt(c.active),
    leads:         parseInt(c.leads),
    teamMembers:   parseInt(m.total),
    totalTasks:    total,
    tasksDone:     done,
    tasksPending:  total - done,
    totalExpensesPlanned: parseFloat(e.total_planned),
    pendingExpenses:      parseFloat(e.pending),
  };
}

// ─── Financial ────────────────────────────────────────────────────────────────

async function financialData(wid: string) {
  const hasCrm = await hasCrmColumns();

  const [byCategoryRow, byClientRow, outstandingRow] = await Promise.all([
    db.query<{ category: string; total: string; count: string }>(
      `SELECT category,
              COALESCE(SUM(amount_planned),0) AS total,
              COUNT(*) AS count
       FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL
       GROUP BY category ORDER BY total DESC`,
      [wid]
    ),
    db.query<{ client_name: string; revenue: string; expenses: string }>(
      `SELECT COALESCE(c.name,'No Client') AS client_name,
              COALESCE(SUM(CASE WHEN e.status='approved' THEN e.amount_planned END),0) AS revenue,
              COALESCE(SUM(e.amount_planned),0) AS expenses
       FROM expenses e
       LEFT JOIN clients c ON c.id=e.client_id
       WHERE e.workspace_id=$1 AND e.deleted_at IS NULL
       GROUP BY c.name ORDER BY revenue DESC LIMIT 10`,
      [wid]
    ),
    hasCrm
      ? db.query<{ outstanding: string }>(
          `SELECT COALESCE(SUM(
                    CASE WHEN crm_status IN ('active_client','advance_received')
                         THEN COALESCE(quoted_amount,0) - COALESCE(paid_amount,0)
                    END
                  ),0) AS outstanding
           FROM clients WHERE workspace_id=$1 AND deleted_at IS NULL`,
          [wid]
        )
      : db.query<{ outstanding: string }>("SELECT '0'::text AS outstanding"),
  ]);

  return {
    byCategory: byCategoryRow.rows.map((r) => ({
      category: r.category, total: parseFloat(r.total), count: parseInt(r.count),
    })),
    byClient: byClientRow.rows.map((r) => ({
      clientName: r.client_name, revenue: parseFloat(r.revenue), expenses: parseFloat(r.expenses),
    })),
    outstandingAmount: parseFloat(outstandingRow.rows[0]?.outstanding ?? "0"),
  };
}

// ─── CRM ──────────────────────────────────────────────────────────────────────

async function crmData(wid: string) {
  const hasCrm = await hasCrmColumns();

  if (!hasCrm) {
    return { pipelineByStage: [], totalQuoted: 0, totalPaid: 0, totalAdvance: 0 };
  }

  const [stageRow, finRow] = await Promise.all([
    db.query<{ crm_status: string; count: string; total_quoted: string }>(
      `SELECT crm_status, COUNT(*) AS count,
              COALESCE(SUM(quoted_amount),0) AS total_quoted
       FROM clients WHERE workspace_id=$1 AND deleted_at IS NULL
       GROUP BY crm_status`,
      [wid]
    ),
    db.query<{ total_quoted: string; total_paid: string; total_advance: string }>(
      `SELECT COALESCE(SUM(quoted_amount),0)    AS total_quoted,
              COALESCE(SUM(paid_amount),0)      AS total_paid,
              COALESCE(SUM(advance_received),0) AS total_advance
       FROM clients WHERE workspace_id=$1 AND deleted_at IS NULL`,
      [wid]
    ),
  ]);

  const f = finRow.rows[0];
  return {
    pipelineByStage: stageRow.rows.map((r) => ({
      stage: r.crm_status, count: parseInt(r.count), totalQuoted: parseFloat(r.total_quoted),
    })),
    totalQuoted:  parseFloat(f?.total_quoted  ?? "0"),
    totalPaid:    parseFloat(f?.total_paid    ?? "0"),
    totalAdvance: parseFloat(f?.total_advance ?? "0"),
  };
}

// ─── Team ─────────────────────────────────────────────────────────────────────

async function teamData(wid: string) {
  const [memberRow, taskRow] = await Promise.all([
    db.query<{ user_id: string; member_name: string; role_name: string }>(
      `SELECT wm.user_id, u.name AS member_name, r.name AS role_name
       FROM workspace_members wm
       JOIN users u ON u.id=wm.user_id
       JOIN roles r ON r.id=wm.role_id
       WHERE wm.workspace_id=$1 AND wm.status='active' AND u.deleted_at IS NULL
       ORDER BY wm.joined_at ASC`,
      [wid]
    ),
    db.query<{ user_id: string; total: string; done: string }>(
      `SELECT ta.user_id,
              COUNT(DISTINCT t.id) AS total,
              COUNT(DISTINCT t.id) FILTER (WHERE t.status='done') AS done
       FROM task_assignees ta
       JOIN tasks t ON t.id=ta.task_id
       WHERE t.workspace_id=$1 AND t.deleted_at IS NULL
       GROUP BY ta.user_id`,
      [wid]
    ),
  ]);

  const taskMap = new Map(
    taskRow.rows.map((r) => [r.user_id, { total: parseInt(r.total), done: parseInt(r.done) }])
  );

  const members = memberRow.rows.map((r) => {
    const t    = taskMap.get(r.user_id) ?? { total: 0, done: 0 };
    const rate = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
    return {
      name: r.member_name, role: r.role_name,
      tasksTotal: t.total, tasksDone: t.done, tasksPending: t.total - t.done,
      completionRate: rate,
    };
  });

  return {
    members,
    totalTasks:     taskRow.rows.reduce((s, r) => s + parseInt(r.total), 0),
    totalCompleted: taskRow.rows.reduce((s, r) => s + parseInt(r.done), 0),
  };
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

async function expensesTabData(wid: string) {
  const [statusRow, categoryRow] = await Promise.all([
    db.query<{ status: string; count: string; total: string }>(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(amount_planned),0) AS total
       FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL
       GROUP BY status ORDER BY total DESC`,
      [wid]
    ),
    db.query<{ category: string; count: string; total: string; incurred: string }>(
      `SELECT category, COUNT(*) AS count,
              COALESCE(SUM(amount_planned),0)  AS total,
              COALESCE(SUM(amount_incurred),0) AS incurred
       FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL
       GROUP BY category ORDER BY total DESC`,
      [wid]
    ),
  ]);

  return {
    byStatus:   statusRow.rows.map((r) => ({ status: r.status, count: parseInt(r.count), total: parseFloat(r.total) })),
    byCategory: categoryRow.rows.map((r) => ({ category: r.category, count: parseInt(r.count), planned: parseFloat(r.total), incurred: parseFloat(r.incurred) })),
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const tab = req.nextUrl.searchParams.get("tab") ?? "overview";

  try {
    switch (tab) {
      case "overview":  return apiSuccess(await overviewData(auth.ctx.workspaceId));
      case "financial": return apiSuccess(await financialData(auth.ctx.workspaceId));
      case "crm":       return apiSuccess(await crmData(auth.ctx.workspaceId));
      case "team":      return apiSuccess(await teamData(auth.ctx.workspaceId));
      case "expenses":  return apiSuccess(await expensesTabData(auth.ctx.workspaceId));
      default:          return apiError(`Unknown tab: ${tab}`, 400, "INVALID_TAB");
    }
  } catch (err) {
    console.error("[reports]", err);
    return apiError("Failed to load report data", 500);
  }
}
