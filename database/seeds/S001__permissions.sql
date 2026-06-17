-- =============================================================================
-- SEED S001 — PERMISSIONS
-- Inserts all 37 valid (module, action) pairs into the permissions table.
-- This is system-level reference data — seeded once, never changes
-- without a migration.
--
-- Modules: dashboard, tasks, expenses, clients, social, team, reports,
--          settings, billing
-- Actions: view, create, edit, delete, approve
-- =============================================================================

INSERT INTO permissions (id, module, action, description) VALUES

-- DASHBOARD (view only — no mutation actions on the dashboard itself)
(gen_random_uuid(), 'dashboard', 'view',    'View the main dashboard and analytics'),

-- TASKS (5 permissions)
(gen_random_uuid(), 'tasks', 'view',    'View tasks and Kanban board'),
(gen_random_uuid(), 'tasks', 'create',  'Create new tasks'),
(gen_random_uuid(), 'tasks', 'edit',    'Edit tasks, move columns, change status'),
(gen_random_uuid(), 'tasks', 'delete',  'Delete tasks'),
(gen_random_uuid(), 'tasks', 'approve', 'Approve tasks in review stage'),

-- EXPENSES (5 permissions)
(gen_random_uuid(), 'expenses', 'view',    'View expenses list and details'),
(gen_random_uuid(), 'expenses', 'create',  'Create new expense records'),
(gen_random_uuid(), 'expenses', 'edit',    'Edit expense details and amounts'),
(gen_random_uuid(), 'expenses', 'delete',  'Delete expense records'),
(gen_random_uuid(), 'expenses', 'approve', 'Approve or reject expense submissions'),

-- CLIENTS (5 permissions)
(gen_random_uuid(), 'clients', 'view',    'View clients list and profiles'),
(gen_random_uuid(), 'clients', 'create',  'Add new clients'),
(gen_random_uuid(), 'clients', 'edit',    'Edit client details and contacts'),
(gen_random_uuid(), 'clients', 'delete',  'Remove clients'),
(gen_random_uuid(), 'clients', 'approve', 'Approve client tier changes'),

-- SOCIAL (5 permissions)
(gen_random_uuid(), 'social', 'view',    'View social posts, calendar, and connected accounts'),
(gen_random_uuid(), 'social', 'create',  'Create and draft social posts'),
(gen_random_uuid(), 'social', 'edit',    'Edit posts, captions, and schedule'),
(gen_random_uuid(), 'social', 'delete',  'Delete social posts'),
(gen_random_uuid(), 'social', 'approve', 'Approve posts before publishing'),

-- TEAM (5 permissions)
(gen_random_uuid(), 'team', 'view',    'View team members and roles'),
(gen_random_uuid(), 'team', 'create',  'Invite new members to the workspace'),
(gen_random_uuid(), 'team', 'edit',    'Edit member details and role assignments'),
(gen_random_uuid(), 'team', 'delete',  'Remove members from the workspace'),
(gen_random_uuid(), 'team', 'approve', 'Approve role change requests'),

-- REPORTS (5 permissions)
(gen_random_uuid(), 'reports', 'view',    'View and run saved reports'),
(gen_random_uuid(), 'reports', 'create',  'Create and save report configurations'),
(gen_random_uuid(), 'reports', 'edit',    'Edit saved report configurations'),
(gen_random_uuid(), 'reports', 'delete',  'Delete saved reports'),
(gen_random_uuid(), 'reports', 'approve', 'Publish/approve reports for sharing'),

-- SETTINGS (3 permissions — no create/approve on settings)
(gen_random_uuid(), 'settings', 'view',    'View workspace and approval settings'),
(gen_random_uuid(), 'settings', 'edit',    'Edit workspace settings and approval rules'),
(gen_random_uuid(), 'settings', 'delete',  'Reset or remove settings configurations'),

-- BILLING (3 permissions — no create/approve for billing)
(gen_random_uuid(), 'billing', 'view',    'View current plan, invoices, and subscription details'),
(gen_random_uuid(), 'billing', 'edit',    'Upgrade, downgrade, or cancel subscription'),
(gen_random_uuid(), 'billing', 'delete',  'Cancel subscription and remove payment methods');

-- Verify count: should be 37 rows
-- SELECT COUNT(*) FROM permissions;  -- expected: 37
-- SELECT module, COUNT(*) FROM permissions GROUP BY module ORDER BY module;
