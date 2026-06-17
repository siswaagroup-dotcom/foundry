# Foundry — PostgreSQL Database

## Structure

```
database/
├── migrations/
│   ├── V001__identity.sql          ← users, sessions, tokens, oauth
│   ├── V002__workspace.sql         ← workspaces, members, invitations
│   ├── V003__rbac.sql              ← roles, permissions, role_permissions
│   ├── V004__tasks.sql             ← tasks, assignees, tags, comments
│   ├── V005__expenses.sql          ← expenses, approvals, attachments
│   ├── V006__clients.sql           ← clients, contacts, tags
│   ├── V007__social.sql            ← accounts, campaigns, posts, media
│   ├── V008__notifications.sql     ← notifications
│   ├── V009__reports.sql           ← saved_reports
│   ├── V010__settings.sql          ← workspace_settings
│   ├── V011__billing.sql           ← plans, subscriptions, invoices
│   ├── V012__audit.sql             ← activity_logs
│   └── V013__rls.sql               ← Row Level Security policies
├── seeds/
│   ├── S001__permissions.sql       ← All 37 permission rows
│   ├── S002__roles.sql             ← Default 5 system roles (template)
│   ├── S003__plans.sql             ← Starter, Pro, Business, Enterprise
│   └── S004__role_permissions.sql  ← Default role→permission mappings
└── README.md
```

## Deployment Order

1. Run migrations V001 → V013 in sequence
2. Run seeds S001 → S004 in sequence
3. Verify RLS policies are active
4. Connect application

## Requirements

- PostgreSQL 16+
- Extension: pgcrypto (for gen_random_uuid())

## Enable Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for future full-text search
```
