"use client";

import React from "react";
import CS from "world-countries";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CountryDropdown,
  Country,
} from "../../../components/ui/country-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

const formSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().nonempty("City name is required"),
  state: z.string().nonempty("State/Province is required"),
  country: z.string().nonempty("Please select a country"),
  zipcode: z.string().regex(/^\d{6}$/, "Postal code must be exactly 6 digits"),
});

type FormValues = z.infer<typeof formSchema>;

interface BillingDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  planId?: string | null;
  existingBillingData?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  } | null;
}

const getCountriesMap = () => {
  return CS.map(
    (country) =>
      ({
        alpha2: country.cca2,
        alpha3: country.cca3,
        name: country.name.common,
        countryCallingCodes: [],
        currencies: Object.keys(country.currencies || {}),
        ioc: country.cioc || "",
        languages: Object.keys(country.languages || {}),
        status: "assigned",
      } as Country)
  ).filter((country) => country.name && country.alpha2);
};

export default function BillingDetailsDialog({
  open,
  onClose,
  planId,
  existingBillingData,
}: BillingDetailsDialogProps) {
  const countriesList = getCountriesMap();
  const [loading, setLoading] = React.useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingBillingData || {
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      // Call billing details API with planId
      const response = await fetch("/api/billing-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingData: values, planId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Billing details submitted!");
        window.location.href = result?.data.paymentLink;
        setLoading(false);
        onClose();
      } else {
        toast.error(result.error || "Failed to process billing details.");
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Billing details error:", error);
      toast.error("Failed to process billing details.");
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (existingBillingData) {
      form.reset(existingBillingData);
    }
  }, [existingBillingData, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Billing Details
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="street"
              render={({ field }: { field: ControllerRenderProps<FormValues, "street"> }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }: { field: ControllerRenderProps<FormValues, "city"> }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }: { field: ControllerRenderProps<FormValues, "state"> }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipcode"
              render={({ field }: { field: ControllerRenderProps<FormValues, "zipcode"> }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }: { field: ControllerRenderProps<FormValues, "country"> }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <CountryDropdown
                      options={countriesList}
                      onChange={(country: Country) =>
                        field.onChange(country.alpha2)
                      }
                      defaultValue={field.value}
                      placeholder="Select a country"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 space-x-2 flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Continue to Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
