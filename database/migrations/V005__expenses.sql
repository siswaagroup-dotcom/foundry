-- =============================================================================
-- MIGRATION V005 — EXPENSES MODULE
-- Tables: expenses, expense_approvals, expense_attachments
-- Depends on: V001 (users), V002 (workspaces)
-- Note: expenses.client_id FK is added in V006 after clients table exists
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: expenses
-- Purpose: Core expense entity. Tracks planned vs incurred spending.
--          Dual-amount design: amount_planned (what was budgeted) and
--          amount_incurred (what was actually spent). Drives variance reporting.
-- ---------------------------------------------------------------------------
CREATE TABLE expenses (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id        UUID            NOT NULL,
    name                VARCHAR(500)    NOT NULL,
    detail              TEXT            NULL,
    category            VARCHAR(100)    NOT NULL,
    vendor              VARCHAR(255)    NULL,
    amount_planned      NUMERIC(12,2)   NOT NULL,
    amount_incurred     NUMERIC(12,2)   NULL,           -- NULL until incurred
    currency            CHAR(3)         NOT NULL DEFAULT 'USD',
    status              VARCHAR(30)     NOT NULL DEFAULT 'planned',
    expense_date        DATE            NOT NULL,
    owner_id            UUID            NOT NULL,       -- who submitted the expense
    client_id           UUID            NULL,           -- FK added in V006
    created_by          UUID            NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT pk_expenses PRIMARY KEY (id),
    CONSTRAINT fk_expenses_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_owner
        FOREIGN KEY (owner_id)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_expenses_status
        CHECK (status IN ('planned', 'pending', 'approved', 'incurred', 'rejected')),
    CONSTRAINT chk_expenses_currency
        CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_expenses_amount_planned_positive
        CHECK (amount_planned >= 0),
    CONSTRAINT chk_expenses_amount_incurred_positive
        CHECK (amount_incurred IS NULL OR amount_incurred >= 0),
    CONSTRAINT chk_expenses_name_not_empty
        CHECK (char_length(trim(name)) > 0)
);

-- Indexes
-- Filter expenses by status (Pending Approvals, etc.)
CREATE INDEX idx_expenses_workspace_status
    ON expenses (workspace_id, status)
    WHERE deleted_at IS NULL;

-- Date range queries (This Month, This Quarter, This Year)
CREATE INDEX idx_expenses_workspace_date
    ON expenses (workspace_id, expense_date)
    WHERE deleted_at IS NULL;

-- Filter by category
CREATE INDEX idx_expenses_workspace_category
    ON expenses (workspace_id, category)
    WHERE deleted_at IS NULL;

-- My expenses view
CREATE INDEX idx_expenses_workspace_owner
    ON expenses (workspace_id, owner_id)
    WHERE deleted_at IS NULL;

-- Expenses per client
CREATE INDEX idx_expenses_client_id
    ON expenses (client_id)
    WHERE client_id IS NOT NULL;

COMMENT ON TABLE  expenses                  IS 'Core expense entity. Dual-amount design supports variance reporting.';
COMMENT ON COLUMN expenses.amount_planned   IS 'Budgeted amount. Always required.';
COMMENT ON COLUMN expenses.amount_incurred  IS 'Actual amount spent. NULL until status reaches incurred.';
COMMENT ON COLUMN expenses.client_id        IS 'Optional FK to clients. Added via ALTER TABLE in V006.';

-- ---------------------------------------------------------------------------
-- TABLE: expense_approvals
-- Purpose: Multi-stage approval workflow records.
--          Each row represents ONE stage transition by ONE approver.
--          Full approval history is preserved — not just current state.
-- ---------------------------------------------------------------------------
CREATE TABLE expense_approvals (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    expense_id      UUID        NOT NULL,
    workspace_id    UUID        NOT NULL,   -- denormalized for tenant isolation
    approver_id     UUID        NOT NULL,
    stage           VARCHAR(30) NOT NULL,
    comment         TEXT        NULL,
    actioned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_expense_approvals PRIMARY KEY (id),
    CONSTRAINT fk_expense_approvals_expense
        FOREIGN KEY (expense_id)
        REFERENCES expenses (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expense_approvals_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expense_approvals_approver
        FOREIGN KEY (approver_id)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_expense_approvals_stage
        CHECK (stage IN ('submitted', 'under_review', 'approved', 'rejected'))
);

-- Indexes
-- Approval history for an expense (Expense Detail screen, approval workflow)
CREATE INDEX idx_expense_approvals_expense_timeline
    ON expense_approvals (expense_id, actioned_at ASC);

-- All approvals pending a specific approver
CREATE INDEX idx_expense_approvals_approver
    ON expense_approvals (approver_id, actioned_at DESC);

CREATE INDEX idx_expense_approvals_workspace
    ON expense_approvals (workspace_id);

COMMENT ON TABLE expense_approvals IS 'Multi-stage expense approval workflow. Append-only — preserves full history.';

-- ---------------------------------------------------------------------------
-- TABLE: expense_attachments
-- Purpose: Receipt images and supporting documents for an expense.
--          One-to-many: expenses → attachments.
-- ---------------------------------------------------------------------------
CREATE TABLE expense_attachments (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    expense_id          UUID            NOT NULL,
    workspace_id        UUID            NOT NULL,   -- denormalized for tenant isolation
    uploader_id         UUID            NOT NULL,
    file_name           VARCHAR(500)    NOT NULL,
    file_url            TEXT            NOT NULL,   -- S3/cloud storage URL
    file_size_bytes     BIGINT          NULL,
    mime_type           VARCHAR(100)    NULL,
    uploaded_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_expense_attachments PRIMARY KEY (id),
    CONSTRAINT fk_expense_attachments_expense
        FOREIGN KEY (expense_id)
        REFERENCES expenses (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expense_attachments_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expense_attachments_uploader
        FOREIGN KEY (uploader_id)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_expense_attachments_file_size
        CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

-- Indexes
CREATE INDEX idx_expense_attachments_expense_id
    ON expense_attachments (expense_id);

CREATE INDEX idx_expense_attachments_workspace
    ON expense_attachments (workspace_id);

COMMENT ON TABLE expense_attachments IS 'Receipt images and documents attached to an expense. URLs point to cloud storage.';
