import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { client } from "../billing-details/route";
import { createClient } from "@/src/integrations/supabase/server";

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);

interface PaymentData {
  amount?: number;
  tax?: number;
  currency?: string;
  error_message?: string;
  payment_id?: string;
  total_amount?: number;
  product_cart?: Array<{
    product_id: string;
    quantity: number;
  }>;
  metadata?: {
    userId?: string;
    planId?: string;
    subscriptionTimestamp?: string;
  };
}

interface WebhookPayload {
  type: string;
  data: {
    payload_type: string;
    payment_id: string;
  };
}

export async function POST(request: Request) {
  const headersList = await headers();
  const supabase = await createClient();

  try {
    const rawBody = await request.text();
    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };
    await webhook.verify(rawBody, webhookHeaders);
    const payload = JSON.parse(rawBody) as WebhookPayload;

    if (payload.data.payload_type === "Payment") {
      switch (payload.type) {
        case "payment.succeeded":
          const paymentDataResp = (await client.payments.retrieve(
            payload.data.payment_id
          )) as PaymentData;

          // Store successful payment data in transactions table
          const successMetadata = {
            payment_id: payload.data.payment_id,
            status: "success",
            timestamp: new Date().toISOString(),
            payment_data: paymentDataResp,
          };

          // Get user_id and product_cart from payment metadata
          const successUserId = paymentDataResp.metadata?.userId;
          const productCart = paymentDataResp?.product_cart;

          if (successUserId && productCart) {
            try {
              // Insert transaction record
              await supabase.from("transactions").insert({
                user_id: successUserId,
                amount: paymentDataResp.total_amount || 0,
                tax: 0,
                currency: paymentDataResp.currency || "USD",
                status: "succeeded",
                dodo_payment_id: paymentDataResp?.payment_id,
                metadata: successMetadata,
              });
              // Update user's remaining credits
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("remaining_credits")
                .eq("id", successUserId)
                .single();

              if (userError) {
                console.error("Failed to fetch user data:", {
                  error: userError,
                  userId: successUserId,
                });
                throw new Error(`User data fetch failed: ${userError.message}`);
              }

              if (userData) {
                const newCredits =
                  (userData.remaining_credits || 0) + productCart[0].quantity;

                const { error: updateError } = await supabase
                  .from("users")
                  .update({ remaining_credits: newCredits })
                  .eq("id", successUserId);

                if (updateError) {
                  console.error("Failed to update user credits:", {
                    error: updateError,
                    userId: successUserId,
                    newCredits,
                  });
                  throw new Error(
                    `Credit update failed: ${updateError.message}`
                  );
                }

                console.log("User credits updated successfully");
              }
            } catch (error) {
              console.error("Error processing successful payment:", error);
              // You might want to notify your error tracking service here
              throw error; // Re-throw to be caught by the outer try-catch
            }
          } else {
            console.error("Missing required data for transaction:", {
              successUserId,
              productCart,
              paymentData: paymentDataResp,
            });
            throw new Error("Missing required data for transaction processing");
          }
          break;
        case "payment.failed":
          const failedPaymentData = (await client.payments.retrieve(
            payload.data.payment_id
          )) as PaymentData;

          // Store failed payment data in transactions table
          const metadata = {
            payment_id: payload.data.payment_id,
            status: "failed",
            error_message: failedPaymentData.error_message || "Payment failed",
            timestamp: new Date().toISOString(),
            payment_data: failedPaymentData,
          };

          // Get user_id from payment metadata
          const failedUserId = failedPaymentData.metadata?.userId;

          if (failedUserId) {
            await supabase.from("transactions").insert({
              user_id: failedUserId,
              amount: failedPaymentData.amount || 0,
              tax: failedPaymentData.tax || 0,
              currency: failedPaymentData.currency || "USD",
              status: "failed",
              dodo_payment_id: payload.data.payment_id,
              metadata: metadata,
            });
          }
          break;
        default:
          break;
      }
    }
    return Response.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(" ----- webhoook verification failed -----");
    console.log(error);
    return Response.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  }
}
