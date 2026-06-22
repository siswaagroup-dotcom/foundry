-- =============================================================================
-- MIGRATION V016 - EXPENSE PAID STATUS + NOTES
-- Adds 'paid' to expense status lifecycle.
-- Adds notes column for rejection reasons / freeform comments on the expense.
-- =============================================================================

-- 1. Add 'paid' to expenses status check
ALTER TABLE expenses DROP CONSTRAINT chk_expenses_status;
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_status
  CHECK (status IN ('planned','pending','approved','incurred','rejected','paid'));

-- 2. Add notes column (rejection reasons, general notes)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT NULL;

-- 3. Add 'paid' to expense_approvals stage
ALTER TABLE expense_approvals DROP CONSTRAINT chk_expense_approvals_stage;
ALTER TABLE expense_approvals ADD CONSTRAINT chk_expense_approvals_stage
  CHECK (stage IN ('submitted','under_review','approved','rejected','changes_requested','paid'));

COMMENT ON COLUMN expenses.notes IS 'General notes, rejection reasons, or additional context.';

-- 4. Add paid notification support for expense workflow completion
ALTER TABLE notifications DROP CONSTRAINT chk_notifications_type;
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type
  CHECK (type IN (
    'task_assigned',
    'task_completed',
    'task_overdue',
    'expense_submitted',
    'expense_approved',
    'expense_rejected',
    'expense_paid',
    'client_added',
    'post_scheduled',
    'post_published',
    'post_failed',
    'member_invited',
    'member_joined',
    'role_changed'
  ));
