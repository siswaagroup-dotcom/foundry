-- =============================================================================
-- MIGRATION V001 — IDENTITY
-- Tables: users, user_sessions, password_reset_tokens, oauth_accounts
-- PostgreSQL 16+
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------------------------------------------------------------------------
-- TABLE: users
-- Purpose: Core identity entity. Every person using Foundry.
--          Exists independently of any workspace.
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    name                VARCHAR(255)    NOT NULL,
    email               VARCHAR(320)    NOT NULL,
    password_hash       TEXT            NULL,           -- NULL for OAuth-only users
    avatar_url          TEXT            NULL,
    email_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    email_verified_at   TIMESTAMPTZ     NULL,
    last_login_at       TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,           -- soft delete

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Indexes
CREATE INDEX idx_users_email
    ON users (email);

CREATE INDEX idx_users_deleted_at
    ON users (deleted_at)
    WHERE deleted_at IS NULL;

-- Active users only (partial index — most queries exclude deleted users)
CREATE INDEX idx_users_active
    ON users (id, email)
    WHERE deleted_at IS NULL;

COMMENT ON TABLE  users                 IS 'Core identity entity for all Foundry platform users.';
COMMENT ON COLUMN users.password_hash   IS 'bcrypt/argon2 hash. NULL for OAuth-only accounts.';
COMMENT ON COLUMN users.deleted_at      IS 'Soft delete timestamp. NULL means active.';

-- ---------------------------------------------------------------------------
-- TABLE: user_sessions
-- Purpose: Active login sessions. Supports multi-device login and revocation.
-- ---------------------------------------------------------------------------
CREATE TABLE user_sessions (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    token_hash  TEXT        NOT NULL,           -- SHA-256 of the session token
    ip_address  INET        NULL,
    user_agent  TEXT        NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at  TIMESTAMPTZ NULL,               -- NULL = session is active

    CONSTRAINT pk_user_sessions PRIMARY KEY (id),
    CONSTRAINT uq_user_sessions_token UNIQUE (token_hash),
    CONSTRAINT fk_user_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX idx_user_sessions_token_hash
    ON user_sessions (token_hash);

CREATE INDEX idx_user_sessions_user_id
    ON user_sessions (user_id);

CREATE INDEX idx_user_sessions_expires_at
    ON user_sessions (expires_at);

-- Active sessions only
CREATE INDEX idx_user_sessions_active
    ON user_sessions (user_id, expires_at)
    WHERE revoked_at IS NULL;

COMMENT ON TABLE  user_sessions             IS 'Active login sessions per user. Supports multi-device and revocation.';
COMMENT ON COLUMN user_sessions.token_hash  IS 'SHA-256 of the bearer token. Never store raw tokens.';
COMMENT ON COLUMN user_sessions.revoked_at  IS 'NULL = active session. Set to NOW() on logout or forced revocation.';

-- ---------------------------------------------------------------------------
-- TABLE: password_reset_tokens
-- Purpose: Short-lived single-use tokens for the forgot-password flow.
-- ---------------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    token_hash  TEXT        NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ NULL,               -- NULL = not yet used
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uq_password_reset_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX idx_password_reset_tokens_hash
    ON password_reset_tokens (token_hash);

-- Find active (unused, unexpired) token for a user
CREATE INDEX idx_password_reset_tokens_user_active
    ON password_reset_tokens (user_id, expires_at)
    WHERE used_at IS NULL;

COMMENT ON TABLE  password_reset_tokens          IS 'Single-use, time-limited tokens for the forgot-password flow.';
COMMENT ON COLUMN password_reset_tokens.used_at  IS 'NULL = token not yet used. Set on successful password reset.';

-- ---------------------------------------------------------------------------
-- TABLE: oauth_accounts
-- Purpose: Links OAuth provider identities (Google, Facebook) to a user.
--          A user can link multiple providers.
-- ---------------------------------------------------------------------------
CREATE TABLE oauth_accounts (
    id                          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id                     UUID        NOT NULL,
    provider                    VARCHAR(50) NOT NULL,   -- google, facebook
    provider_user_id            VARCHAR(255) NOT NULL,  -- ID from OAuth provider
    access_token_encrypted      TEXT        NULL,       -- encrypted at app level
    refresh_token_encrypted     TEXT        NULL,       -- encrypted at app level
    token_expires_at            TIMESTAMPTZ NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_oauth_accounts PRIMARY KEY (id),
    CONSTRAINT uq_oauth_accounts_provider UNIQUE (provider, provider_user_id),
    CONSTRAINT fk_oauth_accounts_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_oauth_accounts_provider
        CHECK (provider IN ('google', 'facebook', 'github', 'microsoft'))
);

-- Indexes
CREATE INDEX idx_oauth_accounts_user_id
    ON oauth_accounts (user_id);

CREATE INDEX idx_oauth_accounts_provider_lookup
    ON oauth_accounts (provider, provider_user_id);

COMMENT ON TABLE  oauth_accounts                         IS 'OAuth provider links per user. Supports Google, Facebook sign-in.';
COMMENT ON COLUMN oauth_accounts.provider_user_id        IS 'The user ID as returned by the OAuth provider.';
COMMENT ON COLUMN oauth_accounts.access_token_encrypted  IS 'Access token encrypted at application level before storage.';
