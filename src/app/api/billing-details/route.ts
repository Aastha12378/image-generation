import { createClient } from "@/src/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ensureCustomer, getPaymentLink } from "./utils";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { billingData, planId } = body;
    
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

    const dodoCustomerId = await ensureCustomer(userData);

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
    console.error("Error in billing details route:", error);
    return NextResponse.json(
      { error: "Failed to save billing details" },
      { status: 500 }
    );
  }
}
