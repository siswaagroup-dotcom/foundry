-- =============================================================================
-- MIGRATION V007 — SOCIAL MODULE
-- Tables: social_accounts, social_campaigns, social_posts, social_post_media
-- Also adds social_posts.client_id FK (deferred cross-module)
-- Depends on: V001, V002, V006 (clients)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: social_accounts
-- Purpose: Connected social media platform accounts per workspace.
--          Stores OAuth credentials for Instagram, LinkedIn, Facebook, X.
--          A workspace can connect multiple accounts per platform.
-- ---------------------------------------------------------------------------
CREATE TABLE social_accounts (
    id                          UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id                UUID            NOT NULL,
    platform                    VARCHAR(30)     NOT NULL,
    account_name                VARCHAR(255)    NOT NULL,
    handle                      VARCHAR(255)    NOT NULL,
    platform_user_id            VARCHAR(255)    NULL,   -- ID from the platform API
    access_token_encrypted      TEXT            NULL,   -- encrypted at app level
    token_expires_at            TIMESTAMPTZ     NULL,
    followers_count             INTEGER         NULL,   -- cached, refreshed periodically
    posts_count                 INTEGER         NULL,   -- cached
    connected_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    disconnected_at             TIMESTAMPTZ     NULL,   -- NULL = currently connected

    CONSTRAINT pk_social_accounts PRIMARY KEY (id),
    CONSTRAINT uq_social_accounts_platform_handle
        UNIQUE (workspace_id, platform, handle),
    CONSTRAINT fk_social_accounts_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_social_accounts_platform
        CHECK (platform IN ('instagram', 'linkedin', 'facebook', 'x')),
    CONSTRAINT chk_social_accounts_followers
        CHECK (followers_count IS NULL OR followers_count >= 0),
    CONSTRAINT chk_social_accounts_posts
        CHECK (posts_count IS NULL OR posts_count >= 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_social_accounts_workspace_platform_handle
    ON social_accounts (workspace_id, platform, handle);

CREATE INDEX idx_social_accounts_workspace_platform
    ON social_accounts (workspace_id, platform);

-- Connected accounts only
CREATE INDEX idx_social_accounts_connected
    ON social_accounts (workspace_id)
    WHERE disconnected_at IS NULL;

COMMENT ON TABLE  social_accounts                          IS 'Connected social platform accounts per workspace.';
COMMENT ON COLUMN social_accounts.access_token_encrypted   IS 'OAuth access token. Must be encrypted at application level before storage.';
COMMENT ON COLUMN social_accounts.disconnected_at          IS 'NULL = account is connected. Set when workspace disconnects the account.';

-- ---------------------------------------------------------------------------
-- TABLE: social_campaigns
-- Purpose: Groups social posts under a named campaign.
--          First-class entity — visible as a filter dimension in the Social module.
-- ---------------------------------------------------------------------------
CREATE TABLE social_campaigns (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID            NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    created_by      UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,

    CONSTRAINT pk_social_campaigns PRIMARY KEY (id),
    CONSTRAINT fk_social_campaigns_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_social_campaigns_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_social_campaigns_name_not_empty
        CHECK (char_length(trim(name)) > 0)
);

-- Indexes
CREATE INDEX idx_social_campaigns_workspace
    ON social_campaigns (workspace_id)
    WHERE deleted_at IS NULL;

COMMENT ON TABLE social_campaigns IS 'Named campaign groups for social posts. Used as a filter dimension.';

-- ---------------------------------------------------------------------------
-- TABLE: social_posts
-- Purpose: Core social post entity. Content, scheduling, platform, and status.
--          Drives both the calendar view and the list view in the Social module.
-- ---------------------------------------------------------------------------
CREATE TABLE social_posts (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id        UUID            NOT NULL,
    social_account_id   UUID            NOT NULL,
    campaign_id         UUID            NULL,
    client_id           UUID            NULL,           -- FK added below
    title               VARCHAR(500)    NOT NULL,
    content             TEXT            NOT NULL,
    status              VARCHAR(30)     NOT NULL DEFAULT 'draft',
    -- platform is denormalized from social_accounts for calendar view performance
    platform            VARCHAR(30)     NOT NULL,
    scheduled_at        TIMESTAMPTZ     NULL,
    published_at        TIMESTAMPTZ     NULL,
    platform_post_id    VARCHAR(255)    NULL,           -- returned by platform API on publish
    created_by          UUID            NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT pk_social_posts PRIMARY KEY (id),
    CONSTRAINT fk_social_posts_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_social_posts_account
        FOREIGN KEY (social_account_id)
        REFERENCES social_accounts (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_social_posts_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES social_campaigns (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_social_posts_client
        FOREIGN KEY (client_id)
        REFERENCES clients (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_social_posts_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_social_posts_status
        CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    CONSTRAINT chk_social_posts_platform
        CHECK (platform IN ('instagram', 'linkedin', 'facebook', 'x')),
    CONSTRAINT chk_social_posts_title_not_empty
        CHECK (char_length(trim(title)) > 0),
    CONSTRAINT chk_social_posts_content_not_empty
        CHECK (char_length(trim(content)) > 0),
    -- A scheduled post must have a scheduled_at timestamp
    CONSTRAINT chk_social_posts_scheduled_requires_date
        CHECK (status != 'scheduled' OR scheduled_at IS NOT NULL)
);

-- Indexes
-- Status filter (list view)
CREATE INDEX idx_social_posts_workspace_status
    ON social_posts (workspace_id, status)
    WHERE deleted_at IS NULL;

-- Calendar view: fetch posts by date range
CREATE INDEX idx_social_posts_workspace_scheduled
    ON social_posts (workspace_id, scheduled_at)
    WHERE deleted_at IS NULL AND scheduled_at IS NOT NULL;

-- Platform + status filter (calendar filtered by platform)
CREATE INDEX idx_social_posts_workspace_platform_status
    ON social_posts (workspace_id, platform, status)
    WHERE deleted_at IS NULL;

-- Posts per account
CREATE INDEX idx_social_posts_account
    ON social_posts (social_account_id);

-- Posts per campaign
CREATE INDEX idx_social_posts_campaign
    ON social_posts (campaign_id)
    WHERE campaign_id IS NOT NULL;

-- Posts linked to a client
CREATE INDEX idx_social_posts_client
    ON social_posts (client_id)
    WHERE client_id IS NOT NULL;

COMMENT ON TABLE  social_posts          IS 'Core social post entity. Drives calendar and list views in Social module.';
COMMENT ON COLUMN social_posts.platform IS 'Denormalized from social_accounts for calendar view query performance.';

-- ---------------------------------------------------------------------------
-- TABLE: social_post_media
-- Purpose: Media files (images, videos) attached to a social post.
--          Supports carousel posts (multiple images in order).
-- ---------------------------------------------------------------------------
CREATE TABLE social_post_media (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    post_id             UUID            NOT NULL,
    workspace_id        UUID            NOT NULL,   -- denormalized
    file_url            TEXT            NOT NULL,
    mime_type           VARCHAR(100)    NOT NULL,
    file_size_bytes     BIGINT          NULL,
    sort_order          SMALLINT        NOT NULL DEFAULT 0,
    uploaded_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_social_post_media PRIMARY KEY (id),
    CONSTRAINT fk_social_post_media_post
        FOREIGN KEY (post_id)
        REFERENCES social_posts (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_social_post_media_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_social_post_media_file_size
        CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
    CONSTRAINT chk_social_post_media_sort_order
        CHECK (sort_order >= 0)
);

-- Indexes
-- Fetch media in display order for a post
CREATE INDEX idx_social_post_media_post_order
    ON social_post_media (post_id, sort_order ASC);

COMMENT ON TABLE  social_post_media             IS 'Media files for a social post. sort_order controls carousel sequence.';
COMMENT ON COLUMN social_post_media.sort_order  IS '0-based index. Carousel posts display media in ascending sort_order.';
