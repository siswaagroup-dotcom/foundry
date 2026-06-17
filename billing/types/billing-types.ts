export type BillingCycle = "monthly" | "annual";

export type SubscriptionStatus = "active" | "trial" | "past-due" | "cancelled";

export type PlanLimit = {
  users: number | "unlimited";
  workspaces: number | "unlimited";
};

export type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  billingCycle: BillingCycle;
  features: string[];
  limits: PlanLimit;
};

export type WorkspaceSubscription = {
  id: string;
  workspaceId: string;
  planId: string;
  currentPlan: string;
  status: SubscriptionStatus;
  startsAt: string;
  renewalDate: string;
  billingCycle: BillingCycle;
  createdAt: string;
};

export type BillingWorkspace = {
  workspaceId: string;
  workspaceName: string;
  planId: string;
};
