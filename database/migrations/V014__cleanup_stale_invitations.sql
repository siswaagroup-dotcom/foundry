-- =============================================================================
-- MIGRATION V014 — CLEANUP STALE INVITATIONS
-- Removes workspace_invitation rows that were created by the in-memory/static
-- service layer before the real DB integration was active.
-- These rows have either:
--   a) NULL token_hash
--   b) token_hash that is not a valid SHA-256 hex digest (64 hex chars)
--   c) status that will never be actionable
-- Safe to run — only deletes rows that can never be accepted.
-- =============================================================================

-- Delete rows with NULL token_hash (created before DB integration)
DELETE FROM workspace_invitations
WHERE token_hash IS NULL;

-- Delete rows where token_hash is not a valid 64-char hex string
-- (SHA-256 hex is always exactly 64 lowercase hex characters)
DELETE FROM workspace_invitations
WHERE token_hash IS NOT NULL
  AND (
    length(token_hash) <> 64
    OR token_hash !~ '^[0-9a-f]{64}$'
  );

-- Mark any pending invitations older than 8 days as expired
-- (they cannot be resent by the old system and are effectively dead)
UPDATE workspace_invitations
SET status = 'expired'
WHERE status = 'pending'
  AND expires_at < NOW();

-- Verify
-- SELECT COUNT(*) FROM workspace_invitations;
-- SELECT id, email, status, length(token_hash) AS hash_len FROM workspace_invitations;
