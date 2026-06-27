// =============================================================================
// EXPENSE SERVICE — server-side only (API route handlers)
// All queries are workspace-scoped for multi-tenant isolation.
// =============================================================================
import { db } from "@/lib/db";
import { createNotification } from "@/services/notification.server";
import type {
  Expense, ExpenseApproval, ExpenseAttachment, ExpenseFilters,
  CreateExpenseInput, UpdateExpenseInput,
  ApproveExpenseInput, CreateExpenseAttachmentInput,
  ExpenseStatus, ApprovalStage,
} from "@/types/expense";

export type {
  Expense, ExpenseApproval, ExpenseAttachment, ExpenseFilters,
  CreateExpenseInput, UpdateExpenseInput,
  ApproveExpenseInput, CreateExpenseAttachmentInput,
};

export type ServiceResult<T> =
  | { success: true;  data: T }
  | { success: false; error: string; status: number; code?: string };

// ─── Internal helpers ─────────────────────────────────────────────────────────

function inits(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

type ExpenseRow = {
  id: string; workspace_id: string; name: string; detail: string | null;
  notes?: string | null; // only present after V016 migration — optional in row shape
  category: string; vendor: string | null; currency: string;
  amount_planned: string; amount_incurred: string | null;
  status: string; expense_date: string; owner_id: string; owner_name: string;
  client_id: string | null; created_by: string; created_at: string; updated_at: string;
};

async function fetchApprovals(ids: string[]): Promise<Map<string, ExpenseApproval[]>> {
  if (!ids.length) return new Map();
  const { rows } = await db.query<{
    id: string; expense_id: string; approver_id: string; approver_name: string;
    stage: string; comment: string | null; actioned_at: string;
  }>(
    `SELECT ea.id, ea.expense_id, ea.approver_id, u.name AS approver_name,
            ea.stage, ea.comment, ea.actioned_at
     FROM expense_approvals ea
     JOIN users u ON u.id = ea.approver_id
     WHERE ea.expense_id = ANY($1) ORDER BY ea.actioned_at ASC`,
    [ids]
  );
  const m = new Map<string, ExpenseApproval[]>();
  rows.forEach((r) => {
    const list = m.get(r.expense_id) ?? [];
    list.push({
      id: r.id, expenseId: r.expense_id, approverId: r.approver_id,
      approverName: r.approver_name, approverInitials: inits(r.approver_name),
      stage: r.stage as ApprovalStage, comment: r.comment, actionedAt: r.actioned_at,
    });
    m.set(r.expense_id, list);
  });
  return m;
}

async function fetchAttachments(ids: string[]): Promise<Map<string, ExpenseAttachment[]>> {
  if (!ids.length) return new Map();
  const { rows } = await db.query<{
    id: string; expense_id: string; uploader_id: string; uploader_name: string;
    file_name: string; file_url: string; file_size_bytes: string | null;
    mime_type: string | null; uploaded_at: string;
  }>(
    `SELECT ea.id, ea.expense_id, ea.uploader_id, u.name AS uploader_name,
            ea.file_name, ea.file_url, ea.file_size_bytes, ea.mime_type, ea.uploaded_at
     FROM expense_attachments ea
     JOIN users u ON u.id = ea.uploader_id
     WHERE ea.expense_id = ANY($1) ORDER BY ea.uploaded_at DESC`,
    [ids]
  );
  const m = new Map<string, ExpenseAttachment[]>();
  rows.forEach((r) => {
    const list = m.get(r.expense_id) ?? [];
    list.push({
      id: r.id, expenseId: r.expense_id, uploaderId: r.uploader_id,
      uploaderName: r.uploader_name, fileName: r.file_name, fileUrl: r.file_url,
      fileSizeBytes: r.file_size_bytes === null ? null : Number(r.file_size_bytes),
      mimeType: r.mime_type, uploadedAt: r.uploaded_at,
    });
    m.set(r.expense_id, list);
  });
  return m;
}

async function rowsToExpenses(rows: ExpenseRow[]): Promise<Expense[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [approvalMap, attachmentMap] = await Promise.all([fetchApprovals(ids), fetchAttachments(ids)]);
  return rows.map((r) => ({
    id: r.id, workspaceId: r.workspace_id, name: r.name, detail: r.detail,
    notes: r.notes ?? null,  // null until V016 migration adds the column
    category: r.category, vendor: r.vendor, currency: r.currency,
    amountPlanned: parseFloat(r.amount_planned),
    amountIncurred: r.amount_incurred !== null ? parseFloat(r.amount_incurred) : null,
    status: r.status as ExpenseStatus, expenseDate: r.expense_date,
    ownerId: r.owner_id, ownerName: r.owner_name, ownerInitials: inits(r.owner_name),
    clientId: r.client_id, approvals: approvalMap.get(r.id) ?? [],
    attachments: attachmentMap.get(r.id) ?? [],
    createdBy: r.created_by, createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}

async function notify(
  client: { query: typeof db.query },
  workspaceId: string, expenseId: string, actorId: string,
  type: "expense_submitted" | "expense_approved" | "expense_rejected" | "expense_paid",
  title: string, body: string | null
) {
  await client.query(
    `INSERT INTO notifications
       (workspace_id, user_id, type, title, body, reference_type, reference_id, actor_id)
     SELECT workspace_id, owner_id, $4, $5, $6, 'expense', id, $3
     FROM expenses WHERE id=$1 AND workspace_id=$2 AND owner_id <> $3`,
    [expenseId, workspaceId, actorId, type, title, body]
  );
}

// ─── Runtime schema detection ─────────────────────────────────────────────────
// Detects whether V016 (notes column) has been applied. Cached after first check.
let _notesColumnExists: boolean | null = null;

async function notesColumnExists(): Promise<boolean> {
  if (_notesColumnExists !== null) return _notesColumnExists;
  const { rows } = await db.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name='expenses' AND column_name='notes' LIMIT 1`
  );
  _notesColumnExists = rows.length > 0;
  return _notesColumnExists;
}

async function buildSEL(): Promise<string> {
  const hasNotes = await notesColumnExists();
  return `
    SELECT e.id, e.workspace_id, e.name, e.detail,${hasNotes ? " e.notes," : ""}
           e.category, e.vendor, e.currency,
           e.amount_planned, e.amount_incurred, e.status, e.expense_date,
           e.owner_id, u.name AS owner_name,
           e.client_id, e.created_by, e.created_at, e.updated_at
    FROM expenses e JOIN users u ON u.id = e.owner_id
  `;
}

// ─── getExpenses ──────────────────────────────────────────────────────────────

export async function getExpenses(workspaceId: string, filters: ExpenseFilters = {}): Promise<ServiceResult<Expense[]>> {
  try {
    const SEL = await buildSEL();
    const conds = ["e.workspace_id = $1", "e.deleted_at IS NULL"];
    const params: unknown[] = [workspaceId];
    let i = 2;
    if (filters.status && filters.status !== "all") { conds.push(`e.status = $${i++}`);         params.push(filters.status); }
    if (filters.category)                           { conds.push(`e.category = $${i++}`);       params.push(filters.category); }
    if (filters.ownerId)                            { conds.push(`e.owner_id = $${i++}`);       params.push(filters.ownerId); }
    if (filters.search)                             { conds.push(`e.name ILIKE $${i++}`);       params.push(`%${filters.search}%`); }
    if (filters.dateFrom)                           { conds.push(`e.expense_date >= $${i++}`);  params.push(filters.dateFrom); }
    if (filters.dateTo)                             { conds.push(`e.expense_date <= $${i++}`);  params.push(filters.dateTo); }
    if (filters.amountMin !== undefined)            { conds.push(`e.amount_planned >= $${i++}`); params.push(filters.amountMin); }
    if (filters.amountMax !== undefined)            { conds.push(`e.amount_planned <= $${i++}`); params.push(filters.amountMax); }
    const { rows } = await db.query<ExpenseRow>(`${SEL} WHERE ${conds.join(" AND ")} ORDER BY e.created_at DESC`, params);
    return { success: true, data: await rowsToExpenses(rows) };
  } catch (err) {
    console.error("[expense.getExpenses]", err);
    return { success: false, error: "Failed to fetch expenses", status: 500 };
  }
}

// ─── getExpense ───────────────────────────────────────────────────────────────

export async function getExpense(workspaceId: string, expenseId: string): Promise<ServiceResult<Expense>> {
  try {
    const SEL = await buildSEL();
    const { rows } = await db.query<ExpenseRow>(`${SEL} WHERE e.id=$1 AND e.workspace_id=$2 AND e.deleted_at IS NULL`, [expenseId, workspaceId]);
    if (!rows.length) return { success: false, error: "Expense not found", status: 404 };
    const [e] = await rowsToExpenses(rows);
    return { success: true, data: e };
  } catch (err) {
    console.error("[expense.getExpense]", err);
    return { success: false, error: "Failed to fetch expense", status: 500 };
  }
}

// ─── createExpense ────────────────────────────────────────────────────────────

export async function createExpense(workspaceId: string, userId: string, input: CreateExpenseInput): Promise<ServiceResult<Expense>> {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const { rows } = await c.query<{ id: string }>(
      `INSERT INTO expenses (workspace_id,name,detail,category,vendor,currency,amount_planned,amount_incurred,status,expense_date,owner_id,client_id,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [workspaceId, input.name.trim(), input.detail?.trim()||null, input.category,
       input.vendor?.trim()||null, input.currency??"USD", input.amountPlanned,
       input.amountIncurred??null, input.status??"planned", input.expenseDate,
       userId, input.clientId??null, userId]
      // notes column added after V016 migration
    );
    const expenseId = rows[0].id;
    await c.query(`INSERT INTO expense_approvals (expense_id,workspace_id,approver_id,stage) VALUES ($1,$2,$3,'submitted')`, [expenseId, workspaceId, userId]);
    if ((input.status ?? "planned") === "pending") {
      await notify(c, workspaceId, expenseId, userId, "expense_submitted", "Expense submitted for approval", input.name.trim());
      await createNotification({
        workspaceId,
        userId,
        type: "expense_submitted",
        title: "Expense submitted",
        description: input.name.trim(),
        actorId: userId,
        entityType: "expense",
        entityId: expenseId,
        priority: "normal",
        client: c,
      });
    }
    await c.query("COMMIT");
    return getExpense(workspaceId, expenseId);
  } catch (err) {
    await c.query("ROLLBACK");
    console.error("[expense.createExpense]", err);
    return { success: false, error: "Failed to create expense", status: 500 };
  } finally { c.release(); }
}

// ─── updateExpense ────────────────────────────────────────────────────────────

export async function updateExpense(workspaceId: string, expenseId: string, input: UpdateExpenseInput): Promise<ServiceResult<Expense>> {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const { rows: ex } = await c.query("SELECT id FROM expenses WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL", [expenseId, workspaceId]);
    if (!ex.length) { await c.query("ROLLBACK"); return { success: false, error: "Expense not found", status: 404 }; }
    const sets = ["updated_at = NOW()"];
    const params: unknown[] = [];
    let idx = 1;
    const fieldMap: [keyof UpdateExpenseInput, string][] = [
      ["name","name"],["detail","detail"],["category","category"],["vendor","vendor"],
      ["currency","currency"],["amountPlanned","amount_planned"],["amountIncurred","amount_incurred"],
      ["status","status"],["expenseDate","expense_date"],["clientId","client_id"],
      // ["notes","notes"],  -- enabled after V016 migration is applied
    ];
    for (const [key, col] of fieldMap) {
      if (key in input) { sets.push(`${col} = $${idx++}`); params.push((input[key] ?? null)); }
    }
    if (params.length > 0) {
      params.push(expenseId, workspaceId);
      await c.query(`UPDATE expenses SET ${sets.join(", ")} WHERE id=$${idx} AND workspace_id=$${idx+1}`, params);
    }
    await c.query("COMMIT");
    return getExpense(workspaceId, expenseId);
  } catch (err) {
    await c.query("ROLLBACK");
    console.error("[expense.updateExpense]", err);
    return { success: false, error: "Failed to update expense", status: 500 };
  } finally { c.release(); }
}

// ─── deleteExpense ────────────────────────────────────────────────────────────

export async function deleteExpense(workspaceId: string, expenseId: string): Promise<ServiceResult<{ id: string }>> {
  try {
    const { rowCount } = await db.query("UPDATE expenses SET deleted_at=NOW() WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL", [expenseId, workspaceId]);
    if ((rowCount??0) === 0) return { success: false, error: "Expense not found", status: 404 };
    return { success: true, data: { id: expenseId } };
  } catch (err) {
    console.error("[expense.deleteExpense]", err);
    return { success: false, error: "Failed to delete expense", status: 500 };
  }
}

// ─── approveExpense ───────────────────────────────────────────────────────────

export async function approveExpense(workspaceId: string, expenseId: string, approverId: string, input: ApproveExpenseInput): Promise<ServiceResult<Expense>> {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const { rows: ex } = await c.query<{ status: string }>("SELECT status FROM expenses WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL", [expenseId, workspaceId]);
    if (!ex.length) { await c.query("ROLLBACK"); return { success: false, error: "Expense not found", status: 404 }; }

    const cur = ex[0].status;
    if (cur === "paid") { await c.query("ROLLBACK"); return { success: false, error: "Expense is already paid.", status: 400 }; }
    if (cur === "rejected") { await c.query("ROLLBACK"); return { success: false, error: "Expense is already rejected.", status: 400 }; }
    if (input.stage === "paid" && cur !== "approved") { await c.query("ROLLBACK"); return { success: false, error: "Only approved expenses can be marked as paid.", status: 400 }; }

    await c.query(`INSERT INTO expense_approvals (expense_id,workspace_id,approver_id,stage,comment) VALUES ($1,$2,$3,$4,$5)`, [expenseId, workspaceId, approverId, input.stage, input.comment??null]);

    const statusMap: Record<ApprovalStage, ExpenseStatus> = {
      submitted: "pending", under_review: "pending", approved: "approved",
      rejected: "rejected", changes_requested: "pending", paid: "paid",
    };

    // notes column available after V016 — disabled until migration runs
    const extraSet = ""; // was: input.stage === "rejected" && input.comment?.trim() ? ", notes=$4" : ""
    const updateP: unknown[] = [statusMap[input.stage], expenseId, workspaceId];
    await c.query(`UPDATE expenses SET status=$1,updated_at=NOW()${extraSet} WHERE id=$2 AND workspace_id=$3`, updateP);

    const notifMap: Partial<Record<ApprovalStage, { type: "expense_approved"|"expense_rejected"|"expense_paid"; title: string }>> = {
      approved: { type: "expense_approved", title: "Expense approved" },
      rejected: { type: "expense_rejected", title: "Expense rejected" },
      paid:     { type: "expense_paid",     title: "Expense marked as paid" },
    };
    const n = notifMap[input.stage];
    if (n) {
      await notify(c, workspaceId, expenseId, approverId, n.type, n.title, input.comment?.trim()||null);
      await createNotification({
        workspaceId,
        userId: approverId,
        type: input.stage === "approved" ? "expense_approved" : input.stage === "rejected" ? "expense_rejected" : "expense_reimbursement_completed",
        title: n.title,
        description: input.comment?.trim() || null,
        actorId: approverId,
        entityType: "expense",
        entityId: expenseId,
        priority: input.stage === "rejected" ? "high" : "normal",
        client: c,
      });
    }

    await c.query("COMMIT");
    return getExpense(workspaceId, expenseId);
  } catch (err) {
    await c.query("ROLLBACK");
    console.error("[expense.approveExpense]", err);
    return { success: false, error: "Failed to process approval", status: 500 };
  } finally { c.release(); }
}

// ─── addExpenseAttachment ─────────────────────────────────────────────────────

export async function addExpenseAttachment(workspaceId: string, expenseId: string, uploaderId: string, input: CreateExpenseAttachmentInput): Promise<ServiceResult<Expense>> {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const { rows: ex } = await c.query("SELECT id FROM expenses WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL", [expenseId, workspaceId]);
    if (!ex.length) { await c.query("ROLLBACK"); return { success: false, error: "Expense not found", status: 404 }; }
    await c.query(
      `INSERT INTO expense_attachments (expense_id,workspace_id,uploader_id,file_name,file_url,file_size_bytes,mime_type) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [expenseId, workspaceId, uploaderId, input.fileName.trim(), input.fileUrl.trim(), input.fileSizeBytes??null, input.mimeType??null]
    );
    await c.query("COMMIT");
    return getExpense(workspaceId, expenseId);
  } catch (err) {
    await c.query("ROLLBACK");
    console.error("[expense.addExpenseAttachment]", err);
    return { success: false, error: "Failed to add attachment", status: 500 };
  } finally { c.release(); }
}

// ─── getPendingApprovals ──────────────────────────────────────────────────────

export async function getPendingApprovals(workspaceId: string): Promise<ServiceResult<Expense[]>> {
  try {
    const SEL = await buildSEL();
    const { rows } = await db.query<ExpenseRow>(
      `${SEL} WHERE e.workspace_id=$1 AND e.deleted_at IS NULL AND e.status='pending' ORDER BY e.created_at ASC`, [workspaceId]
    );
    return { success: true, data: await rowsToExpenses(rows) };
  } catch (err) {
    console.error("[expense.getPendingApprovals]", err);
    return { success: false, error: "Failed to fetch pending approvals", status: 500 };
  }
}

// ─── getExpenseAnalytics ──────────────────────────────────────────────────────

export async function getExpenseAnalytics(workspaceId: string): Promise<ServiceResult<{
  totalPlanned: number; totalIncurred: number; totalApproved: number;
  totalRejected: number; totalPending: number;
  byCategory: { category: string; total: number }[];
  byStatus: { status: string; count: number; total: number }[];
  recentApprovals: { expenseName: string; approverName: string; stage: string; actionedAt: string }[];
}>> {
  try {
    const [s, cat, st, rec] = await Promise.all([
      db.query<{ total_planned:string; total_incurred:string; total_approved:string; total_rejected:string; total_pending:string }>(
        `SELECT COALESCE(SUM(amount_planned),0) AS total_planned,
                COALESCE(SUM(amount_incurred),0) AS total_incurred,
                COALESCE(SUM(CASE WHEN status='approved' THEN amount_planned END),0) AS total_approved,
                COALESCE(SUM(CASE WHEN status='rejected' THEN amount_planned END),0) AS total_rejected,
                COALESCE(SUM(CASE WHEN status='pending'  THEN amount_planned END),0) AS total_pending
         FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL`, [workspaceId]),
      db.query<{ category:string; total:string }>(
        `SELECT category, COALESCE(SUM(amount_planned),0) AS total FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL GROUP BY category ORDER BY total DESC`, [workspaceId]),
      db.query<{ status:string; count:string; total:string }>(
        `SELECT status, COUNT(*) AS count, COALESCE(SUM(amount_planned),0) AS total FROM expenses WHERE workspace_id=$1 AND deleted_at IS NULL GROUP BY status`, [workspaceId]),
      db.query<{ expense_name:string; approver_name:string; stage:string; actioned_at:string }>(
        `SELECT e.name AS expense_name, u.name AS approver_name, ea.stage, ea.actioned_at
         FROM expense_approvals ea JOIN expenses e ON e.id=ea.expense_id JOIN users u ON u.id=ea.approver_id
         WHERE ea.workspace_id=$1 AND ea.stage IN ('approved','rejected') ORDER BY ea.actioned_at DESC LIMIT 10`, [workspaceId]),
    ]);
    const r = s.rows[0];
    return { success: true, data: {
      totalPlanned: parseFloat(r.total_planned), totalIncurred: parseFloat(r.total_incurred),
      totalApproved: parseFloat(r.total_approved), totalRejected: parseFloat(r.total_rejected),
      totalPending: parseFloat(r.total_pending),
      byCategory: cat.rows.map((x) => ({ category: x.category, total: parseFloat(x.total) })),
      byStatus: st.rows.map((x) => ({ status: x.status, count: parseInt(x.count), total: parseFloat(x.total) })),
      recentApprovals: rec.rows.map((x) => ({ expenseName: x.expense_name, approverName: x.approver_name, stage: x.stage, actionedAt: x.actioned_at })),
    }};
  } catch (err) {
    console.error("[expense.getExpenseAnalytics]", err);
    return { success: false, error: "Failed to fetch analytics", status: 500 };
  }
}
