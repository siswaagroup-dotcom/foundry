// =============================================================================
// TASK TYPES — shared between client and server
// Imported by task.service.ts (client) and task.server.ts (server).
// Must NOT import any server-only or client-only modules.
// =============================================================================

export type TaskStatus   = "todo" | "planning" | "doing" | "review" | "done";
export type TaskPriority = "low"  | "medium"   | "high"  | "urgent";

export interface TaskAssignee {
  userId:   string;
  name:     string;
  initials: string;
}

export interface Task {
  id:          string;
  workspaceId: string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  priority:    TaskPriority;
  dueDate:     string | null;
  tags:        string[];
  assignees:   TaskAssignee[];
  createdBy:   string;
  createdAt:   string;
  updatedAt:   string;
}

export interface TaskComment {
  id:             string;
  taskId:         string;
  authorId:       string;
  authorName:     string;
  authorInitials: string;
  body:           string;
  createdAt:      string;
  updatedAt:      string;
}

export interface TaskFilters {
  status?:     TaskStatus;
  priority?:   TaskPriority;
  search?:     string;
  assigneeId?: string;
}

export interface CreateTaskInput {
  title:        string;
  description?: string;
  status?:      TaskStatus;
  priority?:    TaskPriority;
  dueDate?:     string;
  tags?:        string[];
}

export interface UpdateTaskInput {
  title?:       string;
  description?: string;
  status?:      TaskStatus;
  priority?:    TaskPriority;
  dueDate?:     string | null;
  tags?:        string[];
}
