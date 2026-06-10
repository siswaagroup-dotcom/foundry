-- =============================================================================
-- MIGRATION V000 — DATABASE INITIALIZATION
-- Run this FIRST before all other migrations.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- REQUIRED EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid(), pgp_sym_encrypt
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram indexes for full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gist";   -- GiST indexes (range exclusion constraints)

-- ---------------------------------------------------------------------------
-- DATABASE CONFIGURATION
-- ---------------------------------------------------------------------------

-- Set migration session timezone to UTC (all TIMESTAMPTZ values are normalized)
SET TIME ZONE 'UTC';

-- Enable UUID generation without extension prefix
-- (pgcrypto provides gen_random_uuid() — no need for uuid-ossp)

-- ---------------------------------------------------------------------------
-- SCHEMA VERSION TRACKING TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
    version         VARCHAR(20)     NOT NULL,
    description     TEXT            NOT NULL,
    applied_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_schema_migrations PRIMARY KEY (version)
);

-- Record this migration
INSERT INTO schema_migrations (version, description)
VALUES ('V000', 'Database initialization — extensions and schema tracking');

COMMENT ON TABLE schema_migrations IS 'Tracks applied migration versions. Managed by migration runner.';
