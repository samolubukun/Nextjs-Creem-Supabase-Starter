"use client";

import { PricingCard, type PricingPlan } from "./pricing-card";

export function PricingSection({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="space-y-12">
      <div className="grid gap-12 lg:grid-cols-3 md:grid-cols-2">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}
