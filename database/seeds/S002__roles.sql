-- =============================================================================
-- SEED S002 — DEFAULT ROLE TEMPLATES
-- =============================================================================
-- These are TEMPLATE roles used as reference data.
-- They are NOT inserted directly into the roles table at this stage.
-- When a new workspace is created, the application automatically creates
-- these 5 system roles for that workspace by calling a workspace_init function.
--
-- This seed file creates a helper function: create_workspace_roles(workspace_uuid)
-- which is called during workspace creation.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- FUNCTION: create_workspace_roles
-- Purpose: Seeds 5 default system roles for a newly created workspace.
--          Called by the application after inserting a new workspace row.
-- Returns: void
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_workspace_roles(p_workspace_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO roles (id, workspace_id, name, description, is_system)
    VALUES
        (
            gen_random_uuid(),
            p_workspace_id,
            'owner',
            'Full access to all modules. Cannot be deleted. Assigned to workspace creator.',
            TRUE
        ),
        (
            gen_random_uuid(),
            p_workspace_id,
            'admin',
            'Full access to all modules except ownership transfer. Can manage team and settings.',
            TRUE
        ),
        (
            gen_random_uuid(),
            p_workspace_id,
            'manager',
            'Can create, edit, and approve in their modules. Cannot delete or configure roles.',
            TRUE
        ),
        (
            gen_random_uuid(),
            p_workspace_id,
            'member',
            'Can create and edit in assigned modules. View-only elsewhere.',
            TRUE
        ),
        (
            gen_random_uuid(),
            p_workspace_id,
            'viewer',
            'View-only access across all modules. Cannot create or modify any data.',
            TRUE
        );

    -- After creating roles, assign permissions for this workspace
    PERFORM assign_default_role_permissions(p_workspace_id);
END;
$$;

COMMENT ON FUNCTION create_workspace_roles IS
    'Seeds 5 default system roles for a new workspace. Called on workspace creation.';
