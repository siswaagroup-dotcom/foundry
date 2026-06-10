-- =============================================================================
-- MIGRATION V011 — BILLING
-- Tables: plans, subscriptions, invoices
-- Also adds workspaces.plan_id FK (deferred from V002)
-- Depends on: V002 (workspaces)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: plans
-- Purpose: Reference/seed table describing available SaaS pricing tiers.
--          Not workspace-scoped — shared across all tenants.
--          Seeded in S003__plans.sql.
-- ---------------------------------------------------------------------------
CREATE TABLE plans (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(50)     NOT NULL,
    display_name    VARCHAR(100)    NOT NULL,
    price_monthly   NUMERIC(10,2)   NOT NULL DEFAULT 0,
    price_yearly    NUMERIC(10,2)   NOT NULL DEFAULT 0,
    max_members     INTEGER         NULL,           -- NULL = unlimited
    max_workspaces  INTEGER         NULL,           -- NULL = unlimited
    features        JSONB           NOT NULL DEFAULT '{}',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order      SMALLINT        NOT NULL DEFAULT 0,

    CONSTRAINT pk_plans PRIMARY KEY (id),
    CONSTRAINT uq_plans_name UNIQUE (name),
    CONSTRAINT chk_plans_name
        CHECK (name IN ('starter', 'pro', 'business', 'enterprise')),
    CONSTRAINT chk_plans_price_monthly
        CHECK (price_monthly >= 0),
    CONSTRAINT chk_plans_price_yearly
        CHECK (price_yearly >= 0),
    CONSTRAINT chk_plans_max_members
        CHECK (max_members IS NULL OR max_members > 0),
    CONSTRAINT chk_plans_max_workspaces
        CHECK (max_workspaces IS NULL OR max_workspaces > 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_plans_name
    ON plans (name);

CREATE INDEX idx_plans_active_ordered
    ON plans (is_active, sort_order ASC)
    WHERE is_active = TRUE;

-- GIN index for feature flag queries
CREATE INDEX idx_plans_features_gin
    ON plans USING gin (features);

COMMENT ON TABLE  plans          IS 'SaaS pricing tiers. System-level reference data. Seeded once.';
COMMENT ON COLUMN plans.features IS 'JSONB feature flags. Keys match feature names in the application.';
COMMENT ON COLUMN plans.name     IS 'Immutable slug: starter | pro | business | enterprise.';

-- ---------------------------------------------------------------------------
-- TABLE: subscriptions
-- Purpose: Active subscription for each workspace.
--          One-to-One with workspaces (enforced by UNIQUE on workspace_id).
--          Full Stripe lifecycle state machine.
-- ---------------------------------------------------------------------------
CREATE TABLE subscriptions (
    id                      UUID        NOT NULL DEFAULT gen_random_uuid(),
    workspace_id            UUID        NOT NULL,
    plan_id                 UUID        NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'trialing',
    billing_cycle           VARCHAR(10) NOT NULL DEFAULT 'monthly',
    current_period_start    TIMESTAMPTZ NOT NULL,
    current_period_end      TIMESTAMPTZ NOT NULL,
    trial_ends_at           TIMESTAMPTZ NULL,
    cancelled_at            TIMESTAMPTZ NULL,
    stripe_subscription_id  VARCHAR(255) NULL,
    stripe_customer_id      VARCHAR(255) NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_subscriptions PRIMARY KEY (id),
    CONSTRAINT uq_subscriptions_workspace UNIQUE (workspace_id),   -- 1:1 with workspaces
    CONSTRAINT uq_subscriptions_stripe_id UNIQUE (stripe_subscription_id),
    CONSTRAINT fk_subscriptions_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_subscriptions_plan
        FOREIGN KEY (plan_id)
        REFERENCES plans (id)
        ON DELETE RESTRICT   -- cannot delete a plan with active subscriptions
        ON UPDATE CASCADE,
    CONSTRAINT chk_subscriptions_status
        CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused')),
    CONSTRAINT chk_subscriptions_billing_cycle
        CHECK (billing_cycle IN ('monthly', 'yearly')),
    CONSTRAINT chk_subscriptions_period
        CHECK (current_period_end > current_period_start)
);

-- Indexes
CREATE UNIQUE INDEX idx_subscriptions_workspace
    ON subscriptions (workspace_id);

CREATE UNIQUE INDEX idx_subscriptions_stripe_id
    ON subscriptions (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

-- Dunning job: find past_due subscriptions approaching period end
CREATE INDEX idx_subscriptions_dunning
    ON subscriptions (status, current_period_end)
    WHERE status IN ('past_due', 'trialing');

COMMENT ON TABLE  subscriptions                     IS '1:1 active subscription per workspace. Full Stripe lifecycle supported.';
COMMENT ON COLUMN subscriptions.stripe_customer_id  IS 'Stripe customer ID. Stored for webhook matching and portal access.';

-- ---------------------------------------------------------------------------
-- TABLE: invoices
-- Purpose: Invoice records per billing cycle. Synced from Stripe webhooks.
--          Immutable payment history.
-- ---------------------------------------------------------------------------
CREATE TABLE invoices (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    workspace_id        UUID        NOT NULL,
    subscription_id     UUID        NOT NULL,
    stripe_invoice_id   VARCHAR(255) NULL,
    amount              NUMERIC(10,2) NOT NULL,
    currency            CHAR(3)     NOT NULL DEFAULT 'USD',
    status              VARCHAR(20) NOT NULL,
    invoice_date        DATE        NOT NULL,
    due_date            DATE        NULL,
    paid_at             TIMESTAMPTZ NULL,
    invoice_url         TEXT        NULL,   -- Stripe hosted invoice PDF URL
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_invoices PRIMARY KEY (id),
    CONSTRAINT uq_invoices_stripe_id UNIQUE (stripe_invoice_id),
    CONSTRAINT fk_invoices_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_subscription
        FOREIGN KEY (subscription_id)
        REFERENCES subscriptions (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_invoices_status
        CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    CONSTRAINT chk_invoices_currency
        CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_invoices_amount
        CHECK (amount >= 0)
);

-- Indexes
-- Billing page: invoice history sorted by date
CREATE INDEX idx_invoices_workspace_date
    ON invoices (workspace_id, invoice_date DESC);

CREATE INDEX idx_invoices_subscription
    ON invoices (subscription_id);

CREATE UNIQUE INDEX idx_invoices_stripe_id
    ON invoices (stripe_invoice_id)
    WHERE stripe_invoice_id IS NOT NULL;

COMMENT ON TABLE invoices IS 'Immutable invoice history per workspace. Synced from Stripe webhooks.';

-- ---------------------------------------------------------------------------
-- ADD DEFERRED FK CONSTRAINT: workspaces.plan_id → plans.id
-- Could not be added in V002 because plans table did not exist yet.
-- ---------------------------------------------------------------------------
ALTER TABLE workspaces
    ADD CONSTRAINT fk_workspaces_plan
        FOREIGN KEY (plan_id)
        REFERENCES plans (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;

CREATE INDEX idx_workspaces_plan_id
    ON workspaces (plan_id);
