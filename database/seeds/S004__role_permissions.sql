-- =============================================================================
-- SEED S004 — DEFAULT ROLE PERMISSIONS MAPPING
-- =============================================================================
-- This seed defines the DEFAULT permission matrix for each system role.
-- It creates the function: assign_default_role_permissions(workspace_id)
-- which is called by create_workspace_roles() during workspace creation.
--
-- PERMISSION MATRIX SUMMARY:
--
-- Module      | owner | admin | manager | member | viewer
-- ------------|-------|-------|---------|--------|-------
-- dashboard   | view  | view  | view    | view   | view
-- tasks       | all   | all   | v,c,e,a | v,c,e  | view
-- expenses    | all   | all   | v,c,e,a | v,c    | view
-- clients     | all   | all   | v,c,e   | v,c    | view
-- social      | all   | all   | v,c,e,a | v,c,e  | view
-- team        | all   | v,c,e | v       | view   | view
-- reports     | all   | all   | v,c     | view   | view
-- settings    | all   | v,e   | view    | view   | —
-- billing     | all   | view  | —       | —      | —
-- =============================================================================

CREATE OR REPLACE FUNCTION assign_default_role_permissions(p_workspace_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner_id   UUID;
    v_admin_id   UUID;
    v_manager_id UUID;
    v_member_id  UUID;
    v_viewer_id  UUID;
BEGIN
    -- Fetch the role IDs for this workspace
    SELECT id INTO v_owner_id   FROM roles WHERE workspace_id = p_workspace_id AND name = 'owner';
    SELECT id INTO v_admin_id   FROM roles WHERE workspace_id = p_workspace_id AND name = 'admin';
    SELECT id INTO v_manager_id FROM roles WHERE workspace_id = p_workspace_id AND name = 'manager';
    SELECT id INTO v_member_id  FROM roles WHERE workspace_id = p_workspace_id AND name = 'member';
    SELECT id INTO v_viewer_id  FROM roles WHERE workspace_id = p_workspace_id AND name = 'viewer';

    -- =========================================================================
    -- OWNER — Full access to everything (all 37 permissions)
    -- =========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_owner_id, id FROM permissions;

    -- =========================================================================
    -- ADMIN — Full access except billing.edit and billing.delete
    -- =========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_admin_id, id FROM permissions
    WHERE NOT (module = 'billing' AND action IN ('edit', 'delete'));

    -- =========================================================================
    -- MANAGER — Broad access, no delete on sensitive modules, no billing/settings write
    -- =========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_manager_id, id FROM permissions
    WHERE (module = 'dashboard' AND action = 'view')
       OR (module = 'tasks'     AND action IN ('view', 'create', 'edit', 'approve'))
       OR (module = 'expenses'  AND action IN ('view', 'create', 'edit', 'approve'))
       OR (module = 'clients'   AND action IN ('view', 'create', 'edit'))
       OR (module = 'social'    AND action IN ('view', 'create', 'edit', 'approve'))
       OR (module = 'team'      AND action = 'view')
       OR (module = 'reports'   AND action IN ('view', 'create'))
       OR (module = 'settings'  AND action = 'view');

    -- =========================================================================
    -- MEMBER — Create and edit in their core modules, no approvals, no team/settings management
    -- =========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_member_id, id FROM permissions
    WHERE (module = 'dashboard' AND action = 'view')
       OR (module = 'tasks'     AND action IN ('view', 'create', 'edit'))
       OR (module = 'expenses'  AND action IN ('view', 'create'))
       OR (module = 'clients'   AND action IN ('view', 'create'))
       OR (module = 'social'    AND action IN ('view', 'create', 'edit'))
       OR (module = 'team'      AND action = 'view')
       OR (module = 'reports'   AND action = 'view')
       OR (module = 'settings'  AND action = 'view');

    -- =========================================================================
    -- VIEWER — View-only across tasks, expenses, clients, social, reports, team
    --          No access to settings or billing
    -- =========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_viewer_id, id FROM permissions
    WHERE (module = 'dashboard' AND action = 'view')
       OR (module = 'tasks'     AND action = 'view')
       OR (module = 'expenses'  AND action = 'view')
       OR (module = 'clients'   AND action = 'view')
       OR (module = 'social'    AND action = 'view')
       OR (module = 'team'      AND action = 'view')
       OR (module = 'reports'   AND action = 'view');

END;
$$;

COMMENT ON FUNCTION assign_default_role_permissions IS
    'Assigns default permission sets to the 5 system roles for a workspace. Called during workspace init.';

-- =============================================================================
-- FUNCTION: initialize_workspace
-- Purpose: Master workspace initialization function.
--          Creates system roles, assigns permissions, and creates
--          default workspace settings row.
--          Call this AFTER inserting a new workspace row.
-- =============================================================================
CREATE OR REPLACE FUNCTION initialize_workspace(
    p_workspace_id UUID,
    p_owner_id     UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner_role_id UUID;
BEGIN
    -- Step 1: Create default system roles
    PERFORM create_workspace_roles(p_workspace_id);

    -- Step 2: Create default workspace settings
    INSERT INTO workspace_settings (workspace_id)
    VALUES (p_workspace_id)
    ON CONFLICT (workspace_id) DO NOTHING;

    -- Step 3: Add the workspace owner as the first member with 'owner' role
    SELECT id INTO v_owner_role_id
    FROM roles
    WHERE workspace_id = p_workspace_id AND name = 'owner';

    INSERT INTO workspace_members (
        workspace_id,
        user_id,
        role_id,
        status,
        joined_at
    )
    VALUES (
        p_workspace_id,
        p_owner_id,
        v_owner_role_id,
        'active',
        NOW()
    )
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

END;
$$;

COMMENT ON FUNCTION initialize_workspace IS
    'Master workspace init: creates system roles, permissions, settings, and adds owner as first member.';
