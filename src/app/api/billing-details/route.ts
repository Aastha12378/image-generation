import { supabase } from "@/src/integrations/supabase/client";
import { createClient } from "@/src/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";

import DodoPayments from "dodopayments";
import { BillingAddress } from "dodopayments/resources";

const client = new DodoPayments({
  bearerToken:
    "sSnVstQzIzBDMwiu.3ensbBsA5OdA73_KvkwXI3QUSQc_cPC7cgKMOzxamk_ll6Gu",
  environment: "test_mode", // as "live_mode" | "test_mode"
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { billingData, planId } = body;
    // You may want to get the user from session/auth here
    // For now, just simulate insert
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (
      !billingData ||
      !billingData.city ||
      !billingData.country ||
      !billingData.state ||
      !billingData.street ||
      !billingData.zipcode
    ) {
      throw new Error("Missing billing data");
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userData?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!userData.billing_data) {
      await supabase
        .from("users")
        .update({ billing_data: billingData })
        .eq("id", userData.id);
    }

    const { data: selectedPlan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!selectedPlan) {
      throw new Error("Plan not found");
    }

    let dodoCustomerId = await ensureCustomer(userData);
  
    const subscription = await getPaymentLink(
      billingData,
      dodoCustomerId,
      selectedPlan.dodo_product_id,
      selectedPlan.token_limit,
      {
        userId: user.id,
        planId: selectedPlan.id,
        subscriptionTimestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Billing details saved",
      data: { paymentLink: subscription.payment_link },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save billing details" },
      { status: 500 }
    );
  }
}

export async function ensureCustomer(userData: any): Promise<string> {
  if (userData?.id) {
    if (!userData?.dodo_customer_id) {
      const customer = await client.customers.create({
        email: userData.email,
        name: userData.email?.split?.("@")?.[0] || "User",
      });
      // You need access to supabase client here, so pass it as a parameter or create it inside this function
      const supabase = await createClient();
      await supabase
        .from("users")
        .update({ dodo_customer_id: customer.customer_id })
        .eq("id", userData.id);

      return customer.customer_id;
    } else {
      return userData.dodo_customer_id;
    }
  }
  return "";
}

export async function getPaymentLink(
  billingData: {
    city: string;
    country: string;
    state: string;
    street: string;
    zipcode: string;
  },
  customer_id: string,
  productId: string,
  tokens: number,
  metadata: any
) {
  if (!productId) {
    throw new Error("Product ID is required");
  }
  const payment = await client.payments.create({
    billing: billingData as BillingAddress,
    customer: { customer_id: customer_id },
    product_cart: [{ product_id: productId, quantity: tokens }],
    payment_link: true,
    return_url: `${process.env.FRONTEND_URL}/pricing`,
    metadata,
  });
  return payment;
}
