"use client";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { toast } from "sonner";
import { getUser, signOutAction } from "@/src/lib/actions/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PricingPlans from "../payment/page";
import type { Database } from "@/src/integrations/supabase/types";
import { supabase } from "@/src/integrations/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
}

interface ProductCartItem {
  product_id: string;
  quantity: number;
}

interface TransactionMetadata {
  payment_data?: {
    product_cart?: Array<{
      product_id: string;
      quantity: number;
    }>;
  };
}

type CreditHistoryItem = {
  date: string;
  amount: number;
  type: 'purchase' | 'usage';
};

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "generated", label: "Generated Images" },
  { key: "billing", label: "Billing" },
];

const Profile = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Database["public"]["Tables"]["subscription_plans"]["Row"] | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryItem[]>([]);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      try {
        const user = await getUser();
        if (user?.data) {
          setUser({
            id: user.data.id,
            email: user.data.email,
          });
          setFullName(user.data.email || "");
          setRemainingCredits(user.userData?.remaining_credits || 0);
        }
      } catch (error) {
        console.error("Error fetching user or profile:", error);
        toast.error("Error fetching user or profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProfile();
  }, []);

  // Fetch current plan based on latest transaction
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user?.id) return;
      
      try {
        // Get the latest successful transaction
        const { data: latestTransaction, error: transactionError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "succeeded")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (transactionError) {
          console.error("Error fetching transaction:", transactionError);
          return;
        }

        if (latestTransaction?.metadata && 
            typeof latestTransaction.metadata === 'object' && 
            !Array.isArray(latestTransaction.metadata) &&
            'payment_data' in latestTransaction.metadata) {
          const metadata = latestTransaction.metadata as Record<string, unknown>;
          const paymentData = metadata.payment_data as { product_cart?: ProductCartItem[] };
          const productCart = paymentData?.product_cart?.[0];
          
          if (productCart?.product_id) {
            // Find the corresponding plan
            const { data: plan, error: planError } = await supabase
              .from("subscription_plans")
              .select("*")
              .eq("dodo_product_id", productCart.product_id)
              .single();

            if (planError) {
              console.error("Error fetching plan:", planError);
              return;
            }

            setCurrentPlan(plan);
          }
        }
      } catch (error) {
        console.error("Error in fetchCurrentPlan:", error);
      }
    };

    fetchCurrentPlan();
  }, [user?.id]);

  // Fetch generated images for this user (via API route)
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/fetchimagelist");
        if (!res.ok) throw new Error("Failed to fetch images");
        const { images } = await res.json();
        setGeneratedImages(images);
      } catch (error) {
        toast.error("Error fetching generated images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Fetch credit history
  useEffect(() => {
    const fetchCreditHistory = async () => {
      if (!user?.id) return;
      
      try {
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        const history = transactions.map(t => ({
          date: t.created_at,
          amount: (t.metadata as TransactionMetadata)?.payment_data?.product_cart?.[0]?.quantity || 0,
          type: 'purchase' as const
        }));

        // Add usage history from generated images
        const { data: images, error: imagesError } = await supabase
          .from("generated_images")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!imagesError && images) {
          const usageHistory = images
            .filter(img => img.created_at !== null)
            .map(img => ({
              date: img.created_at as string,
              amount: 1,
              type: 'usage' as const
            }));
          history.push(...usageHistory);
        }

        // Sort by date
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCreditHistory(history);
      } catch (error) {
        console.error("Error fetching credit history:", error);
      }
    };

    fetchCreditHistory();
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-illustration-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4">
        <div className="mb-8 flex items-center justify-center">
          <IllustrationLogo small />
        </div>
        <nav className="flex flex-col gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`text-left px-4 py-2 rounded font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-illustration-accent/10 text-illustration-accent"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              await signOutAction();
              router.push("/login");
            }}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-8 lg:px-16">
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Your Profile
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-illustration-accent/10 rounded-full flex items-center justify-center text-illustration-accent text-2xl font-bold">
                  {fullName
                    ? fullName.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-semibold">
                    {fullName || "User"}
                  </h2>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Credit Display */}
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Credits</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/payment")}
                  >
                    Buy More Credits
                  </Button>
                </div>
                
                <div className="bg-illustration-accent/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Available Credits</span>
                    <span className="text-2xl font-bold text-illustration-accent">{remainingCredits}</span>
                  </div>
                  
                  {currentPlan && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Monthly Plan Limit</span>
                        <span>{currentPlan.token_limit} credits</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-illustration-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((remainingCredits / currentPlan.token_limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Credit History */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-900">Recent Activity</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-illustration-accent hover:text-illustration-accent/80"
                      onClick={() => router.push("/payment")}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100">
                    {creditHistory.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No recent activity
                      </div>
                    ) : (
                      creditHistory.map((item, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                item.type === 'purchase' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-illustration-accent/10 text-illustration-accent'
                              }`}>
                                {item.type === 'purchase' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.type === 'purchase' ? 'Credit Purchase' : 'Image Generation'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(item.date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`text-sm font-semibold ${
                                item.type === 'purchase' ? 'text-green-600' : 'text-illustration-accent'
                              }`}>
                                {item.type === 'purchase' ? '+' : '-'}{item.amount} credits
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "generated" && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Generated Images
            </h1>
            <div className="bg-white rounded-lg shadow p-6 min-h-[200px]">
              {loading ? (
                <div className="flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              ) : generatedImages.length === 0 ? (
                <div className="flex items-center justify-center text-gray-400">
                  No generated images to display.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((img) => (
                    <div
                      key={img.id}
                      className="rounded border p-2 flex flex-col items-center bg-gray-50"
                    >
                      <Image
                        src={img.publicUrl}
                        width={128}
                        height={128}
                        alt={img.prompt || "Generated image"}
                        className="w-full h-32 object-cover rounded mb-2"
                        loading="lazy"
                      />
                      <div
                        className="text-xs text-gray-600 truncate w-full text-center"
                        title={img.prompt}
                      >
                        {img.prompt}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(img.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Billing & Subscription
            </h1>

            {/* Current Plan Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
              {currentPlan ? (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-illustration-accent/5 rounded-lg">
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900">{currentPlan.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600">${(currentPlan.price / 100).toFixed(2)}/month</p>
                      <p className="text-sm text-gray-500">{currentPlan.token_limit} credits included</p>
                      <p className="text-sm text-gray-500">Remaining: {remainingCredits} credits</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/payment")}
                    >
                      Change Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active subscription</p>
                  <Button onClick={() => router.push("/payment")}>
                    Choose a Plan
                  </Button>
                </div>
              )}
            </div>

            {/* <PricingPlans hideHeader={true} /> */}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
