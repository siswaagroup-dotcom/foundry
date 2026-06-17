"use client";

import { Button } from "@/components/ui/button";
import type { Plan } from "./types/billing-types";

type CurrentPlanCardProps = {
  plan: Plan;
  onUpgrade: () => void;
};

function formatLimit(value: Plan["limits"]["users"]) {
  return value === "unlimited" ? "Unlimited" : String(value);
}

export function CurrentPlanCard({ plan, onUpgrade }: CurrentPlanCardProps) {
  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Current Plan</p>
          <h2 className="mt-1 text-2xl font-bold text-[#111827]">{plan.name}</h2>
          <p className="mt-1 text-sm text-[#4b5563]">
            ${plan.monthlyPrice}/month
          </p>
        </div>
        <Button type="button" onClick={onUpgrade}>
          Upgrade Plan
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[10px] bg-[#f9fafb] p-3">
          <p className="text-xs text-[#6b7280]">User Limit</p>
          <p className="text-sm font-semibold text-[#111827]">
            {formatLimit(plan.limits.users)}
          </p>
        </div>
        <div className="rounded-[10px] bg-[#f9fafb] p-3">
          <p className="text-xs text-[#6b7280]">Workspace Limit</p>
          <p className="text-sm font-semibold text-[#111827]">
            {formatLimit(plan.limits.workspaces)}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="text-sm text-[#374151]">
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
