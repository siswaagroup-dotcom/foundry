"use client";

import { PlanCard } from "./PlanCard";
import type { Plan } from "./types/billing-types";

type PlansListProps = {
  plans: Plan[];
};

export function PlansList({ plans }: PlansListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[#111827]">Plan Comparison</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
