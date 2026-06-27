import type { NotificationFilterOption, NotificationType } from "../types/notification-types";

export const notificationTypes: Record<NotificationType, string> = {
  member_invited: "Member invited",
  member_joined: "Member joined",
  role_changed: "Role changed",
  team_role_changed: "Team role changed",

  task_assigned: "Task assigned",
  task_updated: "Task updated",
  task_due_today: "Due today",
  task_due_tomorrow: "Due tomorrow",
  task_overdue: "Overdue",
  task_comment_added: "Comment added",
  task_mentioned: "Mentioned in task",

  project_created: "Project created",
  project_status_changed: "Project status changed",
  milestone_completed: "Milestone completed",

  expense_submitted: "Expense submitted",
  expense_approved: "Expense approved",
  expense_rejected: "Expense rejected",
  expense_changes_requested: "Changes requested",
  expense_reimbursement_completed: "Reimbursement completed",

  client_added: "New client added",
  client_stage_changed: "CRM stage changed",
  client_proposal_sent: "Proposal sent",
  client_advance_received: "Advance received",
  client_project_won: "Project won",

  settings_workspace_updated: "Workspace updated",
  settings_integrations_connected: "Integrations connected",
  settings_api_key_changed: "API key changed",
};

export const notificationFilters: NotificationFilterOption[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Tasks", value: "tasks" },
  { label: "Projects", value: "projects" },
  { label: "Expenses", value: "expenses" },
  { label: "Clients", value: "clients" },
  { label: "Team", value: "team" },
  { label: "Settings", value: "settings" },
];
