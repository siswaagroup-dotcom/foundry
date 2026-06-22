-- =============================================================================
-- MIGRATION V015 — EXPENSE APPROVAL WORKFLOW ENHANCEMENTS
-- Extends expense_approvals to support full Phase 5 workflow.
-- =============================================================================

-- 1. Add 'changes_requested' to the expense_approvals stage check
ALTER TABLE expense_approvals
  DROP CONSTRAINT chk_expense_approvals_stage;

ALTER TABLE expense_approvals
  ADD CONSTRAINT chk_expense_approvals_stage
    CHECK (stage IN ('submitted', 'under_review', 'approved', 'rejected', 'changes_requested'));

-- 2. Add required_approvals and policy fields to workspace_settings
ALTER TABLE workspace_settings
  ADD COLUMN IF NOT EXISTS expense_required_approvals  SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS expense_auto_approve_below  NUMERIC(12,2) NULL;

-- 3. Index: pending approvals for a specific approver (My Approvals view)
CREATE INDEX IF NOT EXISTS idx_expense_approvals_pending_approver
  ON expense_approvals (approver_id, actioned_at DESC)
  WHERE stage IN ('submitted', 'under_review');

-- 4. Index: approval status per expense (progress tracking)
CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense_stage
  ON expense_approvals (expense_id, stage, actioned_at DESC);

COMMENT ON COLUMN workspace_settings.expense_required_approvals IS
  'Number of approval stages required before expense is fully approved.';
COMMENT ON COLUMN workspace_settings.expense_auto_approve_below IS
  'Expenses with amount_planned below this value are auto-approved. NULL = disabled.';
