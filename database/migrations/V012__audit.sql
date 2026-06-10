-- =============================================================================
-- MIGRATION V012 — AUDIT TRAIL
-- Tables: activity_logs
-- Depends on: V001 (users), V002 (workspaces)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: activity_logs
-- Purpose: Append-only, immutable audit trail of every significant action.
--          Drives team activity feeds on Dashboard, Task Details,
--          Expense Detail, Social Post Detail, and Client Detail screens.
--
--          IMPORTANT: This table is NEVER updated or soft-deleted.
--          It is an immutable ledger. Once a row is inserted, it stays forever
--          (until archived per retention policy).
--
--          Partitioned by created_at (monthly range) for performance at scale.
-- ---------------------------------------------------------------------------

-- Create the partitioned parent table
CREATE TABLE activity_logs (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL,
    actor_id        UUID        NULL,           -- NULL for system-generated actions
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID        NOT NULL,
    action          VARCHAR(50) NOT NULL,
    changes         JSONB       NULL,           -- { "field": [old_value, new_value] }
    metadata        JSONB       NULL,           -- extra context (IP, user agent, etc.)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_activity_logs PRIMARY KEY (id, created_at),  -- partition key must be in PK
    CONSTRAINT fk_activity_logs_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_activity_logs_actor
        FOREIGN KEY (actor_id)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_activity_logs_entity_type
        CHECK (entity_type IN (
            'task', 'expense', 'client', 'social_post',
            'team_member', 'role', 'workspace', 'invoice',
            'social_account', 'saved_report'
        )),
    CONSTRAINT chk_activity_logs_action
        CHECK (action IN (
            'created', 'updated', 'deleted',
            'status_changed', 'assigned', 'unassigned',
            'approved', 'rejected', 'submitted',
            'invited', 'joined', 'removed',
            'role_changed', 'connected', 'disconnected',
            'published', 'scheduled', 'cancelled'
        ))
) PARTITION BY RANGE (created_at);

-- ---------------------------------------------------------------------------
-- PARTITIONS — Monthly range partitions
-- Seed with 12 months of initial partitions.
-- New partitions should be created by a scheduled job each month.
-- ---------------------------------------------------------------------------
CREATE TABLE activity_logs_2026_01
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE activity_logs_2026_02
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE activity_logs_2026_03
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE activity_logs_2026_04
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE activity_logs_2026_05
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE activity_logs_2026_06
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE activity_logs_2026_07
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE activity_logs_2026_08
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE activity_logs_2026_09
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE activity_logs_2026_10
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE activity_logs_2026_11
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE activity_logs_2026_12
    PARTITION OF activity_logs
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Default partition catches rows outside defined ranges
CREATE TABLE activity_logs_default
    PARTITION OF activity_logs DEFAULT;

-- ---------------------------------------------------------------------------
-- INDEXES on activity_logs
-- (Applied to the parent — inherited by all partitions automatically)
-- ---------------------------------------------------------------------------

-- Dashboard team activity feed: recent actions in a workspace
CREATE INDEX idx_activity_logs_workspace_feed
    ON activity_logs (workspace_id, created_at DESC);

-- Entity history: all actions on a specific task/expense/client/etc.
CREATE INDEX idx_activity_logs_entity_history
    ON activity_logs (entity_type, entity_id, created_at DESC);

-- Actor history: all actions performed by a specific user
CREATE INDEX idx_activity_logs_actor
    ON activity_logs (actor_id, created_at DESC)
    WHERE actor_id IS NOT NULL;

-- Workspace + entity type: e.g., "all task actions in workspace X"
CREATE INDEX idx_activity_logs_workspace_entity_type
    ON activity_logs (workspace_id, entity_type, created_at DESC);

COMMENT ON TABLE  activity_logs          IS 'Append-only immutable audit ledger. NEVER update or delete rows. Partitioned monthly.';
COMMENT ON COLUMN activity_logs.changes  IS 'Field-level diff: {"field_name": [old_value, new_value]}. NULL if not applicable.';
COMMENT ON COLUMN activity_logs.metadata IS 'Extra context: IP address, user agent, etc. Stored as JSONB for flexibility.';
COMMENT ON COLUMN activity_logs.actor_id IS 'NULL for system-generated events (scheduled jobs, webhooks).';
