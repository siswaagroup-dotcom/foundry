# Foundry — Database Deployment Guide

## Requirements
- PostgreSQL 16+
- psql client or a migration tool (Flyway, golang-migrate, or raw psql)

---

## COMPLETE DEPLOYMENT ORDER

Run in EXACTLY this sequence. Each step depends on the previous.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — FOUNDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step  1:  migrations/V000__init.sql
          └── Extensions, schema_migrations table

Step  2:  migrations/V001__identity.sql
          └── users, user_sessions, password_reset_tokens, oauth_accounts

Step  3:  migrations/V002__workspace.sql
          └── workspaces, workspace_members, workspace_invitations
          └── Note: role_id FKs on members/invitations added in V003

Step  4:  migrations/V003__rbac.sql
          └── roles, permissions, role_permissions
          └── Adds deferred FKs: workspace_members.role_id, workspace_invitations.role_id

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — BUSINESS MODULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step  5:  migrations/V004__tasks.sql
          └── tasks, task_assignees, task_tags, task_comments
          └── Note: tasks.client_id FK added in V006

Step  6:  migrations/V005__expenses.sql
          └── expenses, expense_approvals, expense_attachments
          └── Note: expenses.client_id FK added in V006

Step  7:  migrations/V006__clients.sql
          └── clients, client_contacts, client_tags
          └── Adds deferred FKs: tasks.client_id, expenses.client_id

Step  8:  migrations/V007__social.sql
          └── social_accounts, social_campaigns, social_posts, social_post_media

Step  9:  migrations/V008__notifications.sql
          └── notifications

Step 10:  migrations/V009__reports.sql
          └── saved_reports

Step 11:  migrations/V010__settings.sql
          └── workspace_settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — BILLING + AUDIT + SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 12:  migrations/V011__billing.sql
          └── plans, subscriptions, invoices
          └── Adds deferred FK: workspaces.plan_id

Step 13:  migrations/V012__audit.sql
          └── activity_logs (partitioned by month)
          └── Partitions: 2026-01 through 2026-12 + default

Step 14:  migrations/V013__rls.sql
          └── RLS helper functions
          └── ENABLE ROW LEVEL SECURITY on all 25 tenant-scoped tables
          └── All SELECT / INSERT / UPDATE / DELETE policies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — SEED DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 15:  seeds/S001__permissions.sql
          └── 37 (module, action) permission rows

Step 16:  seeds/S002__roles.sql
          └── create_workspace_roles() function

Step 17:  seeds/S003__plans.sql
          └── 4 plan rows: Starter, Pro, Business, Enterprise

Step 18:  seeds/S004__role_permissions.sql
          └── assign_default_role_permissions() function
          └── initialize_workspace() master init function
```

---

## APPLICATION DEPLOYMENT ORDER (after database is ready)

```
1. DATABASE READY
   └── All 18 steps above completed
   └── RLS active, seed data in place

2. AUTH LAYER
   └── Connect app to PostgreSQL with two roles:
       ├── foundry_app  (application queries — RLS enforced)
       └── foundry_admin (migrations only — BYPASSRLS)
   └── Deploy auth endpoints:
       ├── POST /api/auth/signup
       ├── POST /api/auth/signin
       ├── POST /api/auth/signout
       ├── POST /api/auth/forgot-password
       └── POST /api/auth/reset-password

3. WORKSPACE LAYER
   └── Deploy workspace endpoints:
       ├── POST /api/workspaces          (calls initialize_workspace() after INSERT)
       ├── GET  /api/workspaces/:id
       └── PUT  /api/workspaces/:id

4. TEAM LAYER
   └── Deploy team endpoints:
       ├── GET  /api/workspaces/:wid/members
       ├── POST /api/workspaces/:wid/invitations
       └── PUT  /api/workspaces/:wid/roles/:id/permissions

5. BUSINESS MODULES
   └── Deploy in this order (each depends on clients existing):
       ├── Tasks API
       ├── Expenses API
       ├── Clients API
       ├── Social API
       ├── Notifications API
       ├── Reports API
       └── Settings API

6. BILLING LAYER
   └── Connect Stripe webhooks
   └── Deploy billing endpoints

7. AUDIT LAYER (automatic — runs via DB triggers or app middleware)
   └── Insert into activity_logs on every write operation
```

---

## DATABASE ROLES (PostgreSQL roles, not application roles)

```sql
-- Application role — used by the app server (RLS enforced)
CREATE ROLE foundry_app LOGIN PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE foundry TO foundry_app;
GRANT USAGE ON SCHEMA public TO foundry_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO foundry_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO foundry_app;

-- Admin role — used only for migrations (bypasses RLS)
CREATE ROLE foundry_admin LOGIN PASSWORD 'strong_admin_password_here';
GRANT ALL PRIVILEGES ON DATABASE foundry TO foundry_admin;
ALTER ROLE foundry_admin BYPASSRLS;

-- Read-only role — for reporting/analytics on read replica
CREATE ROLE foundry_readonly LOGIN PASSWORD 'strong_readonly_password_here';
GRANT CONNECT ON DATABASE foundry TO foundry_readonly;
GRANT USAGE ON SCHEMA public TO foundry_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO foundry_readonly;
```

---

## SESSION SETUP (required before every application query)

The application must set these session variables before executing any query:

```sql
-- Set at the start of each request handler:
SET LOCAL app.current_user_id      = 'uuid-of-authenticated-user';
SET LOCAL app.current_workspace_id = 'uuid-of-active-workspace';
```

This is what RLS policies read to enforce isolation. Wrap in a transaction:

```sql
BEGIN;
SET LOCAL app.current_user_id      = '<user_uuid>';
SET LOCAL app.current_workspace_id = '<workspace_uuid>';
-- ... your queries ...
COMMIT;
```

---

## ADDING A NEW MONTHLY PARTITION (run first day of each month)

```sql
-- Example: Create January 2027 partition
CREATE TABLE activity_logs_2027_01
    PARTITION OF activity_logs
    FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');
```

Automate this with a scheduled PostgreSQL cron job (pg_cron extension).

---

## VERIFICATION QUERIES

After deployment, run these to confirm everything is in place:

```sql
-- Check all 32 tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check permission count (should be 37)
SELECT COUNT(*) FROM permissions;

-- Check plan count (should be 4)
SELECT name, price_monthly, max_members FROM plans ORDER BY sort_order;

-- Check RLS is enabled on all tenant tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = TRUE
ORDER BY tablename;

-- Check all helper functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```
