'use client'
import { useState } from "react";
import PricingToggle from "./pricingToggle";
import PricingCard, { PricingTier } from "./pricingCard";
import { toast } from "sonner";

const PricingPlans = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const handlePlanSelection = (planName: string) => {
    toast.success(`You selected the ${planName} plan`);
  };

  const pricingTiers: PricingTier[] = [
    {
      name: "Starter",
      monthlyPrice: 9,
      yearlyPrice: 7,
      features: [
        { name: "100 AI credits monthly" },
        { name: "SVG editor" },
        { name: "AI color palettes" },
        { name: "AI editing" },
        { name: "Vector export" },
        { name: "Private generation" },
        { name: "Commercial use" },
        { name: "Cancel anytime" },
      ],
      buttonText: "Get started",
      buttonVariant: "outline",
      onSelect: () => handlePlanSelection("Starter"),
    },
    {
      name: "Pro",
      monthlyPrice: 19,
      yearlyPrice: 15,
      features: [
        { name: "500 AI credits monthly" },
        { name: "SVG editor" },
        { name: "AI color palettes" },
        { name: "AI editing" },
        { name: "Vector export" },
        { name: "Private generation" },
        { name: "Commercial use" },
        { name: "Cancel anytime" },
      ],
      buttonText: "Upgrade to Pro",
      popular: true,
      onSelect: () => handlePlanSelection("Pro"),
    },
    {
      name: "Business",
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: [
        { name: "5000 AI credits monthly" },
        { name: "SVG editor" },
        { name: "AI color palettes" },
        { name: "AI editing" },
        { name: "Vector export" },
        { name: "Private generation" },
        { name: "Commercial use" },
        { name: "Cancel anytime" },
      ],
      buttonText: "Go Business",
      buttonVariant: "outline",
      onSelect: () => handlePlanSelection("Business"),
    },
  ];

  return (
    <div className="px-4 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <PricingToggle onPeriodChange={setBillingPeriod} />

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {pricingTiers.map((tier) => (
            <div key={tier.name} className="relative">
              <PricingCard tier={tier} billingPeriod={billingPeriod} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;