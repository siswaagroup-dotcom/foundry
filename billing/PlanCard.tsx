"use client";

import type { Plan } from "./types/billing-types";

type PlanCardProps = {
  plan: Plan;
};

function limitText(value: Plan["limits"]["users"]) {
  return value === "unlimited" ? "Unlimited" : value;
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <p className="text-lg font-bold text-[#111827]">{plan.name}</p>
      <p className="mt-1 text-sm text-[#4b5563]">${plan.monthlyPrice}/month</p>

      <div className="mt-4 space-y-2 text-sm text-[#374151]">
        <p>Users: {limitText(plan.limits.users)}</p>
        <p>Workspaces: {limitText(plan.limits.workspaces)}</p>
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
