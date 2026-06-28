-- =============================================================================
-- MIGRATION V019 - SOCIAL MEDIA MANAGEMENT
-- Adds production social integrations, multi-account publishing, schedules,
-- publish logs, media library, activity logs, and analytics-friendly columns.
-- =============================================================================

ALTER TABLE social_accounts DROP CONSTRAINT IF EXISTS chk_social_accounts_platform;
ALTER TABLE social_accounts ADD CONSTRAINT chk_social_accounts_platform
  CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'x', 'youtube'));

ALTER TABLE social_accounts
  ADD COLUMN IF NOT EXISTS integration_id UUID NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'disconnected',
  ADD COLUMN IF NOT EXISTS profile_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE social_accounts DROP CONSTRAINT IF EXISTS chk_social_accounts_status;
ALTER TABLE social_accounts ADD CONSTRAINT chk_social_accounts_status
  CHECK (status IN ('connected', 'disconnected', 'invalid_credentials', 'token_expired', 'syncing', 'permission_error'));

ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS chk_social_posts_platform;
ALTER TABLE social_posts ADD CONSTRAINT chk_social_posts_platform
  CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'x', 'youtube', 'multi'));

ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS chk_social_posts_status;
ALTER TABLE social_posts ADD CONSTRAINT chk_social_posts_status
  CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'publishing'));

ALTER TABLE social_posts ALTER COLUMN social_account_id DROP NOT NULL;
ALTER TABLE social_posts ALTER COLUMN title DROP NOT NULL;
ALTER TABLE social_posts ALTER COLUMN platform SET DEFAULT 'multi';

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS caption TEXT NULL,
  ADD COLUMN IF NOT EXISTS hashtags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS mentions TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS link_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS link_title TEXT NULL,
  ADD COLUMN IF NOT EXISTS link_description TEXT NULL,
  ADD COLUMN IF NOT EXISTS link_image_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS campaign VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS clicks_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impressions_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_count INTEGER NOT NULL DEFAULT 0;

UPDATE social_posts
SET caption = COALESCE(caption, content),
    platform = COALESCE(platform, 'multi')
WHERE caption IS NULL OR platform IS NULL;

ALTER TABLE social_posts ALTER COLUMN caption SET NOT NULL;

ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS chk_social_posts_title_not_empty;
ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS chk_social_posts_content_not_empty;
ALTER TABLE social_posts ADD CONSTRAINT chk_social_posts_caption_not_empty
  CHECK (char_length(trim(caption)) > 0);

CREATE TABLE IF NOT EXISTS social_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  platform VARCHAR(30) NOT NULL,
  connection_type VARCHAR(20) NOT NULL DEFAULT 'manual',
  display_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'disconnected',
  credentials_encrypted TEXT NULL,
  credential_keys TEXT[] NOT NULL DEFAULT '{}',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  external_account_id VARCHAR(255) NULL,
  expires_at TIMESTAMPTZ NULL,
  last_validated_at TIMESTAMPTZ NULL,
  last_sync_at TIMESTAMPTZ NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT pk_social_integrations PRIMARY KEY (id),
  CONSTRAINT fk_social_integrations_workspace FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_social_integrations_created_by FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_social_integrations_platform
    CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'x', 'youtube')),
  CONSTRAINT chk_social_integrations_connection_type
    CHECK (connection_type IN ('oauth', 'manual')),
  CONSTRAINT chk_social_integrations_status
    CHECK (status IN ('connected', 'disconnected', 'invalid_credentials', 'token_expired', 'syncing', 'permission_error'))
);

CREATE INDEX IF NOT EXISTS idx_social_integrations_workspace_platform
  ON social_integrations (workspace_id, platform)
  WHERE deleted_at IS NULL;

ALTER TABLE social_accounts DROP CONSTRAINT IF EXISTS fk_social_accounts_integration;
ALTER TABLE social_accounts ADD CONSTRAINT fk_social_accounts_integration
  FOREIGN KEY (integration_id) REFERENCES social_integrations (id)
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS social_post_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  social_account_id UUID NOT NULL,
  platform VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  platform_post_id VARCHAR(255) NULL,
  live_url TEXT NULL,
  error_message TEXT NULL,
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_social_post_accounts PRIMARY KEY (id),
  CONSTRAINT uq_social_post_accounts UNIQUE (post_id, social_account_id),
  CONSTRAINT fk_social_post_accounts_post FOREIGN KEY (post_id)
    REFERENCES social_posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_social_post_accounts_account FOREIGN KEY (social_account_id)
    REFERENCES social_accounts (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_social_post_accounts_platform
    CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'x', 'youtube')),
  CONSTRAINT chk_social_post_accounts_status
    CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_social_post_accounts_post
  ON social_post_accounts (post_id);

CREATE INDEX IF NOT EXISTS idx_social_post_accounts_status
  ON social_post_accounts (social_account_id, status);

CREATE TABLE IF NOT EXISTS social_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(80) NOT NULL DEFAULT 'UTC',
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ NULL,

  CONSTRAINT pk_social_schedules PRIMARY KEY (id),
  CONSTRAINT fk_social_schedules_post FOREIGN KEY (post_id)
    REFERENCES social_posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_social_schedules_workspace FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_social_schedules_created_by FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_social_schedules_status
    CHECK (status IN ('scheduled', 'published', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_social_schedules_workspace_date
  ON social_schedules (workspace_id, scheduled_at)
  WHERE cancelled_at IS NULL;

CREATE TABLE IF NOT EXISTS social_publish_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  social_account_id UUID NULL,
  workspace_id UUID NOT NULL,
  platform VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL,
  message TEXT NULL,
  request_payload JSONB NULL,
  response_payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_social_publish_logs PRIMARY KEY (id),
  CONSTRAINT fk_social_publish_logs_post FOREIGN KEY (post_id)
    REFERENCES social_posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_social_publish_logs_account FOREIGN KEY (social_account_id)
    REFERENCES social_accounts (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_social_publish_logs_workspace FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_social_publish_logs_platform
    CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'x', 'youtube')),
  CONSTRAINT chk_social_publish_logs_status
    CHECK (status IN ('success', 'failed', 'queued', 'skipped'))
);

CREATE INDEX IF NOT EXISTS idx_social_publish_logs_post
  ON social_publish_logs (post_id, created_at DESC);

CREATE TABLE IF NOT EXISTS social_media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NULL,
  media_type VARCHAR(20) NOT NULL,
  alt_text TEXT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT pk_social_media_library PRIMARY KEY (id),
  CONSTRAINT fk_social_media_library_workspace FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_social_media_library_uploaded_by FOREIGN KEY (uploaded_by)
    REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_social_media_library_type
    CHECK (media_type IN ('image', 'video', 'document'))
);

CREATE INDEX IF NOT EXISTS idx_social_media_library_workspace
  ON social_media_library (workspace_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS social_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  actor_id UUID NULL,
  post_id UUID NULL,
  integration_id UUID NULL,
  action VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_social_activity_logs PRIMARY KEY (id),
  CONSTRAINT fk_social_activity_logs_workspace FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_social_activity_logs_actor FOREIGN KEY (actor_id)
    REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_social_activity_logs_post FOREIGN KEY (post_id)
    REFERENCES social_posts (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_social_activity_logs_integration FOREIGN KEY (integration_id)
    REFERENCES social_integrations (id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_activity_logs_workspace
  ON social_activity_logs (workspace_id, created_at DESC);

COMMENT ON TABLE social_integrations IS 'Workspace social platform connection credentials. Secrets are encrypted before storage.';
COMMENT ON TABLE social_post_accounts IS 'Join table for publishing one social post to many connected platform accounts.';
COMMENT ON TABLE social_schedules IS 'Scheduling state for social posts.';
COMMENT ON TABLE social_publish_logs IS 'Per-platform publishing audit log.';
COMMENT ON TABLE social_media_library IS 'Reusable social media assets for a workspace.';
COMMENT ON TABLE social_activity_logs IS 'Auditable social module activity feed.';
