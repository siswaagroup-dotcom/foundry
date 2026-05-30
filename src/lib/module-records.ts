import {
  clients,
  expenses,
  socialPosts,
  tasks,
  teamMembers,
} from "@/lib/dashboard-data";
import type { ModuleRecord } from "@/components/dashboard/CrudModule";

export const taskRecords: ModuleRecord[] = tasks.map((task) => ({
  id: task.id,
  title: task.title,
  subtitle: task.category,
  status: task.status,
  meta: `${task.priority} priority • ${task.dueTime}`,
  completed: task.completed,
}));

export const expenseRecords: ModuleRecord[] = expenses.map((expense) => ({
  id: expense.id,
  title: expense.name,
  subtitle: expense.category,
  status: expense.status,
  meta: expense.owner,
  amount: `$${expense.amount.toLocaleString()}`,
}));

export const clientRecords: ModuleRecord[] = clients.map((client) => ({
  id: client.id,
  title: client.name,
  subtitle: client.industry,
  status: client.status,
  meta: `${client.contact} • ${client.email}`,
  amount: `$${client.revenue.toLocaleString()}`,
}));

export const socialRecords: ModuleRecord[] = socialPosts.map((post) => ({
  id: post.id,
  title: post.title,
  subtitle: post.channel,
  status: post.status,
  meta: post.engagement,
}));

export const teamRecords: ModuleRecord[] = teamMembers.map((member) => ({
  id: member.id,
  title: member.name,
  subtitle: member.role,
  status: member.status,
  meta: `${member.email} • ${member.permissions}`,
}));

export const reportRecords: ModuleRecord[] = [
  { id: "r1", title: "Revenue Report", subtitle: "Finance", status: "Ready", meta: "Monthly recurring revenue and expansion" },
  { id: "r2", title: "Expense Report", subtitle: "Operations", status: "Ready", meta: "Budget, submitted, approved, pending" },
  { id: "r3", title: "Team Productivity Report", subtitle: "People", status: "Draft", meta: "Velocity, throughput, blockers" },
  { id: "r4", title: "Client Growth Report", subtitle: "Sales", status: "Scheduled", meta: "New clients and retention" },
];

export const settingsRecords: ModuleRecord[] = [
  { id: "set1", title: "Profile Settings", subtitle: "Personal", status: "Enabled", meta: "Name, avatar, email" },
  { id: "set2", title: "Workspace Settings", subtitle: "Workspace", status: "Enabled", meta: "Members, defaults, regions" },
  { id: "set3", title: "Billing Settings", subtitle: "Billing", status: "Action Required", meta: "Invoices and payment methods" },
  { id: "set4", title: "Notification Settings", subtitle: "Preferences", status: "Enabled", meta: "Email, push, weekly digest" },
  { id: "set5", title: "Security Settings", subtitle: "Security", status: "Enabled", meta: "SSO, MFA, session controls" },
];
