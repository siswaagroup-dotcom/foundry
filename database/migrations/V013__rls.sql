-- =============================================================================
-- MIGRATION V013 — ROW LEVEL SECURITY (RLS)
-- Enables PostgreSQL RLS policies for workspace isolation and RBAC.
-- Depends on: All previous migrations (V001–V012)
--
-- STRATEGY:
-- The application sets a session-level variable before every query:
--   SET LOCAL app.current_user_id    = 'uuid-of-authenticated-user';
--   SET LOCAL app.current_workspace_id = 'uuid-of-active-workspace';
--
-- RLS policies read these variables to enforce isolation.
-- All policies use USING (read filter) and WITH CHECK (write filter).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- These functions are used inside RLS policies for readability and reuse.
-- ---------------------------------------------------------------------------

-- Returns the current authenticated user's UUID from session variable
CREATE OR REPLACE FUNCTION current_app_user()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
$$;

-- Returns the active workspace UUID from session variable
CREATE OR REPLACE FUNCTION current_app_workspace()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_workspace_id', TRUE), '')::UUID
$$;

-- Returns TRUE if the current user is a member of the current workspace
CREATE OR REPLACE FUNCTION is_workspace_member()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = current_app_workspace()
          AND user_id      = current_app_user()
          AND status       = 'active'
    )
$$;

-- Returns TRUE if the current user has a specific permission in current workspace
CREATE OR REPLACE FUNCTION has_permission(p_module TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM workspace_members wm
        JOIN role_permissions  rp ON rp.role_id       = wm.role_id
        JOIN permissions       p  ON p.id             = rp.permission_id
        WHERE wm.user_id      = current_app_user()
          AND wm.workspace_id = current_app_workspace()
          AND wm.status       = 'active'
          AND p.module        = p_module
          AND p.action        = p_action
    )
$$;

-- Returns TRUE if the current user is the owner of the current workspace
CREATE OR REPLACE FUNCTION is_workspace_owner()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspaces
        WHERE id       = current_app_workspace()
          AND owner_id = current_app_user()
          AND deleted_at IS NULL
    )
$$;

-- Returns TRUE if the current user has the admin or owner role in current workspace
CREATE OR REPLACE FUNCTION is_workspace_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM workspace_members wm
        JOIN roles r ON r.id = wm.role_id
        WHERE wm.user_id      = current_app_user()
          AND wm.workspace_id = current_app_workspace()
          AND wm.status       = 'active'
          AND r.name          IN ('owner', 'admin')
    )
$$;

-- ---------------------------------------------------------------------------
-- ENABLE RLS ON ALL TENANT-SCOPED TABLES
-- ---------------------------------------------------------------------------
ALTER TABLE workspaces              ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_attachments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_campaigns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_media       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices                ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs           ENABLE ROW LEVEL SECURITY;

-- Reference tables — RLS not needed (system-level, read-only)
-- users, plans, permissions — accessible to all authenticated users

-- ---------------------------------------------------------------------------
-- RLS POLICIES — WORKSPACES
-- ---------------------------------------------------------------------------

-- A user can only see workspaces they are a member of (or own)
CREATE POLICY workspaces_select ON workspaces
    FOR SELECT
    USING (
        owner_id = current_app_user()
        OR EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = workspaces.id
              AND user_id = current_app_user()
              AND status = 'active'
        )
    );

-- Only authenticated users can create workspaces (owner_id must match themselves)
CREATE POLICY workspaces_insert ON workspaces
    FOR INSERT
    WITH CHECK (owner_id = current_app_user());

-- Only the owner or admin can update workspace settings
CREATE POLICY workspaces_update ON workspaces
    FOR UPDATE
    USING (
        id = current_app_workspace()
        AND (is_workspace_owner() OR is_workspace_admin())
    )
    WITH CHECK (
        id = current_app_workspace()
        AND (is_workspace_owner() OR is_workspace_admin())
    );

-- Only the owner can soft-delete a workspace
CREATE POLICY workspaces_delete ON workspaces
    FOR DELETE
    USING (
        id = current_app_workspace()
        AND is_workspace_owner()
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — WORKSPACE_MEMBERS
-- ---------------------------------------------------------------------------

-- Any active member can see other members in their workspace
CREATE POLICY workspace_members_select ON workspace_members
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_member()
    );

-- Only admins/owners can add members
CREATE POLICY workspace_members_insert ON workspace_members
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    );

-- Only admins/owners can update member roles/status
CREATE POLICY workspace_members_update ON workspace_members
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    );

-- Only admins/owners can remove members (or a member can remove themselves)
CREATE POLICY workspace_members_delete ON workspace_members
    FOR DELETE
    USING (
        workspace_id = current_app_workspace()
        AND (is_workspace_admin() OR user_id = current_app_user())
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — WORKSPACE_INVITATIONS
-- ---------------------------------------------------------------------------
CREATE POLICY workspace_invitations_select ON workspace_invitations
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    );

CREATE POLICY workspace_invitations_insert ON workspace_invitations
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    );

CREATE POLICY workspace_invitations_update ON workspace_invitations
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — ROLES
-- ---------------------------------------------------------------------------
CREATE POLICY roles_select ON roles
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_member()
    );

CREATE POLICY roles_insert ON roles
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    );

CREATE POLICY roles_update ON roles
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
        AND is_system = FALSE  -- system roles cannot be modified
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    );

CREATE POLICY roles_delete ON roles
    FOR DELETE
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_owner()
        AND is_system = FALSE
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — ROLE_PERMISSIONS
-- ---------------------------------------------------------------------------
CREATE POLICY role_permissions_select ON role_permissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM roles
            WHERE roles.id = role_permissions.role_id
              AND roles.workspace_id = current_app_workspace()
        )
        AND is_workspace_member()
    );

CREATE POLICY role_permissions_insert ON role_permissions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles
            WHERE roles.id = role_permissions.role_id
              AND roles.workspace_id = current_app_workspace()
        )
        AND is_workspace_admin()
    );

CREATE POLICY role_permissions_delete ON role_permissions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM roles
            WHERE roles.id = role_permissions.role_id
              AND roles.workspace_id = current_app_workspace()
        )
        AND is_workspace_admin()
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — TASKS (workspace isolation)
-- ---------------------------------------------------------------------------
CREATE POLICY tasks_select ON tasks
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_member()
        AND deleted_at IS NULL
    );

CREATE POLICY tasks_insert ON tasks
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('tasks', 'create')
    );

CREATE POLICY tasks_update ON tasks
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('tasks', 'edit')
        AND deleted_at IS NULL
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('tasks', 'edit')
    );

CREATE POLICY tasks_delete ON tasks
    FOR DELETE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('tasks', 'delete')
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — TASK CHILDREN (assignees, tags, comments)
-- ---------------------------------------------------------------------------
CREATE POLICY task_assignees_select ON task_assignees
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_assignees.task_id
              AND tasks.workspace_id = current_app_workspace()
        )
        AND is_workspace_member()
    );

CREATE POLICY task_assignees_insert ON task_assignees
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_assignees.task_id
              AND tasks.workspace_id = current_app_workspace()
        )
        AND has_permission('tasks', 'edit')
    );

CREATE POLICY task_assignees_delete ON task_assignees
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_assignees.task_id
              AND tasks.workspace_id = current_app_workspace()
        )
        AND has_permission('tasks', 'edit')
    );

CREATE POLICY task_tags_select ON task_tags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_tags.task_id
              AND tasks.workspace_id = current_app_workspace()
        )
        AND is_workspace_member()
    );

CREATE POLICY task_tags_insert ON task_tags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_tags.task_id
              AND tasks.workspace_id = current_app_workspace()
        )
        AND has_permission('tasks', 'edit')
    );

CREATE POLICY task_comments_select ON task_comments
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_member()
        AND deleted_at IS NULL
    );

CREATE POLICY task_comments_insert ON task_comments
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_member()
        AND author_id = current_app_user()
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — EXPENSES
-- ---------------------------------------------------------------------------
CREATE POLICY expenses_select ON expenses
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'view')
        AND deleted_at IS NULL
    );

CREATE POLICY expenses_insert ON expenses
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'create')
    );

CREATE POLICY expenses_update ON expenses
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'edit')
        AND deleted_at IS NULL
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'edit')
    );

CREATE POLICY expenses_delete ON expenses
    FOR DELETE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'delete')
    );

CREATE POLICY expense_approvals_select ON expense_approvals
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'view')
    );

CREATE POLICY expense_approvals_insert ON expense_approvals
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'approve')
    );

CREATE POLICY expense_attachments_select ON expense_attachments
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'view')
    );

CREATE POLICY expense_attachments_insert ON expense_attachments
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('expenses', 'edit')
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — CLIENTS
-- ---------------------------------------------------------------------------
CREATE POLICY clients_select ON clients
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('clients', 'view')
        AND deleted_at IS NULL
    );

CREATE POLICY clients_insert ON clients
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('clients', 'create')
    );

CREATE POLICY clients_update ON clients
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('clients', 'edit')
        AND deleted_at IS NULL
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('clients', 'edit')
    );

CREATE POLICY clients_delete ON clients
    FOR DELETE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('clients', 'delete')
    );

CREATE POLICY client_contacts_select ON client_contacts
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('clients', 'view')
    );

CREATE POLICY client_contacts_insert ON client_contacts
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('clients', 'edit')
    );

CREATE POLICY client_tags_select ON client_tags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_tags.client_id
              AND clients.workspace_id = current_app_workspace()
        )
        AND has_permission('clients', 'view')
    );

CREATE POLICY client_tags_insert ON client_tags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_tags.client_id
              AND clients.workspace_id = current_app_workspace()
        )
        AND has_permission('clients', 'edit')
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — SOCIAL
-- ---------------------------------------------------------------------------
CREATE POLICY social_accounts_select ON social_accounts
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'view')
    );

CREATE POLICY social_accounts_insert ON social_accounts
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'create')
    );

CREATE POLICY social_accounts_update ON social_accounts
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'edit')
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'edit')
    );

CREATE POLICY social_campaigns_select ON social_campaigns
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'view')
        AND deleted_at IS NULL
    );

CREATE POLICY social_campaigns_insert ON social_campaigns
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'create')
    );

CREATE POLICY social_posts_select ON social_posts
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'view')
        AND deleted_at IS NULL
    );

CREATE POLICY social_posts_insert ON social_posts
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'create')
    );

CREATE POLICY social_posts_update ON social_posts
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'edit')
        AND deleted_at IS NULL
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'edit')
    );

CREATE POLICY social_posts_delete ON social_posts
    FOR DELETE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'delete')
    );

CREATE POLICY social_post_media_select ON social_post_media
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'view')
    );

CREATE POLICY social_post_media_insert ON social_post_media
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('social', 'edit')
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — NOTIFICATIONS (user-scoped within workspace)
-- ---------------------------------------------------------------------------
CREATE POLICY notifications_select ON notifications
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND user_id = current_app_user()  -- users can only see their own notifications
        AND deleted_at IS NULL
    );

-- Only the system/application inserts notifications (not direct user action)
CREATE POLICY notifications_insert ON notifications
    FOR INSERT
    WITH CHECK (workspace_id = current_app_workspace());

-- Users can mark their own notifications as read
CREATE POLICY notifications_update ON notifications
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND user_id = current_app_user()
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND user_id = current_app_user()
    );

-- Users can dismiss (soft-delete) their own notifications
CREATE POLICY notifications_delete ON notifications
    FOR DELETE
    USING (
        workspace_id = current_app_workspace()
        AND user_id = current_app_user()
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — SAVED_REPORTS
-- ---------------------------------------------------------------------------
CREATE POLICY saved_reports_select ON saved_reports
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('reports', 'view')
        AND deleted_at IS NULL
    );

CREATE POLICY saved_reports_insert ON saved_reports
    FOR INSERT
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('reports', 'create')
    );

CREATE POLICY saved_reports_update ON saved_reports
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND has_permission('reports', 'edit')
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND has_permission('reports', 'edit')
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — WORKSPACE_SETTINGS
-- ---------------------------------------------------------------------------
CREATE POLICY workspace_settings_select ON workspace_settings
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_member()
    );

CREATE POLICY workspace_settings_update ON workspace_settings
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_admin()
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — SUBSCRIPTIONS AND INVOICES (owner/admin only)
-- ---------------------------------------------------------------------------
CREATE POLICY subscriptions_select ON subscriptions
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND (is_workspace_owner() OR is_workspace_admin())
    );

CREATE POLICY subscriptions_update ON subscriptions
    FOR UPDATE
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_owner()
    )
    WITH CHECK (
        workspace_id = current_app_workspace()
        AND is_workspace_owner()
    );

CREATE POLICY invoices_select ON invoices
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND (is_workspace_owner() OR has_permission('billing', 'view'))
    );

-- ---------------------------------------------------------------------------
-- RLS POLICIES — ACTIVITY_LOGS
-- ---------------------------------------------------------------------------
CREATE POLICY activity_logs_select ON activity_logs
    FOR SELECT
    USING (
        workspace_id = current_app_workspace()
        AND is_workspace_member()
    );

-- Only the application (system) inserts audit logs — no direct user insert
CREATE POLICY activity_logs_insert ON activity_logs
    FOR INSERT
    WITH CHECK (workspace_id = current_app_workspace());

-- NO UPDATE OR DELETE POLICIES — activity_logs is append-only (immutable)
