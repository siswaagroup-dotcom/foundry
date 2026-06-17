import type { Plan } from "../types/billing-types";

export const plansData: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    billingCycle: "monthly",
    limits: { users: 2, workspaces: 1 },
    features: ["Basic workspace", "Task tracking", "Limited clients"],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    annualPrice: 190,
    billingCycle: "monthly",
    limits: { users: 5, workspaces: 1 },
    features: ["Team collaboration", "Client management", "Expense tracking"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 490,
    billingCycle: "monthly",
    limits: { users: 15, workspaces: 3 },
    features: ["Advanced tasks", "Social scheduling", "Role management"],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 99,
    annualPrice: 990,
    billingCycle: "monthly",
    limits: { users: 50, workspaces: 10 },
    features: ["Multi-team workflows", "Approvals", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 249,
    annualPrice: 2490,
    billingCycle: "monthly",
    limits: { users: "unlimited", workspaces: "unlimited" },
    features: ["Unlimited scale", "Custom roles", "Dedicated support"],
  },
];
