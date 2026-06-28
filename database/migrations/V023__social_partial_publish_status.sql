-- =============================================================================
-- MIGRATION V023 - SOCIAL PARTIAL PUBLISH STATUS
-- Adds the aggregate post status used when some selected platforms publish and
-- others fail. Per-account rows continue to use published/failed statuses.
-- =============================================================================

ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS chk_social_posts_status;
ALTER TABLE social_posts ADD CONSTRAINT chk_social_posts_status
  CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'partial', 'failed', 'archived', 'cancelled'));
