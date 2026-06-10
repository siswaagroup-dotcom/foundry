-- =============================================================================
-- MIGRATION V006 — CLIENTS MODULE
-- Tables: clients, client_contacts, client_tags
-- Also adds cross-module FK constraints for tasks.client_id
-- and expenses.client_id (deferred from V004/V005)
-- Depends on: V001, V002, V004, V005
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: clients
-- Purpose: CRM client entity. Represents companies or individuals that
--          the workspace works with. Links to tasks, expenses, social posts.
-- ---------------------------------------------------------------------------
CREATE TABLE clients (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID            NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    company_name    VARCHAR(255)    NULL,
    industry        VARCHAR(100)    NULL,
    email           VARCHAR(320)    NULL,
    phone           VARCHAR(50)     NULL,
    location        VARCHAR(255)    NULL,
    timezone        VARCHAR(100)    NULL,
    tier            VARCHAR(20)     NOT NULL DEFAULT 'standard',
    priority        VARCHAR(20)     NOT NULL DEFAULT 'normal',
    client_since    DATE            NULL,
    notes           TEXT            NULL,
    created_by      UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,

    CONSTRAINT pk_clients PRIMARY KEY (id),
    CONSTRAINT fk_clients_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_clients_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_clients_tier
        CHECK (tier IN ('enterprise', 'premium', 'standard')),
    CONSTRAINT chk_clients_priority
        CHECK (priority IN ('high', 'normal')),
    CONSTRAINT chk_clients_name_not_empty
        CHECK (char_length(trim(name)) > 0),
    CONSTRAINT chk_clients_email_format
        CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Indexes
-- Client list filtered by tier
CREATE INDEX idx_clients_workspace_tier
    ON clients (workspace_id, tier)
    WHERE deleted_at IS NULL;

-- High priority clients filter
CREATE INDEX idx_clients_workspace_priority
    ON clients (workspace_id, priority)
    WHERE deleted_at IS NULL;

-- Active clients list (main view)
CREATE INDEX idx_clients_workspace_active
    ON clients (workspace_id, name)
    WHERE deleted_at IS NULL;

-- Name search (trigram for partial matching — requires pg_trgm extension)
CREATE INDEX idx_clients_name_trgm
    ON clients USING gin (name gin_trgm_ops);

COMMENT ON TABLE  clients           IS 'CRM client entity. Companies or individuals the workspace serves.';
COMMENT ON COLUMN clients.tier      IS 'enterprise | premium | standard. Used for filtering and reporting.';
COMMENT ON COLUMN clients.priority  IS 'high | normal. Used for sorting and saved filters.';

-- ---------------------------------------------------------------------------
-- TABLE: client_contacts
-- Purpose: Individual contact persons at a client company.
--          One-to-many: clients → contacts.
--          NOT to be confused with users — these are external people.
-- ---------------------------------------------------------------------------
CREATE TABLE client_contacts (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    client_id       UUID            NOT NULL,
    workspace_id    UUID            NOT NULL,   -- denormalized for tenant isolation
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(320)    NULL,
    phone           VARCHAR(50)     NULL,
    role            VARCHAR(100)    NULL,       -- job title / role at client company
    is_primary      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_client_contacts PRIMARY KEY (id),
    CONSTRAINT fk_client_contacts_client
        FOREIGN KEY (client_id)
        REFERENCES clients (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_client_contacts_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_client_contacts_name_not_empty
        CHECK (char_length(trim(name)) > 0),
    CONSTRAINT chk_client_contacts_email_format
        CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Indexes
CREATE INDEX idx_client_contacts_client_id
    ON client_contacts (client_id);

-- Find a contact by email within a workspace
CREATE INDEX idx_client_contacts_workspace_email
    ON client_contacts (workspace_id, email)
    WHERE email IS NOT NULL;

COMMENT ON TABLE  client_contacts             IS 'Contact persons at a client company. External people, not Foundry users.';
COMMENT ON COLUMN client_contacts.is_primary  IS 'Marks the primary contact for a client. One client can have one primary.';

-- ---------------------------------------------------------------------------
-- TABLE: client_tags
-- Purpose: Free-form text tags on clients (Enterprise, Premium, Verified, etc.)
--          M2M: clients ↔ tags.
-- ---------------------------------------------------------------------------
CREATE TABLE client_tags (
    client_id   UUID            NOT NULL,
    tag         VARCHAR(100)    NOT NULL,

    CONSTRAINT pk_client_tags PRIMARY KEY (client_id, tag),
    CONSTRAINT fk_client_tags_client
        FOREIGN KEY (client_id)
        REFERENCES clients (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_client_tags_not_empty
        CHECK (char_length(trim(tag)) > 0)
);

-- Indexes
CREATE INDEX idx_client_tags_tag
    ON client_tags (tag);

COMMENT ON TABLE client_tags IS 'Text tags on clients. Enterprise, Premium, Verified, Standard or custom.';

-- ---------------------------------------------------------------------------
-- ADD DEFERRED CROSS-MODULE FK CONSTRAINTS
-- tasks.client_id and expenses.client_id were left as plain columns in
-- V004/V005 because the clients table did not exist yet.
-- ---------------------------------------------------------------------------
ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_client
        FOREIGN KEY (client_id)
        REFERENCES clients (id)
        ON DELETE SET NULL   -- deleting a client keeps the task, just removes link
        ON UPDATE CASCADE;

ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_client
        FOREIGN KEY (client_id)
        REFERENCES clients (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

-- Indexes for the newly active FKs
CREATE INDEX idx_tasks_client_id
    ON tasks (client_id)
    WHERE client_id IS NOT NULL;
