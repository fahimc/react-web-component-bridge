import React, { memo } from "react";

type PricingCardProps = {
  plan?: string;
  price?: number;
  featured?: boolean;
  onChoose?: (plan: string) => void;
};

export const PricingCard = memo(function PricingCard({
  plan = "Pro",
  price = 29,
  featured = false,
  onChoose
}: PricingCardProps) {
  return (
    <article className="pricing-card" data-featured={featured}>
      <p>{featured ? "Recommended" : "Plan"}</p>
      <h3>{plan}</h3>
      <strong>${price}/mo</strong>
      <button onClick={() => onChoose?.(plan)}>Choose {plan}</button>
    </article>
  );
});
