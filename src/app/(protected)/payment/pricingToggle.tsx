import { useState } from "react";
import { cn } from "@/src/lib/utils";

interface PricingToggleProps {
  onPeriodChange: (period: "monthly" | "yearly") => void;
}

const PricingToggle = ({ onPeriodChange }: PricingToggleProps) => {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const handlePeriodChange = (newPeriod: "monthly" | "yearly") => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  return (
    <div className="inline-flex items-center p-1 bg-muted rounded-lg mb-8">
      <button
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer",
          period === "yearly"
            ? "text-muted-foreground"
            : "bg-white text-primary shadow-sm"
        )}
        onClick={() => handlePeriodChange("monthly")}
      >
        Monthly
      </button>
      <button
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer",
          period === "monthly"
            ? "text-muted-foreground"
            : "bg-white text-primary shadow-sm"
        )}
        onClick={() => handlePeriodChange("yearly")}
      >
        Yearly (Save 20%)
      </button>
    </div>
  );
};

export default PricingToggle;