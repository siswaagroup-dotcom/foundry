"use client";

import { CurrentPlanCard } from "./CurrentPlanCard";
import { PlansList } from "./PlansList";
import { SubscriptionInfo } from "./SubscriptionInfo";
import { useBilling } from "./hooks/useBilling";

export function BillingPage() {
  const billing = useBilling();

  return (
    <main className="min-h-screen bg-[#f7f8ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[920px] space-y-5">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-[#1f2933]">
            Billing & Subscription
          </h1>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <CurrentPlanCard
            plan={billing.currentPlan}
            onUpgrade={billing.upgradePlan}
          />
          <SubscriptionInfo
            subscription={billing.subscription}
            onManageSubscription={billing.manageSubscription}
          />
        </div>

        <PlansList plans={billing.comparisonPlans} />
      </div>
    </main>
  );
}
