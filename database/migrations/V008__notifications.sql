-- =============================================================================
-- MIGRATION V008 — NOTIFICATIONS
-- Tables: notifications
-- Depends on: V001 (users), V002 (workspaces)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: notifications
-- Purpose: Persistent in-app notification inbox per user per workspace.
--          Polymorphic reference to source entities via reference_type + reference_id.
--          Supports: read/unread state, soft delete (dismiss), actor tracking.
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID            NOT NULL,
    user_id         UUID            NOT NULL,           -- recipient
    type            VARCHAR(60)     NOT NULL,
    title           VARCHAR(500)    NOT NULL,
    body            TEXT            NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ     NULL,
    reference_type  VARCHAR(30)     NULL,               -- task | expense | client | social_post | invitation
    reference_id    UUID            NULL,               -- polymorphic ID of source entity
    actor_id        UUID            NULL,               -- who triggered the notification
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,               -- soft delete = user dismissed it

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notifications_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_actor
        FOREIGN KEY (actor_id)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_notifications_type
        CHECK (type IN (
            'task_assigned',
            'task_completed',
            'task_overdue',
            'expense_submitted',
            'expense_approved',
            'expense_rejected',
            'client_added',
            'post_scheduled',
            'post_published',
            'post_failed',
            'member_invited',
            'member_joined',
            'role_changed'
        )),
    CONSTRAINT chk_notifications_reference_type
        CHECK (
            reference_type IS NULL OR
            reference_type IN ('task', 'expense', 'client', 'social_post', 'invitation')
        ),
    -- read_at must be set when is_read is true
    CONSTRAINT chk_notifications_read_consistency
        CHECK (
            (is_read = FALSE AND read_at IS NULL) OR
            (is_read = TRUE AND read_at IS NOT NULL)
        )
);

-- Indexes
-- Notification feed per user (main bell dropdown query)
CREATE INDEX idx_notifications_user_feed
    ON notifications (workspace_id, user_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Unread count (hot query — hit on every page load)
CREATE INDEX idx_notifications_unread_count
    ON notifications (workspace_id, user_id)
    WHERE is_read = FALSE AND deleted_at IS NULL;

-- Find all notifications related to a specific entity
CREATE INDEX idx_notifications_reference
    ON notifications (reference_type, reference_id)
    WHERE reference_type IS NOT NULL AND reference_id IS NOT NULL;

-- Cleanup job: find old read notifications to archive
CREATE INDEX idx_notifications_cleanup
    ON notifications (created_at ASC)
    WHERE is_read = TRUE;

COMMENT ON TABLE  notifications                IS 'Persistent in-app notification inbox. Polymorphic reference to source entities.';
COMMENT ON COLUMN notifications.reference_type IS 'Entity type that triggered the notification: task, expense, client, social_post, invitation.';
COMMENT ON COLUMN notifications.reference_id   IS 'UUID of the entity that triggered the notification.';
COMMENT ON COLUMN notifications.actor_id       IS 'User who triggered the notification (e.g., who assigned the task). NULL for system events.';
COMMENT ON COLUMN notifications.deleted_at     IS 'NULL = visible. Set when user dismisses/deletes the notification.';
