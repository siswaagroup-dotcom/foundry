import type {
  BillingWorkspace,
  WorkspaceSubscription,
} from "../types/billing-types";

export const subscriptionData: WorkspaceSubscription = {
  id: "subscription_001",
  workspaceId: "workspace_outbit",
  planId: "pro",
  currentPlan: "Pro",
  status: "active",
  startsAt: "2026-05-07T00:00:00.000Z",
  renewalDate: "2026-07-07T00:00:00.000Z",
  billingCycle: "monthly",
  createdAt: "2026-05-07T00:00:00.000Z",
};

export const workspaceSubscriptions: BillingWorkspace[] = [
  {
    workspaceId: "workspace_outbit",
    workspaceName: "Outbit Technologies",
    planId: "pro",
  },
  {
    workspaceId: "workspace_mba_vidya",
    workspaceName: "MBA Vidya",
    planId: "business",
  },
  {
    workspaceId: "workspace_techvision",
    workspaceName: "TechVision",
    planId: "free",
  },
];
