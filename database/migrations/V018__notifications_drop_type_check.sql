-- =============================================================================
-- MIGRATION V018 — NOTIFICATIONS: Drop restrictive type CHECK constraint
-- The V008 constraint is too narrow for the full notification type set.
-- We replace it with a much broader (effectively open) check.
-- =============================================================================

-- Drop old narrow constraint
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS chk_notifications_type;

-- Add a permissive constraint: type must be non-empty
ALTER TABLE notifications
  ADD CONSTRAINT chk_notifications_type
    CHECK (char_length(type) > 0);

-- Ensure actor_id column exists (some installs may have missed it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'actor_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN actor_id UUID NULL
      REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END;
$$;

-- Ensure priority column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'priority'
  ) THEN
    ALTER TABLE notifications ADD COLUMN priority VARCHAR(10) NOT NULL DEFAULT 'normal';
  END IF;
END;
$$;

COMMENT ON TABLE notifications IS 'Persistent in-app notification inbox. Type constraint relaxed in V018 to support full notification catalogue.';
