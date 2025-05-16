import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export interface Feature {
  name: string;
}

export interface PricingTier {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  features: Feature[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary";
  popular?: boolean;
  onSelect: () => void;
}

interface PricingCardProps {
  tier: PricingTier;
  billingPeriod: "monthly" | "yearly";
}

const PricingCard = ({ tier, billingPeriod }: PricingCardProps) => {
  const price = billingPeriod === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
  const originalPrice = billingPeriod === "yearly" ? tier.monthlyPrice : null;

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md",
        tier.popular ? "border-primary ring-2 ring-primary ring-opacity-60" : ""
      )}
    >
      {tier.popular && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary py-1 text-center text-xs font-semibold text-primary-foreground">
          Most Popular
        </div>
      )}

      <div className="relative">
        <h3 className="text-xl font-semibold">{tier.name}</h3>
        {tier.description && (
          <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
        )}

        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">${price}</span>
            {originalPrice && (
              <span className="ml-2 text-lg text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
            <span className="ml-1 text-sm text-muted-foreground">
              /month
            </span>
          </div>
          {billingPeriod === "yearly" && <p className="text-xs text-muted-foreground mt-1">Billed annually</p>}
        </div>

        <ul className="mt-6 space-y-3">
          {tier.features.map((feature) => (
            <li key={feature.name} className="flex items-start">
              <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm">{feature.name}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={tier.onSelect}
          className={cn("mt-8 w-full", tier.popular ? "bg-primary" : "")}
          variant={tier.buttonVariant || "default"}
        >
          {tier.buttonText}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;