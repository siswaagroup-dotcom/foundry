export type TaskStatus = "todo" | "planning" | "doing" | "review";

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  assignee: string;
  dueDate: string;
  status: TaskStatus;
}