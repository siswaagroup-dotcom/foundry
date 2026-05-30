import {
  BarChart3,
  BriefcaseBusiness,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type {
  Activity,
  Client,
  Deadline,
  Expense,
  NavItem,
  OverdueItem,
  SocialPost,
  Task,
  TeamMember,
} from "@/types/dashboard";

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/dashboard/tasks", icon: ShieldCheck },
  { title: "Expenses", href: "/dashboard/expenses", icon: CreditCard },
  { title: "Clients", href: "/dashboard/clients", icon: BriefcaseBusiness },
  { title: "Social", href: "/dashboard/social", icon: MessageSquare },
  { title: "Team & Roles", href: "/dashboard/team", icon: Users },
  { title: "Reports", href: "/dashboard/reports", icon: FileBarChart },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const tasks: Task[] = [
  { id: "t1", title: "Review Q2 campaign proposal", category: "Client: Acme Corp", priority: "High", dueTime: "10:00 AM", status: "In Progress", completed: false },
  { id: "t2", title: "Team standup meeting", category: "Marketing Team", priority: "Medium", dueTime: "2:00 PM", status: "Todo", completed: false },
  { id: "t3", title: "Submit software subscription receipts", category: "Software & Tools", priority: "Urgent", dueTime: "3:15 PM", status: "Blocked", completed: false },
  { id: "t4", title: "Share Q2 product roadmap update", category: "Company-wide", priority: "High", dueTime: "4:30 PM", status: "Todo", completed: false },
  { id: "t5", title: "Prepare investor presentation", category: "Finance", priority: "High", dueTime: "5:00 PM", status: "In Progress", completed: false },
  { id: "t6", title: "Approve landing page copy", category: "Growth", priority: "Medium", dueTime: "11:30 AM", status: "Done", completed: true },
  { id: "t7", title: "Audit onboarding checklist", category: "Customer Success", priority: "Low", dueTime: "1:00 PM", status: "Todo", completed: false },
  { id: "t8", title: "Finalize sprint planning", category: "Product", priority: "High", dueTime: "3:45 PM", status: "Todo", completed: false },
  { id: "t9", title: "QA billing workflow fixes", category: "Engineering", priority: "Urgent", dueTime: "6:00 PM", status: "In Progress", completed: false },
  { id: "t10", title: "Send client renewal summary", category: "Accounts", priority: "Medium", dueTime: "4:00 PM", status: "Done", completed: true },
];

export const overdueItems: OverdueItem[] = [
  { id: "o1", title: "Complete brand guidelines document", type: "Client Documents", daysOverdue: 2 },
  { id: "o2", title: "Conference travel receipts", type: "Payments", daysOverdue: 5, amount: 1245 },
  { id: "o3", title: "Client feedback review - Website redesign", type: "Meetings", daysOverdue: 1 },
  { id: "o4", title: "March acquisition report", type: "Reports", daysOverdue: 3 },
];

export const expenses: Expense[] = [
  { id: "e1", name: "Adobe Creative Cloud - Team", category: "Software", amount: 847, status: "Submitted", owner: "Sarah Miller" },
  { id: "e2", name: "Office supplies order", category: "Operations", amount: 245, status: "Pending", owner: "Dev Patel" },
  { id: "e3", name: "LinkedIn ads campaign", category: "Marketing", amount: 2300, status: "Planned", owner: "Mina Chen" },
  { id: "e4", name: "AWS reserved capacity", category: "Infrastructure", amount: 1493, status: "Approved", owner: "Owen Brooks" },
  { id: "e5", name: "Customer visit travel", category: "Travel", amount: 1180, status: "Pending", owner: "Alex Kim" },
];

export const activities: Activity[] = [
  { id: "a1", user: "Sarah Miller", initials: "SM", action: "completed Design system documentation", timestamp: "15 minutes ago" },
  { id: "a2", user: "Marcus Lee", initials: "ML", action: "approved AWS reserved capacity", timestamp: "26 minutes ago" },
  { id: "a3", user: "Priya Shah", initials: "PS", action: "created task QA billing workflow fixes", timestamp: "42 minutes ago" },
  { id: "a4", user: "Owen Brooks", initials: "OB", action: "updated revenue forecast", timestamp: "1 hour ago" },
  { id: "a5", user: "Mina Chen", initials: "MC", action: "scheduled LinkedIn launch post", timestamp: "2 hours ago" },
  { id: "a6", user: "Dev Patel", initials: "DP", action: "commented on onboarding checklist", timestamp: "2 hours ago" },
  { id: "a7", user: "Alex Kim", initials: "AK", action: "uploaded travel receipts", timestamp: "3 hours ago" },
  { id: "a8", user: "Jane Cooper", initials: "JC", action: "added client Northstar Labs", timestamp: "3 hours ago" },
  { id: "a9", user: "Liam Reed", initials: "LR", action: "closed sprint planning notes", timestamp: "4 hours ago" },
  { id: "a10", user: "Nora Quinn", initials: "NQ", action: "updated security permissions", timestamp: "4 hours ago" },
  { id: "a11", user: "Sam Rivera", initials: "SR", action: "published monthly report", timestamp: "5 hours ago" },
  { id: "a12", user: "Ava Stone", initials: "AS", action: "moved renewal summary to done", timestamp: "5 hours ago" },
  { id: "a13", user: "Leo Grant", initials: "LG", action: "created expense policy draft", timestamp: "6 hours ago" },
  { id: "a14", user: "Ivy Morgan", initials: "IM", action: "assigned role Operations Admin", timestamp: "7 hours ago" },
  { id: "a15", user: "Chris Wong", initials: "CW", action: "archived completed client handoff", timestamp: "8 hours ago" },
];

export const deadlines: Deadline[] = [
  { id: "d1", project: "Website launch", dueDate: "March 15, 2026", status: "On Track" },
  { id: "d2", project: "Q1 Report submission", dueDate: "March 31, 2026", status: "At Risk" },
  { id: "d3", project: "Billing migration", dueDate: "April 04, 2026", status: "Blocked" },
];

export const clients: Client[] = [
  { id: "c1", name: "Acme Corp", industry: "B2B SaaS", status: "Active", revenue: 84000, contact: "Riley Hart", email: "riley@acme.co" },
  { id: "c2", name: "Northstar Labs", industry: "Biotech", status: "Onboarding", revenue: 42000, contact: "Maya Singh", email: "maya@northstar.io" },
  { id: "c3", name: "BrightLayer", industry: "Fintech", status: "Active", revenue: 128000, contact: "Jon Bell", email: "jon@brightlayer.com" },
  { id: "c4", name: "Atlas Studio", industry: "Design", status: "At Risk", revenue: 31000, contact: "Elena Moore", email: "elena@atlas.studio" },
];

export const socialPosts: SocialPost[] = [
  { id: "s1", title: "Foundry Q2 launch teaser", channel: "LinkedIn", status: "Scheduled", engagement: "8.2k reach" },
  { id: "s2", title: "Customer story: Acme Corp", channel: "X", status: "Draft", engagement: "Pending" },
  { id: "s3", title: "Product workflow carousel", channel: "Instagram", status: "Published", engagement: "12.4% ER" },
];

export const teamMembers: TeamMember[] = [
  { id: "m1", name: "Sarah Miller", role: "Design Lead", email: "sarah@foundry.dev", permissions: "Admin", status: "Online" },
  { id: "m2", name: "Marcus Lee", role: "Finance Manager", email: "marcus@foundry.dev", permissions: "Billing", status: "Away" },
  { id: "m3", name: "Priya Shah", role: "Engineering Lead", email: "priya@foundry.dev", permissions: "Editor", status: "Online" },
  { id: "m4", name: "Mina Chen", role: "Growth Manager", email: "mina@foundry.dev", permissions: "Editor", status: "Offline" },
];

export const revenueChart = [
  { month: "Jan", revenue: 42000, expenses: 18000, tasks: 64 },
  { month: "Feb", revenue: 51000, expenses: 21000, tasks: 72 },
  { month: "Mar", revenue: 64000, expenses: 24500, tasks: 81 },
  { month: "Apr", revenue: 58000, expenses: 22600, tasks: 76 },
  { month: "May", revenue: 76000, expenses: 29100, tasks: 88 },
  { month: "Jun", revenue: 84000, expenses: 31500, tasks: 94 },
];

export const productivityChart = [
  { team: "Design", value: 82 },
  { team: "Eng", value: 91 },
  { team: "Growth", value: 74 },
  { team: "CS", value: 86 },
];

export const quickStats = {
  activeProjects: 8,
  onlineMembers: 12,
  revenue: 84210,
  expenses: 14523,
  clients: 42,
};
