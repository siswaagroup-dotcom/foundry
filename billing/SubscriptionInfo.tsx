"use client";

import { Button } from "@/components/ui/button";
import type { WorkspaceSubscription } from "./types/billing-types";

type SubscriptionInfoProps = {
  subscription: WorkspaceSubscription;
  onManageSubscription: () => void;
};

const statusLabels: Record<WorkspaceSubscription["status"], string> = {
  active: "Active",
  trial: "Trial",
  "past-due": "Past Due",
  cancelled: "Cancelled",
};

export function SubscriptionInfo({
  subscription,
  onManageSubscription,
}: SubscriptionInfoProps) {
  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Renewal Date</p>
          <h2 className="mt-1 text-xl font-bold text-[#111827]">
            {subscription.renewalDate}
          </h2>
          <p className="mt-1 text-sm text-[#4b5563]">
            {subscription.billingCycle} billing cycle
          </p>
        </div>
        <span className="inline-flex h-8 items-center rounded-full bg-orange-50 px-3 text-sm font-semibold text-primary">
          {statusLabels[subscription.status]}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4b5563]">
          Billing Status: {statusLabels[subscription.status]}
        </p>
        <Button type="button" variant="outline" onClick={onManageSubscription}>
          Manage Subscription
        </Button>
      </div>
    </article>
  );
}
