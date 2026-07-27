-- =============================================================================
-- MIGRATION V019 — INTEGRATION CREDENTIALS
-- Table: workspace_settings
-- Purpose: Stores per-integration API key credentials as encrypted JSONB.
--          Uses a single JSONB column so new integrations can be added without
--          schema migrations. Values should be encrypted at the application
--          layer before storage.
-- Depends on: V018 (settings_dynamic adds integration_*_connected columns)
-- =============================================================================

ALTER TABLE workspace_settings
  ADD COLUMN IF NOT EXISTS integration_credentials JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN workspace_settings.integration_credentials
  IS 'Per-integration credential storage. Keys are integration IDs (resend, openai, github). Values are objects with apiKey and other provider-specific fields.';
