// =============================================================================
// EXPENSE SERVICE — server-side only (API route handlers)
// All queries are workspace-scoped for multi-tenant isolation.
// =============================================================================
import { db } from "@/lib/db";
import type {
  Expense, ExpenseApproval, ExpenseFilters,
  CreateExpenseInput, UpdateExpenseInput,
  ApproveExpenseInput, ExpenseStatus, ApprovalStage,
} from "@/types/expense";

export type { Expense, ExpenseApproval, ExpenseFilters, CreateExpenseInput, UpdateExpenseInput, ApproveExpenseInput };

export type ServiceResult<T> =
  | { success: true;  data: T }
  | { success: false; error: string; status: number; code?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

async function attachApprovals(expenseIds: string[]): Promise<Map<string, ExpenseApproval[]>> {
  if (expenseIds.length === 0) return new Map();
  const { rows } = await db.query<{
    id: string; expense_id: string; approver_id: string;
    approver_name: string; stage: string; comment: string | null; actioned_at: string;
  }>(
    `SELECT ea.id, ea.expense_id, ea.approver_id, u.name AS approver_name,
            ea.stage, ea.comment, ea.actioned_at
     FROM expense_approvals ea
     JOIN users u ON u.id = ea.approver_id
     WHERE ea.expense_id = ANY($1)
     ORDER BY ea.actioned_at ASC`,
    [expenseIds]
  );

  const map = new Map<string, ExpenseApproval[]>();
  rows.forEach((r) => {
    const list = map.get(r.expense_id) ?? [];
    list.push({
      id:               r.id,
      expenseId:        r.expense_id,
      approverId:       r.approver_id,
      approverName:     r.approver_name,
      approverInitials: initials(r.approver_name),
      stage:            r.stage as ApprovalStage,
      comment:          r.comment,
      actionedAt:       r.actioned_at,
    });
    map.set(r.expense_id, list);
  });
  return map;
}

type ExpenseRow = {
  id: string; workspace_id: string; name: string; detail: string | null;
  category: string; vendor: string | null; currency: string;
  amount_planned: string; amount_incurred: string | null;
  status: string; expense_date: string; owner_id: string; owner_name: string;
  client_id: string | null; created_by: string; created_at: string; updated_at: string;
};

async function rowsToExpenses(rows: ExpenseRow[]): Promise<Expense[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const approvalMap = await attachApprovals(ids);

  return rows.map((r) => ({
    id:             r.id,
    workspaceId:    r.workspace_id,
    name:           r.name,
    detail:         r.detail,
    category:       r.category,
    vendor:         r.vendor,
    currency:       r.currency,
    amountPlanned:  parseFloat(r.amount_planned),
    amountIncurred: r.amount_incurred !== null ? parseFloat(r.amount_incurred) : null,
    status:         r.status as ExpenseStatus,
    expenseDate:    r.expense_date,
    ownerId:        r.owner_id,
    ownerName:      r.owner_name,
    ownerInitials:  initials(r.owner_name),
    clientId:       r.client_id,
    approvals:      approvalMap.get(r.id) ?? [],
    createdBy:      r.created_by,
    createdAt:      r.created_at,
    updatedAt:      r.updated_at,
  }));
}

const SELECT_EXPENSE = `
  SELECT e.id, e.workspace_id, e.name, e.detail, e.category, e.vendor, e.currency,
         e.amount_planned, e.amount_incurred, e.status, e.expense_date,
         e.owner_id, u.name AS owner_name,
         e.client_id, e.created_by, e.created_at, e.updated_at
  FROM expenses e
  JOIN users u ON u.id = e.owner_id
`;

// ─── getExpenses ──────────────────────────────────────────────────────────────

export async function getExpenses(
  workspaceId: string,
  filters: ExpenseFilters = {}
): Promise<ServiceResult<Expense[]>> {
  try {
    const conds: string[] = ["e.workspace_id = $1", "e.deleted_at IS NULL"];
    const params: unknown[] = [workspaceId];
    let i = 2;

    if (filters.status && filters.status !== "all") {
      conds.push(`e.status = $${i++}`);
      params.push(filters.status);
    }
    if (filters.category) {
      conds.push(`e.category = $${i++}`);
      params.push(filters.category);
    }
    if (filters.ownerId) {
      conds.push(`e.owner_id = $${i++}`);
      params.push(filters.ownerId);
    }
    if (filters.search) {
      conds.push(`e.name ILIKE $${i++}`);
      params.push(`%${filters.search}%`);
    }
    if (filters.dateFrom) {
      conds.push(`e.expense_date >= $${i++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conds.push(`e.expense_date <= $${i++}`);
      params.push(filters.dateTo);
    }
    if (filters.amountMin !== undefined) {
      conds.push(`e.amount_planned >= $${i++}`);
      params.push(filters.amountMin);
    }
    if (filters.amountMax !== undefined) {
      conds.push(`e.amount_planned <= $${i++}`);
      params.push(filters.amountMax);
    }

    const { rows } = await db.query<ExpenseRow>(
      `${SELECT_EXPENSE} WHERE ${conds.join(" AND ")} ORDER BY e.created_at DESC`,
      params
    );
    return { success: true, data: await rowsToExpenses(rows) };
  } catch (err) {
    console.error("[expense.getExpenses]", err);
    return { success: false, error: "Failed to fetch expenses", status: 500 };
  }
}

// ─── getExpense ───────────────────────────────────────────────────────────────

export async function getExpense(
  workspaceId: string,
  expenseId: string
): Promise<ServiceResult<Expense>> {
  try {
    const { rows } = await db.query<ExpenseRow>(
      `${SELECT_EXPENSE} WHERE e.id = $1 AND e.workspace_id = $2 AND e.deleted_at IS NULL`,
      [expenseId, workspaceId]
    );
    if (rows.length === 0) return { success: false, error: "Expense not found", status: 404 };
    const [expense] = await rowsToExpenses(rows);
    return { success: true, data: expense };
  } catch (err) {
    console.error("[expense.getExpense]", err);
    return { success: false, error: "Failed to fetch expense", status: 500 };
  }
}

// ─── createExpense ────────────────────────────────────────────────────────────

export async function createExpense(
  workspaceId: string,
  userId: string,
  input: CreateExpenseInput
): Promise<ServiceResult<Expense>> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO expenses
         (workspace_id, name, detail, category, vendor, currency,
          amount_planned, amount_incurred, status, expense_date,
          owner_id, client_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        workspaceId,
        input.name.trim(),
        input.detail?.trim() || null,
        input.category,
        input.vendor?.trim() || null,
        input.currency ?? "USD",
        input.amountPlanned,
        input.amountIncurred ?? null,
        input.status ?? "planned",
        input.expenseDate,
        userId,
        input.clientId ?? null,
        userId,
      ]
    );

    const expenseId = rows[0].id;

    // Auto-insert "submitted" approval record
    await client.query(
      `INSERT INTO expense_approvals (expense_id, workspace_id, approver_id, stage)
       VALUES ($1, $2, $3, 'submitted')`,
      [expenseId, workspaceId, userId]
    );

    await client.query("COMMIT");
    return getExpense(workspaceId, expenseId);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[expense.createExpense]", err);
    return { success: false, error: "Failed to create expense", status: 500 };
  } finally {
    client.release();
  }
}

// ─── updateExpense ────────────────────────────────────────────────────────────

export async function updateExpense(
  workspaceId: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<ServiceResult<Expense>> {
  const pgClient = await db.connect();
  try {
    await pgClient.query("BEGIN");

    const { rows: existing } = await pgClient.query(
      "SELECT id FROM expenses WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL",
      [expenseId, workspaceId]
    );
    if (existing.length === 0) {
      await pgClient.query("ROLLBACK");
      return { success: false, error: "Expense not found", status: 404 };
    }

    const sets: string[] = ["updated_at = NOW()"];
    const params: unknown[] = [];
    let idx = 1;

    const fieldMap: [keyof UpdateExpenseInput, string][] = [
      ["name", "name"], ["detail", "detail"], ["category", "category"],
      ["vendor", "vendor"], ["currency", "currency"], ["amountPlanned", "amount_planned"],
      ["amountIncurred", "amount_incurred"], ["status", "status"],
      ["expenseDate", "expense_date"], ["clientId", "client_id"],
    ];

    for (const [key, col] of fieldMap) {
      if (key in input) {
        sets.push(`${col} = $${idx++}`);
        const v = input[key];
        params.push(v === undefined ? null : v);
      }
    }

    if (params.length > 0) {
      params.push(expenseId, workspaceId);
      await pgClient.query(
        `UPDATE expenses SET ${sets.join(", ")} WHERE id=$${idx} AND workspace_id=$${idx + 1}`,
        params
      );
    }

    await pgClient.query("COMMIT");
    return getExpense(workspaceId, expenseId);
  } catch (err) {
    await pgClient.query("ROLLBACK");
    console.error("[expense.updateExpense]", err);
    return { success: false, error: "Failed to update expense", status: 500 };
  } finally {
    pgClient.release();
  }
}

// ─── deleteExpense ────────────────────────────────────────────────────────────

export async function deleteExpense(
  workspaceId: string,
  expenseId: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    const { rowCount } = await db.query(
      "UPDATE expenses SET deleted_at=NOW() WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL",
      [expenseId, workspaceId]
    );
    if ((rowCount ?? 0) === 0) return { success: false, error: "Expense not found", status: 404 };
    return { success: true, data: { id: expenseId } };
  } catch (err) {
    console.error("[expense.deleteExpense]", err);
    return { success: false, error: "Failed to delete expense", status: 500 };
  }
}

// ─── approveExpense ───────────────────────────────────────────────────────────

export async function approveExpense(
  workspaceId: string,
  expenseId: string,
  approverId: string,
  input: ApproveExpenseInput
): Promise<ServiceResult<Expense>> {
  const pgClient = await db.connect();
  try {
    await pgClient.query("BEGIN");

    const { rows: expRows } = await pgClient.query<{ status: string }>(
      "SELECT status FROM expenses WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL",
      [expenseId, workspaceId]
    );
    if (expRows.length === 0) {
      await pgClient.query("ROLLBACK");
      return { success: false, error: "Expense not found", status: 404 };
    }

    const currentStatus = expRows[0].status;
    if (currentStatus === "approved" || currentStatus === "rejected") {
      await pgClient.query("ROLLBACK");
      return {
        success: false,
        error: `Expense is already ${currentStatus} and cannot be modified.`,
        status: 400,
      };
    }

    // Insert approval record
    await pgClient.query(
      `INSERT INTO expense_approvals (expense_id, workspace_id, approver_id, stage, comment)
       VALUES ($1,$2,$3,$4,$5)`,
      [expenseId, workspaceId, approverId, input.stage, input.comment ?? null]
    );

    // Map approval stage to expense status
    const newStatus: Record<ApprovalStage, ExpenseStatus> = {
      submitted:          "pending",
      under_review:       "pending",
      approved:           "approved",
      rejected:           "rejected",
      changes_requested:  "pending",
    };

    await pgClient.query(
      "UPDATE expenses SET status=$1, updated_at=NOW() WHERE id=$2 AND workspace_id=$3",
      [newStatus[input.stage], expenseId, workspaceId]
    );

    await pgClient.query("COMMIT");
    return getExpense(workspaceId, expenseId);
  } catch (err) {
    await pgClient.query("ROLLBACK");
    console.error("[expense.approveExpense]", err);
    return { success: false, error: "Failed to process approval", status: 500 };
  } finally {
    pgClient.release();
  }
}

// ─── getPendingApprovals ──────────────────────────────────────────────────────
// Returns all expenses in this workspace that are pending approval.
// Used for the "My Approvals" dashboard.

export async function getPendingApprovals(
  workspaceId: string
): Promise<ServiceResult<Expense[]>> {
  try {
    const { rows } = await db.query<ExpenseRow>(
      `${SELECT_EXPENSE}
       WHERE e.workspace_id = $1
         AND e.deleted_at IS NULL
         AND e.status = 'pending'
       ORDER BY e.created_at ASC`,
      [workspaceId]
    );
    return { success: true, data: await rowsToExpenses(rows) };
  } catch (err) {
    console.error("[expense.getPendingApprovals]", err);
    return { success: false, error: "Failed to fetch pending approvals", status: 500 };
  }
}

// ─── getExpenseAnalytics ──────────────────────────────────────────────────────

export async function getExpenseAnalytics(workspaceId: string): Promise<ServiceResult<{
  totalPlanned:   number;
  totalIncurred:  number;
  totalApproved:  number;
  totalRejected:  number;
  totalPending:   number;
  byCategory:     { category: string; total: number }[];
  byStatus:       { status: string; count: number; total: number }[];
  recentApprovals: { expenseName: string; approverName: string; stage: string; actionedAt: string }[];
}>> {
  try {
    const [summaryRes, categoryRes, statusRes, recentRes] = await Promise.all([
      db.query<{
        total_planned: string; total_incurred: string;
        total_approved: string; total_rejected: string; total_pending: string;
      }>(
        `SELECT
           COALESCE(SUM(amount_planned), 0)                                  AS total_planned,
           COALESCE(SUM(amount_incurred), 0)                                 AS total_incurred,
           COALESCE(SUM(CASE WHEN status='approved' THEN amount_planned END), 0) AS total_approved,
           COALESCE(SUM(CASE WHEN status='rejected' THEN amount_planned END), 0) AS total_rejected,
           COALESCE(SUM(CASE WHEN status='pending'  THEN amount_planned END), 0) AS total_pending
         FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL`,
        [workspaceId]
      ),
      db.query<{ category: string; total: string }>(
        `SELECT category, COALESCE(SUM(amount_planned), 0) AS total
         FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL
         GROUP BY category ORDER BY total DESC`,
        [workspaceId]
      ),
      db.query<{ status: string; count: string; total: string }>(
        `SELECT status, COUNT(*) AS count, COALESCE(SUM(amount_planned), 0) AS total
         FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL
         GROUP BY status`,
        [workspaceId]
      ),
      db.query<{ expense_name: string; approver_name: string; stage: string; actioned_at: string }>(
        `SELECT e.name AS expense_name, u.name AS approver_name, ea.stage, ea.actioned_at
         FROM expense_approvals ea
         JOIN expenses e ON e.id = ea.expense_id
         JOIN users u ON u.id = ea.approver_id
         WHERE ea.workspace_id = $1
           AND ea.stage IN ('approved','rejected')
         ORDER BY ea.actioned_at DESC
         LIMIT 10`,
        [workspaceId]
      ),
    ]);

    const s = summaryRes.rows[0];
    return {
      success: true,
      data: {
        totalPlanned:   parseFloat(s.total_planned),
        totalIncurred:  parseFloat(s.total_incurred),
        totalApproved:  parseFloat(s.total_approved),
        totalRejected:  parseFloat(s.total_rejected),
        totalPending:   parseFloat(s.total_pending),
        byCategory:     categoryRes.rows.map((r) => ({ category: r.category, total: parseFloat(r.total) })),
        byStatus:       statusRes.rows.map((r)  => ({ status: r.status,    count: parseInt(r.count), total: parseFloat(r.total) })),
        recentApprovals: recentRes.rows.map((r) => ({
          expenseName:  r.expense_name,
          approverName: r.approver_name,
          stage:        r.stage,
          actionedAt:   r.actioned_at,
        })),
      },
    };
  } catch (err) {
    console.error("[expense.getExpenseAnalytics]", err);
    return { success: false, error: "Failed to fetch analytics", status: 500 };
  }
}
