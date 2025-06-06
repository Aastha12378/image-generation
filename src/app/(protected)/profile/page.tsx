"use client";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { toast } from "sonner";
import { getUser, signOutAction } from "@/src/lib/actions/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

interface GeneratedImage {
  id: string;
  url: string;
  created_at: string;
  user_id: string;
}

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
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Database["public"]["Tables"]["subscription_plans"]["Row"] | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number>(0);

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error:unknown) {
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

        const history: CreditHistoryItem[] = transactions.map(t => ({
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
          const usageHistory: CreditHistoryItem[] = images
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
        // setCreditHistory(history);
      } catch (error) {
        console.error("Error fetching credit history:", error);
      }
    };

    fetchCreditHistory();
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col py-8 px-4">
        <div className="mb-8 flex items-center justify-center">
          <IllustrationLogo small />
        </div>
        <nav className="flex flex-col gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`text-left px-4 py-2 rounded font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-zinc-800 text-white"
                  : "hover:bg-zinc-800 text-zinc-400"
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
            className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
            <h1 className="text-3xl font-bold text-white mb-6">
              Your Profile
            </h1>
            <div className="bg-zinc-900 rounded-lg shadow-lg p-6 border border-zinc-800">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {fullName
                    ? fullName.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-semibold text-white">
                    {fullName || "User"}
                  </h2>
                  <p className="text-zinc-400">{user?.email}</p>
                </div>
              </div>

              {/* Credit Display */}
              <div className="mt-8 border-t border-zinc-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Credits</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    onClick={() => router.push("/payment")}
                  >
                    Buy More Credits
                  </Button>
                </div>
                
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">Available Credits</span>
                    <span className="text-2xl font-bold text-white">{remainingCredits}</span>
                  </div>
                  
                  {currentPlan && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-zinc-300 mb-1">
                        <span>Image Generation Limit</span>
                        <span>{remainingCredits} images remaining</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((remainingCredits / currentPlan.token_limit) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        ${(currentPlan.price / 100).toFixed(2)} for {currentPlan.token_limit} images
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "generated" && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">
              Generated Images
            </h1>
            <div className="bg-zinc-900 rounded-lg shadow-lg p-6 min-h-[200px] border border-zinc-800">
              {loading ? (
                <div className="flex items-center justify-center text-zinc-400">
                  Loading...
                </div>
              ) : generatedImages.length === 0 ? (
                <div className="flex items-center justify-center text-zinc-400">
                  No generated images to display.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((img) => (
                    <div
                      key={img.id}
                      className="rounded border border-zinc-800 p-2 flex flex-col items-center bg-zinc-800/50"
                    >
                      <Image
                        src={img.url}
                        width={128}
                        height={128}
                        alt={img.prompt || "Generated image"}
                        className="w-full h-32 object-cover rounded mb-2"
                        loading="lazy"
                      />
                      <div
                        className="text-xs text-zinc-300 truncate w-full text-center"
                        title={img.prompt}
                      >
                        {img.prompt}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
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
            <h1 className="text-3xl font-bold text-white mb-6">
              Billing & Subscription
            </h1>

            {/* Current Plan Section */}
            <div className="bg-zinc-900 rounded-lg shadow-lg p-6 mb-8 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4 text-white">Current Plan</h2>
              {currentPlan ? (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-zinc-800/50 rounded-lg">
                  <div>
                    <h3 className="text-2xl font-medium text-white">{currentPlan.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-zinc-300">${(currentPlan.price / 100).toFixed(2)}/month</p>
                      <p className="text-sm text-zinc-400">{currentPlan.token_limit} credits included</p>
                      <p className="text-sm text-zinc-400">Remaining: {remainingCredits} credits</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      onClick={() => router.push("/payment")}
                    >
                      Change Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">No active subscription</p>
                  <Button 
                    className="bg-white text-black hover:bg-zinc-200"
                    onClick={() => router.push("/payment")}
                  >
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
