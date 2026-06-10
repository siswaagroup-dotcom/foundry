-- =============================================================================
-- MIGRATION V002 — WORKSPACE & TENANCY
-- Tables: workspaces, workspace_members, workspace_invitations
-- Depends on: V001 (users)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: workspaces
-- Purpose: The central tenant entity. Every piece of business data belongs
--          to exactly one workspace. The root of all tenant isolation.
-- ---------------------------------------------------------------------------
CREATE TABLE workspaces (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(255)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,       -- URL-safe unique identifier
    owner_id        UUID            NOT NULL,       -- FK to users — set on creation
    business_type   VARCHAR(100)    NULL,           -- agency, startup, saas, etc.
    timezone        VARCHAR(100)    NOT NULL DEFAULT 'UTC',
    currency        CHAR(3)         NOT NULL DEFAULT 'USD',
    logo_url        TEXT            NULL,
    plan_id         UUID            NULL,           -- FK added after plans table exists (V011)
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,           -- soft delete

    CONSTRAINT pk_workspaces PRIMARY KEY (id),
    CONSTRAINT uq_workspaces_slug UNIQUE (slug),
    CONSTRAINT fk_workspaces_owner
        FOREIGN KEY (owner_id)
        REFERENCES users (id)
        ON DELETE RESTRICT       -- cannot delete a user who owns a workspace
        ON UPDATE CASCADE,
    CONSTRAINT chk_workspaces_currency
        CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_workspaces_slug
        CHECK (slug ~ '^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$')
);

-- Indexes
CREATE UNIQUE INDEX idx_workspaces_slug
    ON workspaces (slug);

CREATE INDEX idx_workspaces_owner_id
    ON workspaces (owner_id);

CREATE INDEX idx_workspaces_active
    ON workspaces (id, owner_id)
    WHERE deleted_at IS NULL;

COMMENT ON TABLE  workspaces               IS 'Central tenant entity. All business data belongs to a workspace.';
COMMENT ON COLUMN workspaces.slug          IS 'Lowercase hyphenated URL-safe identifier. Must be globally unique.';
COMMENT ON COLUMN workspaces.plan_id       IS 'FK to plans. Added via ALTER TABLE in V011 after plans table is created.';
COMMENT ON COLUMN workspaces.deleted_at    IS 'Soft delete. Does NOT cascade to child data — must be handled by application.';

-- ---------------------------------------------------------------------------
-- TABLE: workspace_members
-- Purpose: Junction table — users ↔ workspaces (M2M).
--          Carries the role assignment for the membership.
--          A user can be a member of multiple workspaces with different roles.
-- ---------------------------------------------------------------------------
CREATE TABLE workspace_members (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL,
    user_id         UUID        NOT NULL,
    role_id         UUID        NOT NULL,           -- FK to roles (added in V003)
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    joined_at       TIMESTAMPTZ NULL,               -- NULL = not yet accepted
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_workspace_members PRIMARY KEY (id),
    CONSTRAINT uq_workspace_members_user
        UNIQUE (workspace_id, user_id),             -- one membership per user per workspace
    CONSTRAINT fk_workspace_members_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_workspace_members_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_workspace_members_status
        CHECK (status IN ('active', 'suspended'))
);

-- Indexes
CREATE UNIQUE INDEX idx_workspace_members_user_workspace
    ON workspace_members (workspace_id, user_id);

CREATE INDEX idx_workspace_members_workspace_active
    ON workspace_members (workspace_id, status)
    WHERE status = 'active';

CREATE INDEX idx_workspace_members_user_id
    ON workspace_members (user_id);

-- Used by RBAC permission check query (hot path)
CREATE INDEX idx_workspace_members_rbac
    ON workspace_members (user_id, workspace_id, status)
    WHERE status = 'active';

COMMENT ON TABLE  workspace_members          IS 'M2M junction: users <-> workspaces. Carries role and membership status.';
COMMENT ON COLUMN workspace_members.role_id  IS 'FK to roles. Note: roles are workspace-scoped.';

-- Note: role_id FK constraint is added in V003 after roles table exists.
-- See: V003__rbac.sql — ALTER TABLE workspace_members ADD CONSTRAINT fk_workspace_members_role

-- ---------------------------------------------------------------------------
-- TABLE: workspace_invitations
-- Purpose: Pending email invitations to join a workspace.
--          Separate from workspace_members because the invitee may not have
--          a Foundry account yet when invited.
-- ---------------------------------------------------------------------------
CREATE TABLE workspace_invitations (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL,
    invited_by      UUID        NOT NULL,           -- FK to users
    email           VARCHAR(320) NOT NULL,
    role_id         UUID        NOT NULL,           -- role to assign on acceptance
    token_hash      TEXT        NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at      TIMESTAMPTZ NOT NULL,
    accepted_at     TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_workspace_invitations PRIMARY KEY (id),
    CONSTRAINT uq_workspace_invitations_token UNIQUE (token_hash),
    CONSTRAINT fk_workspace_invitations_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_workspace_invitations_invited_by
        FOREIGN KEY (invited_by)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_workspace_invitations_status
        CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    CONSTRAINT chk_workspace_invitations_email
        CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Indexes
CREATE UNIQUE INDEX idx_workspace_invitations_token
    ON workspace_invitations (token_hash);

-- Prevent duplicate pending invite for same email in same workspace
CREATE UNIQUE INDEX idx_workspace_invitations_pending_unique
    ON workspace_invitations (workspace_id, email)
    WHERE status = 'pending';

CREATE INDEX idx_workspace_invitations_workspace_status
    ON workspace_invitations (workspace_id, status);

CREATE INDEX idx_workspace_invitations_email
    ON workspace_invitations (email);

COMMENT ON TABLE  workspace_invitations            IS 'Pending invitations to join a workspace. Invitee may not have an account yet.';
COMMENT ON COLUMN workspace_invitations.token_hash IS 'SHA-256 hash of the invitation token sent via email.';
COMMENT ON COLUMN workspace_invitations.role_id    IS 'Role to assign when the invitation is accepted.';
