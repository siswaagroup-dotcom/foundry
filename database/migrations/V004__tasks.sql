-- =============================================================================
-- MIGRATION V004 — TASKS MODULE
-- Tables: tasks, task_assignees, task_tags, task_comments
-- Depends on: V001 (users), V002 (workspaces)
-- Note: tasks.client_id FK is added in V006 after clients table exists
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: tasks
-- Purpose: Core task entity. The primary work item in the Kanban board.
--          Supports 5 workflow stages: todo → planning → doing → review → done
-- ---------------------------------------------------------------------------
CREATE TABLE tasks (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    workspace_id    UUID            NOT NULL,
    title           VARCHAR(500)    NOT NULL,
    description     TEXT            NULL,
    status          VARCHAR(30)     NOT NULL DEFAULT 'todo',
    priority        VARCHAR(20)     NOT NULL DEFAULT 'medium',
    due_date        TIMESTAMPTZ     NULL,
    client_id       UUID            NULL,           -- FK added in V006
    created_by      UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,

    CONSTRAINT pk_tasks PRIMARY KEY (id),
    CONSTRAINT fk_tasks_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_tasks_status
        CHECK (status IN ('todo', 'planning', 'doing', 'review', 'done')),
    CONSTRAINT chk_tasks_priority
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT chk_tasks_title_not_empty
        CHECK (char_length(trim(title)) > 0)
);

-- Indexes
-- Kanban board: fetch tasks by workspace grouped by status
CREATE INDEX idx_tasks_workspace_status
    ON tasks (workspace_id, status)
    WHERE deleted_at IS NULL;

-- Overdue and upcoming deadline queries
CREATE INDEX idx_tasks_workspace_due_date
    ON tasks (workspace_id, due_date)
    WHERE deleted_at IS NULL AND due_date IS NOT NULL;

-- Filter by priority
CREATE INDEX idx_tasks_workspace_priority
    ON tasks (workspace_id, priority)
    WHERE deleted_at IS NULL;

-- Tasks created by a user
CREATE INDEX idx_tasks_created_by
    ON tasks (created_by);

-- Active tasks full scan guard
CREATE INDEX idx_tasks_deleted_at
    ON tasks (deleted_at)
    WHERE deleted_at IS NULL;

COMMENT ON TABLE  tasks              IS 'Core task entity for the Kanban board. 5-stage workflow.';
COMMENT ON COLUMN tasks.client_id    IS 'Optional FK to clients. Added via ALTER TABLE in V006.';
COMMENT ON COLUMN tasks.deleted_at   IS 'Soft delete. Kanban board always filters WHERE deleted_at IS NULL.';

-- ---------------------------------------------------------------------------
-- TABLE: task_assignees
-- Purpose: M2M bridge — tasks ↔ users.
--          A task can have multiple assignees. A user can have many tasks.
-- ---------------------------------------------------------------------------
CREATE TABLE task_assignees (
    task_id     UUID        NOT NULL,
    user_id     UUID        NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID        NOT NULL,           -- who made the assignment

    CONSTRAINT pk_task_assignees PRIMARY KEY (task_id, user_id),
    CONSTRAINT fk_task_assignees_task
        FOREIGN KEY (task_id)
        REFERENCES tasks (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_task_assignees_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_task_assignees_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Indexes
-- Tasks assigned to a specific user (notification queries, "My Tasks" view)
CREATE INDEX idx_task_assignees_user_id
    ON task_assignees (user_id);

CREATE INDEX idx_task_assignees_task_id
    ON task_assignees (task_id);

COMMENT ON TABLE task_assignees IS 'M2M bridge: tasks <-> users. Multiple assignees per task supported.';

-- ---------------------------------------------------------------------------
-- TABLE: task_tags
-- Purpose: Free-form text tags on tasks (Design, Social, Marketing, etc.)
--          M2M: tasks ↔ text tags. Free-form by design — no reference table.
-- ---------------------------------------------------------------------------
CREATE TABLE task_tags (
    task_id     UUID            NOT NULL,
    tag         VARCHAR(100)    NOT NULL,

    CONSTRAINT pk_task_tags PRIMARY KEY (task_id, tag),
    CONSTRAINT fk_task_tags_task
        FOREIGN KEY (task_id)
        REFERENCES tasks (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_task_tags_not_empty
        CHECK (char_length(trim(tag)) > 0)
);

-- Indexes
-- Filter all tasks with a given tag within a workspace (join with tasks)
CREATE INDEX idx_task_tags_tag
    ON task_tags (tag);

COMMENT ON TABLE task_tags IS 'Free-form text tags on tasks. No reference table — tags are flexible per workspace.';

-- ---------------------------------------------------------------------------
-- TABLE: task_comments
-- Purpose: Threaded comments/notes on a task.
--          Forms the activity discussion on the Task Details screen.
-- ---------------------------------------------------------------------------
CREATE TABLE task_comments (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    task_id         UUID        NOT NULL,
    workspace_id    UUID        NOT NULL,  -- denormalized for tenant isolation
    author_id       UUID        NOT NULL,
    body            TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ NULL,

    CONSTRAINT pk_task_comments PRIMARY KEY (id),
    CONSTRAINT fk_task_comments_task
        FOREIGN KEY (task_id)
        REFERENCES tasks (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_task_comments_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_task_comments_author
        FOREIGN KEY (author_id)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_task_comments_body_not_empty
        CHECK (char_length(trim(body)) > 0)
);

-- Indexes
-- Chronological comments on a task (Task Details activity log)
CREATE INDEX idx_task_comments_task_chronological
    ON task_comments (task_id, created_at ASC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_task_comments_workspace
    ON task_comments (workspace_id);

COMMENT ON TABLE  task_comments              IS 'Threaded comments on a task. Drives the activity log on Task Details screen.';
COMMENT ON COLUMN task_comments.workspace_id IS 'Denormalized for tenant isolation. Avoids join through tasks for workspace queries.';
