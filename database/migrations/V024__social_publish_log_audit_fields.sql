-- =============================================================================
-- MIGRATION V024 - SOCIAL PUBLISH LOG AUDIT FIELDS
-- Stores provider request/response audit details for real publish attempts.
-- =============================================================================

ALTER TABLE social_publish_logs
  ADD COLUMN IF NOT EXISTS request_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS http_status INTEGER NULL,
  ADD COLUMN IF NOT EXISTS duration_ms INTEGER NULL;

