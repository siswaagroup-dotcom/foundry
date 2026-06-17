"use client";

import { useMemo, useState } from "react";
import { plansData } from "../data/plans-data";
import { subscriptionData } from "../data/subscription-data";
import type { WorkspaceSubscription } from "../types/billing-types";

export function useBilling() {
  const [subscription] =
    useState<WorkspaceSubscription>(subscriptionData);
  const [availablePlans] = useState(plansData);

  const currentPlan = useMemo(
    () =>
      availablePlans.find((plan) => plan.id === subscription.planId) ??
      availablePlans[0],
    [availablePlans, subscription.planId],
  );

  const comparisonPlans = useMemo(
    () => availablePlans.filter((plan) => ["free", "pro", "business"].includes(plan.id)),
    [availablePlans],
  );

  function upgradePlan() {
    console.log("Upgrade Plan");
  }

  function manageSubscription() {
    console.log("Manage Subscription");
  }

  return {
    subscription,
    currentPlan,
    availablePlans,
    comparisonPlans,
    upgradePlan,
    manageSubscription,
  };
}
