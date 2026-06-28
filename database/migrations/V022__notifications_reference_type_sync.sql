-- =============================================================================
-- MIGRATION V022 - NOTIFICATIONS REFERENCE TYPE SYNC
-- Keeps notifications.reference_type constrained while matching the application
-- entity types used by createNotification/createBulkNotifications.
-- =============================================================================

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS chk_notifications_reference_type;

ALTER TABLE notifications
  ADD CONSTRAINT chk_notifications_reference_type
    CHECK (
      reference_type IS NULL OR
      reference_type IN (
        'task',
        'project',
        'client',
        'expense',
        'social',
        'social_post',
        'social_account',
        'social_integration',
        'invitation',
        'team',
        'settings',
        'workspace',
        'invoice',
        'billing',
        'report'
      )
    );

COMMENT ON COLUMN notifications.reference_type IS
  'Entity type that triggered the notification. Must match the application NotificationEntityType union.';
