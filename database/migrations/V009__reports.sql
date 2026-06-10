-- =============================================================================
-- MIGRATION V009 — REPORTS
-- Tables: saved_reports
-- Depends on: V001 (users), V002 (workspaces)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: saved_reports
-- Purpose: Persists report configurations (filter sets, type, name, status).
--          Actual report data is computed at query time from other tables —
--          this table stores WHAT to compute, not the result.
-- ---------------------------------------------------------------------------
CREATE TABLE saved_reports (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID            NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    report_type     VARCHAR(50)     NOT NULL,
    filters         JSONB           NULL,           -- saved filter configuration
    status          VARCHAR(20)     NOT NULL DEFAULT 'draft',
    created_by      UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,

    CONSTRAINT pk_saved_reports PRIMARY KEY (id),
    CONSTRAINT fk_saved_reports_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_saved_reports_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_saved_reports_type
        CHECK (report_type IN ('revenue', 'expenses', 'tasks', 'clients', 'team', 'social')),
    CONSTRAINT chk_saved_reports_status
        CHECK (status IN ('ready', 'draft', 'scheduled')),
    CONSTRAINT chk_saved_reports_name_not_empty
        CHECK (char_length(trim(name)) > 0)
);

-- Indexes
CREATE INDEX idx_saved_reports_workspace_type
    ON saved_reports (workspace_id, report_type)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_saved_reports_workspace
    ON saved_reports (workspace_id)
    WHERE deleted_at IS NULL;

-- GIN index for JSONB filter queries (future: search by filter config)
CREATE INDEX idx_saved_reports_filters_gin
    ON saved_reports USING gin (filters)
    WHERE filters IS NOT NULL;

COMMENT ON TABLE  saved_reports         IS 'Saved report configurations. Stores filter config — actual data is computed at query time.';
COMMENT ON COLUMN saved_reports.filters IS 'JSONB blob storing filter parameters (date range, status, category, etc.).';
