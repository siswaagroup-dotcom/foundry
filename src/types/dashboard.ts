import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type TaskStatus = "Todo" | "In Progress" | "Done" | "Blocked";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type Task = {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  dueTime: string;
  status: TaskStatus;
  completed: boolean;
};

export type ExpenseStatus = "Planned" | "Submitted" | "Approved" | "Pending";

export type Expense = {
  id: string;
  name: string;
  category: string;
  amount: number;
  status: ExpenseStatus;
  owner: string;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  status: "Active" | "At Risk" | "Onboarding" | "Paused";
  revenue: number;
  contact: string;
  email: string;
};

export type Activity = {
  id: string;
  user: string;
  initials: string;
  action: string;
  timestamp: string;
};

export type Deadline = {
  id: string;
  project: string;
  dueDate: string;
  status: "On Track" | "At Risk" | "Blocked";
};

export type OverdueItem = {
  id: string;
  title: string;
  type: string;
  daysOverdue: number;
  amount?: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  permissions: string;
  status: "Online" | "Away" | "Offline";
};

export type SocialPost = {
  id: string;
  title: string;
  channel: string;
  status: "Scheduled" | "Draft" | "Published";
  engagement: string;
};

export type DashboardStats = {
  activeProjects: number;
  onlineMembers: number;
  revenue: number;
  expenses: number;
  clients: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalRevenue: number;
  unpaidInvoices: number;
  totalExpenses: number;
  unreadNotifications: number;
  teamMembers: number;
};

export type DashboardChartRow = {
  month: string;
  revenue: number;
  expenses: number;
  tasks: number;
};

export type DashboardProductivityRow = {
  team: string;
  value: number;
};

export type DashboardResponse = {
  stats: DashboardStats;
  charts: {
    revenue: DashboardChartRow[];
    productivity: DashboardProductivityRow[];
  };
  recentClients: Client[];
  recentTasks: Task[];
  recentExpenses: Expense[];
  upcomingDeadlines: Deadline[];
  overdueItems: OverdueItem[];
  teamActivity: Activity[];
  expenseStatusTotals: Array<{ status: string; total: number }>;
  pipeline: Record<string, unknown>;
  notifications: Array<{ id: string; title: string; body: string; createdAt: string }>;
  unreadNotifications: number;
};
