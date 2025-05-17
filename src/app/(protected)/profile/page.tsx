"use client";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { toast } from "sonner";
import Link from "next/link";
import { signOutAction, getUser } from "@/src/lib/actions/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/integrations/supabase/server";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      try {
        const supabase = await createClient();

        const {
          data: { user: any },
        } = await supabase.auth.getUser();

        if (user) {
          setProfile(user);
          setFullName(user.email || "");
        }
      } catch (error: any) {
        console.error("Error fetching user or profile:", error);
        toast.error("Error fetching user or profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  // const handleUpdateProfile = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!user) return;

  //   setLoading(true);
  //   try {
  //     const { error } = await supabase
  //       .from("users")
  //       .update({
  //         full_name: fullName,
  //         updated_at: new Date().toISOString(),
  //       })
  //       .eq("id", user.id);

  //     if (error) throw error;
  //     toast.success("Profile updated successfully");
  //   } catch (error: any) {
  //     console.error("Error updating profile:", error);
  //     toast.error("Error updating profile");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="flex min-h-screen flex-col bg-illustration-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <IllustrationLogo small />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/playground">Playground</Link>
          </Button>
          <div className="border-r border-gray-200 h-6"></div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="ml-2">Profile</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => signOutAction()}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
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
                <h2 className="text-xl font-semibold">{fullName || "User"}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="bg-illustration-accent hover:bg-illustration-accent/90"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
