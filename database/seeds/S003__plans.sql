-- =============================================================================
-- SEED S003 — PLANS
-- Inserts the 4 SaaS pricing tiers: Starter, Pro, Business, Enterprise.
-- =============================================================================

INSERT INTO plans (id, name, display_name, price_monthly, price_yearly, max_members, max_workspaces, features, is_active, sort_order)
VALUES

-- STARTER — Free tier for solo users and small teams
(
    gen_random_uuid(),
    'starter',
    'Starter',
    0.00,
    0.00,
    3,                   -- max 3 members
    1,                   -- max 1 workspace
    '{
        "tasks":            true,
        "expenses":         true,
        "clients":          true,
        "social":           false,
        "team":             true,
        "reports":          false,
        "billing":          true,
        "settings":         true,
        "advanced_rbac":    false,
        "audit_logs":       false,
        "api_access":       false,
        "custom_roles":     false,
        "social_accounts":  0,
        "storage_gb":       1
    }'::jsonb,
    TRUE,
    1
),

-- PRO — For growing teams
(
    gen_random_uuid(),
    'pro',
    'Pro',
    29.00,
    290.00,             -- ~2 months free on yearly
    15,                 -- max 15 members
    3,                  -- max 3 workspaces
    '{
        "tasks":            true,
        "expenses":         true,
        "clients":          true,
        "social":           true,
        "team":             true,
        "reports":          true,
        "billing":          true,
        "settings":         true,
        "advanced_rbac":    false,
        "audit_logs":       false,
        "api_access":       false,
        "custom_roles":     true,
        "social_accounts":  4,
        "storage_gb":       10
    }'::jsonb,
    TRUE,
    2
),

-- BUSINESS — For established companies
(
    gen_random_uuid(),
    'business',
    'Business',
    79.00,
    790.00,
    100,                -- max 100 members
    10,                 -- max 10 workspaces
    '{
        "tasks":            true,
        "expenses":         true,
        "clients":          true,
        "social":           true,
        "team":             true,
        "reports":          true,
        "billing":          true,
        "settings":         true,
        "advanced_rbac":    true,
        "audit_logs":       true,
        "api_access":       true,
        "custom_roles":     true,
        "social_accounts":  10,
        "storage_gb":       100
    }'::jsonb,
    TRUE,
    3
),

-- ENTERPRISE — Unlimited, white-glove support
(
    gen_random_uuid(),
    'enterprise',
    'Enterprise',
    299.00,
    2990.00,
    NULL,               -- unlimited members
    NULL,               -- unlimited workspaces
    '{
        "tasks":            true,
        "expenses":         true,
        "clients":          true,
        "social":           true,
        "team":             true,
        "reports":          true,
        "billing":          true,
        "settings":         true,
        "advanced_rbac":    true,
        "audit_logs":       true,
        "api_access":       true,
        "custom_roles":     true,
        "social_accounts":  null,
        "storage_gb":       null,
        "sso":              true,
        "sla":              true,
        "dedicated_support": true,
        "custom_contract":  true
    }'::jsonb,
    TRUE,
    4
);

-- Verify
-- SELECT name, display_name, price_monthly, max_members FROM plans ORDER BY sort_order;
