"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/src/integrations/supabase/client";
import type { Database } from "@/src/integrations/supabase/types";
import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import BillingDetailsDialog from "./BillingDetailsDialog";

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
  disabled?: boolean;
}

const PricingCard = ({ tier, billingPeriod, disabled }: PricingCardProps) => {
  const price =
    billingPeriod === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
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
          <p className="mt-2 text-sm text-muted-foreground">
            {tier.description}
          </p>
        )}

        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">${price}</span>
            {originalPrice && (
              <span className="ml-2 text-lg text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
            <span className="ml-1 text-sm text-muted-foreground">/month</span>
          </div>
          {billingPeriod === "yearly" && (
            <p className="text-xs text-muted-foreground mt-1">
              Billed annually
            </p>
          )}
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
          disabled={disabled}
        >
          {tier.buttonText}
        </Button>
      </div>
    </div>
  );
};

const PricingPlans = () => {
  const [plans, setPlans] = useState<
    Database["public"]["Tables"]["subscription_plans"]["Row"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) {
        toast.error("Failed to load plans");
      } else {
        setPlans(data || []);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const handlePlanSelection = async (planName: string) => {
    // Get current user
    // const {
    //   data: { user },
    //   error: userError,
    // } = await supabase.auth.getUser();
    // console.log(user, userError);

    // if (userError || !user) {
    //   toast.error("User not authenticated");
    //   return;
    // }
    // // Fetch user data from 'users' table
    // const { data: userData, error: userDataError } = await supabase
    //   .from("users")
    //   .select("billing_data")
    //   .eq("id", user.id)
    //   .single();

    // if (userDataError || !userData) {
    //   toast.error("Failed to fetch user data");
    //   return;
    // }
    // if (userData?.billing_data) {
    //   // If billing_data exists, call billing-details API
    //   const response = await fetch("/api/billing-details", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       billingData: userData.billing_data,
    //       planId: planName,
    //     }),
    //   });
    //   const result = await response.json();
    //   if (result.success && result.data?.paymentLink) {
    //     window.location.href = result.data.paymentLink;
    //     return;
    //   } else {
    //     toast.error(result.error || "Failed to process billing details.");
    //   }
    // } else {
      setSelectedPlan(planName);
      setDialogOpen(true);
    // }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPlan(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              <PricingCard
                tier={{
                  name: plan.name,
                  monthlyPrice: plan.price / 100,
                  yearlyPrice: plan.price / 100, // No yearly, just show price
                  features: [
                    { name: `${plan.token_limit} credits` },
                    { name: `Product ID: ${plan.dodo_product_id}` },
                  ],
                  buttonText: plan.is_active ? "Choose" : "Unavailable",
                  buttonVariant: plan.is_popular ? "default" : "outline",
                  popular: plan.is_popular,
                  onSelect: () => handlePlanSelection(plan.id),
                }}
                billingPeriod={"monthly"}
                disabled={!plan.is_active}
              />
            </div>
          ))}
        </div>
      </div>
      <BillingDetailsDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        planId={selectedPlan}
      />
    </div>
  );
};

export default PricingPlans;
