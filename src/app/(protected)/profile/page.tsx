'use client'
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { toast } from "sonner";
import { signOutAction } from "@/src/lib/actions/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "generated", label: "Generated Images" },
  { key: "billing", label: "Billing" },
];

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      try {
        // const supabase = await createClient();
        // const {
        //   data: { user },
        // } = await supabase.auth.getUser();
        // setUser(user);
        // setFullName(user?.email || "");
      } catch (error: any) {
        console.error("Error fetching user or profile:", error);
        toast.error("Error fetching user or profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProfile();
  }, []);

  // Fetch generated images for this user (via API route)
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/fetchimagelist");
        if (!res.ok) throw new Error("Failed to fetch images");
        const { images } = await res.json();
        setGeneratedImages(images);
      } catch (error: any) {
        toast.error("Error fetching generated images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Billing / Purchases
            </h1>
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[200px] text-gray-400">
              {/* TODO: Replace with actual billing/purchases list */}
              No billing or purchase history to display.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
