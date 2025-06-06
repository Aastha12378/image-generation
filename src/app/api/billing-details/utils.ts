import { createClient } from "@/src/integrations/supabase/server";
import DodoPayments from "dodopayments";
import { BillingAddress } from "dodopayments/resources";

export const client = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY_TEST!,
  environment: process.env.DODO_ENVIRONMENT as "live_mode" | "test_mode",
});

interface UserData {
  id: string;
  email: string;
  dodo_customer_id?: string;
  billing_data?: {
    city: string;
    country: string;
    state: string;
    street: string;
    zipcode: string;
  };
}

interface PaymentMetadata {
  userId: string;
  planId: string;
  subscriptionTimestamp: string;
}

export async function ensureCustomer(userData: UserData): Promise<string> {
  if (userData?.id) {
    if (!userData?.dodo_customer_id) {
      const customer = await client.customers.create({
        email: userData.email,
        name: userData.email?.split?.("@")?.[0] || "User",
      });
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
  metadata: PaymentMetadata
) {
  if (!productId) {
    throw new Error("Product ID is required");
  }
  const payment = await client.payments.create({
    billing: billingData as BillingAddress,
    customer: { customer_id: customer_id },
    product_cart: [{ product_id: productId, quantity: tokens }],
    payment_link: true,
    return_url: `${process.env.FRONTEND_URL}/payment`,
    metadata: {
      userId: metadata.userId,
      planId: metadata.planId,
      subscriptionTimestamp: metadata.subscriptionTimestamp,
    },
  });
  return payment;
} 