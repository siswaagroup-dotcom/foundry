// POST /api/admin/run-migrations
// One-time utility: applies V015 + V016 schema migrations safely.
// Uses IF NOT EXISTS / idempotent ALTER TABLE — safe to run multiple times.
// DELETE this file after migrations are confirmed applied.
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_CLEANUP_SECRET) {
    return apiError("Unauthorized", 401);
  }

  const client = await db.connect();
  const results: string[] = [];

  try {
    await client.query("BEGIN");

    // ── V015: expense_approvals + workspace_settings ────────────────────────
    try {
      await client.query(`ALTER TABLE expense_approvals DROP CONSTRAINT IF EXISTS chk_expense_approvals_stage`);
      await client.query(`
        ALTER TABLE expense_approvals ADD CONSTRAINT chk_expense_approvals_stage
          CHECK (stage IN ('submitted','under_review','approved','rejected','changes_requested'))`);
      results.push("V015: expense_approvals stage constraint updated");
    } catch (e) { results.push(`V015 approvals: ${String(e)}`); }

    try {
      await client.query(`ALTER TABLE workspace_settings ADD COLUMN IF NOT EXISTS expense_required_approvals SMALLINT NOT NULL DEFAULT 1`);
      await client.query(`ALTER TABLE workspace_settings ADD COLUMN IF NOT EXISTS expense_auto_approve_below NUMERIC(12,2) NULL`);
      results.push("V015: workspace_settings columns added");
    } catch (e) { results.push(`V015 settings: ${String(e)}`); }

    // ── V016: notes column + paid status ───────────────────────────────────
    try {
      await client.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT NULL`);
      results.push("V016: notes column added to expenses");
    } catch (e) { results.push(`V016 notes: ${String(e)}`); }

    try {
      await client.query(`ALTER TABLE expenses DROP CONSTRAINT IF EXISTS chk_expenses_status`);
      await client.query(`
        ALTER TABLE expenses ADD CONSTRAINT chk_expenses_status
          CHECK (status IN ('planned','pending','approved','incurred','rejected','paid'))`);
      results.push("V016: expenses status constraint updated (added paid)");
    } catch (e) { results.push(`V016 status: ${String(e)}`); }

    try {
      await client.query(`ALTER TABLE expense_approvals DROP CONSTRAINT IF EXISTS chk_expense_approvals_stage`);
      await client.query(`
        ALTER TABLE expense_approvals ADD CONSTRAINT chk_expense_approvals_stage
          CHECK (stage IN ('submitted','under_review','approved','rejected','changes_requested','paid'))`);
      results.push("V016: expense_approvals stage constraint updated (added paid)");
    } catch (e) { results.push(`V016 approvals paid: ${String(e)}`); }

    try {
      await client.query(`ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notifications_type`);
      await client.query(`
        ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type
          CHECK (type IN (
            'task_assigned','task_completed','task_overdue',
            'expense_submitted','expense_approved','expense_rejected','expense_paid',
            'client_added','post_scheduled','post_published','post_failed',
            'member_invited','member_joined','role_changed'
          ))`);
      results.push("V016: notifications type constraint updated (added expense_paid)");
    } catch (e) { results.push(`V016 notifications: ${String(e)}`); }

    // ── V017: clients CRM upgrade ──────────────────────────────────────────
    try {
      await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS crm_status VARCHAR(30) NOT NULL DEFAULT 'lead'`);
      // Add constraint only if it doesn't already exist
      const { rows: constraintRows } = await client.query(
        `SELECT 1 FROM information_schema.table_constraints
         WHERE table_name='clients' AND constraint_name='chk_clients_crm_status'`
      );
      if (constraintRows.length === 0) {
        await client.query(`
          ALTER TABLE clients ADD CONSTRAINT chk_clients_crm_status
            CHECK (crm_status IN (
              'lead','qualified','proposal_sent','negotiation',
              'advance_received','active_client','completed'
            ))`);
      }
      await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS quoted_amount    NUMERIC(12,2) NULL`);
      await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS advance_received NUMERIC(12,2) NULL`);
      await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS paid_amount      NUMERIC(12,2) NULL`);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_clients_workspace_crm_status
          ON clients (workspace_id, crm_status) WHERE deleted_at IS NULL`);
      results.push("V017: clients CRM columns and index added");
    } catch (e) { results.push(`V017 clients crm: ${String(e)}`); }

    // Verify notes column exists
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name='expenses' AND column_name='notes'`
    );
    const notesExists = rows.length > 0;

    return apiSuccess({
      applied: results,
      notesColumnExists: notesExists,
      message: notesExists
        ? "All migrations applied. notes column confirmed."
        : "WARNING: notes column still missing — check results above.",
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[run-migrations]", err);
    return apiError("Migration failed", 500);
  } finally {
    client.release();
  }
}
