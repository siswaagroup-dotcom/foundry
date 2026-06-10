-- =============================================================================
-- MIGRATION V010 — SETTINGS
-- Tables: workspace_settings
-- Depends on: V002 (workspaces)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: workspace_settings
-- Purpose: Extended configuration for a workspace.
--          One-to-One with workspaces. Using workspace_id as both PK and FK
--          enforces the 1:1 relationship at the database level.
--          Separated from workspaces to keep core workspace row lean and
--          isolate settings from frequently-read identity data.
-- ---------------------------------------------------------------------------
CREATE TABLE workspace_settings (
    workspace_id                    UUID        NOT NULL,

    -- Expense module settings
    expense_approval_required       BOOLEAN     NOT NULL DEFAULT TRUE,
    expense_approval_threshold      NUMERIC(12,2) NULL,  -- auto-approve below this amount

    -- Task module defaults
    task_default_status             VARCHAR(30) NOT NULL DEFAULT 'todo',
    task_default_priority           VARCHAR(20) NOT NULL DEFAULT 'medium',

    -- Notification preferences
    notification_email_enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
    notification_digest_enabled     BOOLEAN     NOT NULL DEFAULT FALSE,
    notification_digest_day         SMALLINT    NULL,    -- 0=Sun ... 6=Sat

    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_workspace_settings PRIMARY KEY (workspace_id),
    CONSTRAINT fk_workspace_settings_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_workspace_settings_task_status
        CHECK (task_default_status IN ('todo', 'planning', 'doing', 'review', 'done')),
    CONSTRAINT chk_workspace_settings_task_priority
        CHECK (task_default_priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT chk_workspace_settings_digest_day
        CHECK (
            notification_digest_day IS NULL OR
            notification_digest_day BETWEEN 0 AND 6
        ),
    CONSTRAINT chk_workspace_settings_approval_threshold
        CHECK (
            expense_approval_threshold IS NULL OR
            expense_approval_threshold >= 0
        )
);

COMMENT ON TABLE  workspace_settings                            IS '1:1 extension of workspaces. Extended config separated for row width and update frequency.';
COMMENT ON COLUMN workspace_settings.expense_approval_threshold IS 'Expenses below this amount are auto-approved. NULL = all expenses require approval.';
COMMENT ON COLUMN workspace_settings.notification_digest_day    IS '0=Sunday, 1=Monday ... 6=Saturday. NULL when digest is disabled.';
