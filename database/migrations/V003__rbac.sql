-- =============================================================================
-- MIGRATION V003 — RBAC
-- Tables: roles, permissions, role_permissions
-- Also adds deferred FK constraints back onto workspace_members and
-- workspace_invitations that could not be added in V002 (circular dependency)
-- Depends on: V001, V002
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: roles
-- Purpose: Named roles scoped to a workspace.
--          System roles (is_system = TRUE) are seeded and cannot be deleted.
--          Custom roles (is_system = FALSE) can be created by workspace admins.
-- ---------------------------------------------------------------------------
CREATE TABLE roles (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID            NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT            NULL,
    is_system       BOOLEAN         NOT NULL DEFAULT FALSE,  -- protects seeded roles
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uq_roles_workspace_name UNIQUE (workspace_id, name),
    CONSTRAINT fk_roles_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_roles_name_not_empty
        CHECK (char_length(trim(name)) > 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_roles_workspace_name
    ON roles (workspace_id, name);

CREATE INDEX idx_roles_workspace_id
    ON roles (workspace_id);

COMMENT ON TABLE  roles            IS 'Workspace-scoped named roles. System roles are seeded and protected.';
COMMENT ON COLUMN roles.is_system  IS 'TRUE = seeded role (owner/admin/manager/member/viewer). Cannot be deleted.';

-- ---------------------------------------------------------------------------
-- TABLE: permissions
-- Purpose: Master reference table of every valid (module, action) pair.
--          System-level — not workspace-scoped. Seeded once at init.
--          37 rows total covering all modules and actions.
-- ---------------------------------------------------------------------------
CREATE TABLE permissions (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    module      VARCHAR(50) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    description TEXT        NULL,

    CONSTRAINT pk_permissions PRIMARY KEY (id),
    CONSTRAINT uq_permissions_module_action UNIQUE (module, action),
    CONSTRAINT chk_permissions_module
        CHECK (module IN (
            'dashboard', 'tasks', 'expenses', 'clients',
            'social', 'team', 'reports', 'settings', 'billing'
        )),
    CONSTRAINT chk_permissions_action
        CHECK (action IN ('view', 'create', 'edit', 'delete', 'approve'))
);

-- Indexes
CREATE UNIQUE INDEX idx_permissions_module_action
    ON permissions (module, action);

CREATE INDEX idx_permissions_module
    ON permissions (module);

COMMENT ON TABLE permissions IS 'System-level reference table of all valid module+action permission pairs. Seeded once.';

-- ---------------------------------------------------------------------------
-- TABLE: role_permissions
-- Purpose: M2M bridge — roles ↔ permissions.
--          Defines exactly what each role is allowed to do.
-- ---------------------------------------------------------------------------
CREATE TABLE role_permissions (
    role_id         UUID    NOT NULL,
    permission_id   UUID    NOT NULL,

    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX idx_role_permissions_role_id
    ON role_permissions (role_id);

CREATE INDEX idx_role_permissions_permission_id
    ON role_permissions (permission_id);

COMMENT ON TABLE role_permissions IS 'M2M bridge: roles <-> permissions. Drives all RBAC permission checks.';

-- ---------------------------------------------------------------------------
-- ADD DEFERRED FK CONSTRAINTS FROM V002
-- role_id FKs on workspace_members and workspace_invitations
-- could not be added in V002 because roles did not exist yet.
-- ---------------------------------------------------------------------------
ALTER TABLE workspace_members
    ADD CONSTRAINT fk_workspace_members_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE RESTRICT   -- cannot delete a role that is assigned to members
        ON UPDATE CASCADE;

ALTER TABLE workspace_invitations
    ADD CONSTRAINT fk_workspace_invitations_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE RESTRICT   -- cannot delete a role with pending invitations
        ON UPDATE CASCADE;
