-- =============================================================================
-- MIGRATION V021 - SOCIAL CONNECTION WORKFLOW
-- Adds explicit integration fields required by the Connected Accounts workflow.
-- Secrets remain encrypted; plaintext secret columns are intentionally not used.
-- =============================================================================

ALTER TABLE social_integrations
  ADD COLUMN IF NOT EXISTS connection_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS client_id VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS client_secret_encrypted TEXT NULL,
  ADD COLUMN IF NOT EXISTS api_key VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS api_secret_encrypted TEXT NULL,
  ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT NULL,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT NULL,
  ADD COLUMN IF NOT EXISTS page_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS channel_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS organization_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS account_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS permissions TEXT[] NOT NULL DEFAULT '{}';

UPDATE social_integrations
SET connection_name = COALESCE(connection_name, display_name),
    account_name = COALESCE(account_name, display_name)
WHERE connection_name IS NULL OR account_name IS NULL;

ALTER TABLE social_integrations ALTER COLUMN connection_name SET NOT NULL;

ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS chk_social_posts_status;
ALTER TABLE social_posts ADD CONSTRAINT chk_social_posts_status
  CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived', 'cancelled'));

ALTER TABLE social_post_accounts DROP CONSTRAINT IF EXISTS chk_social_post_accounts_status;
ALTER TABLE social_post_accounts ADD CONSTRAINT chk_social_post_accounts_status
  CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_social_integrations_workspace_status
  ON social_integrations (workspace_id, status)
  WHERE deleted_at IS NULL;
