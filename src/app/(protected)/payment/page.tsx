"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/src/integrations/supabase/client";
import type { Database } from "@/src/integrations/supabase/types";
import { Check, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import BillingDetailsDialog from "./BillingDetailsDialog";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { getUser } from "@/src/lib/actions/auth";
import { useRouter } from "next/navigation";

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
        "relative group rounded-2xl border border-border p-6 transition-all hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm",
        tier.popular && "border-primary ring-2 ring-primary/30"
      )}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-fit px-4 py-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-semibold shadow-lg">
          Most Popular
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
        {tier.description && (
          <p className="mt-1 text-sm text-gray-400">{tier.description}</p>
        )}

        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-white">${price}</span>
            {originalPrice && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                ${originalPrice}
              </span>
            )}
            <span className="ml-1 text-sm text-gray-400">/month</span>
          </div>
          {billingPeriod === "yearly" && (
            <p className="text-xs text-gray-400 mt-1">Billed annually</p>
          )}
        </div>

        <ul className="mt-6 space-y-3 text-left">
          {tier.features.map((feature) => (
            <li
              key={feature.name}
              className="flex items-start text-sm text-gray-400"
            >
              <Check className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
              {feature.name}
            </li>
          ))}
        </ul>

        <Button
          onClick={tier.onSelect}
          className={cn("mt-8 w-full", tier.popular && "bg-primary text-white hover:bg-primary/90")}
          variant={tier.buttonVariant || "default"}
          disabled={disabled}
        >
          {tier.buttonText}
        </Button>
      </div>
    </div>
  );
};

interface BillingData {
  city: string;
  state: string;
  street: string;
  country: string;
  zipcode: string;
}

interface PricingPlansProps {
  hideHeader?: boolean;
}

const PricingPlans = ({ hideHeader = false }: PricingPlansProps) => {
  const [plans, setPlans] = useState<
    Database["public"]["Tables"]["subscription_plans"]["Row"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const router = useRouter();

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

    const fetchUserCredits = async () => {
      const response = await getUser();
      setUserCredits(response.userData?.remaining_credits || 0);
    };

    fetchUserCredits();
    fetchPlans();
  }, []);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const status = searchParams.get("status");

      if (status) {
        if (status === "succeeded") {
          toast.success("Payment successful!");
        } else if (status === "failed") {
          toast.error("Payment failed. Please try again.");
        }
      }
    };

    const timeoutId = setTimeout(() => {
      checkPaymentStatus();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [router]);

  const handlePlanSelection = async (planName: string) => {
    try {
      // Fetch user data from API
      const response = await fetch("/api/user");

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Please sign in to continue");
        return;
      }

      const { user, billingData } = data;

      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      setSelectedPlan(planName);
      setBillingData(billingData);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error in handlePlanSelection:", error);
      toast.error("Something went wrong");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPlan(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col bg-background text-foreground">
      {!hideHeader && (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <IllustrationLogo />
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 border border-border bg-card/50 px-4 py-2 rounded-xl shadow-lg">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-400">
                  Credits:
                </span>
                <span className="text-base font-semibold text-white">
                  {userCredits}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex-1 px-4 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-white">Choose Your Plan</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {plans.map((plan) => (
              <div key={plan.id} className="relative">
                <PricingCard
                  tier={{
                    name: plan.name,
                    monthlyPrice: plan.price / 100,
                    yearlyPrice: plan.price / 100,
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
      </div>
      <BillingDetailsDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        planId={selectedPlan}
        existingBillingData={billingData}
      />
    </div>
  );
};

export default PricingPlans;
