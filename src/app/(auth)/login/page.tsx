"use client";
import { Input } from "@/src/components/ui/input";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Label } from "@/src/components/ui/label";
import { supabase } from "@/src/integrations/supabase/client"; // Import Supabase client
import { Button } from "@/src/components/ui/button";
import { ThreeDMarquee } from "@/src/components/GridMotion";
import { signInAction } from "@/src/lib/actions/auth";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailkey = searchParams?.get("email") || "";

  const [isSubmitting, setIsSubmitting] = useState(false); // Define setIsSubmitting

  useEffect(() => {
    const checkLoginUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from("users")
          .select("id")
          .eq("email", emailkey);

        if (error) {
          toast.error(error.message);
          return;
        }

        router.push("/");
      } else {
        router.push("/login");
      }
    };
    checkLoginUser();
  }, [emailkey, router]); // Add missing dependencies

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
  } = form;

  const onSubmit = async (data: { email: string }) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);

      console.log("formData", formData);
      
      await signInAction(formData);

      // Redirect to verify OTP with email parameter
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      toast.success("Login code sent to your email");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background */}
      <ThreeDMarquee
        images={[
          "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
          "https://assets.aceternity.com/animated-modal.png",
          "https://assets.aceternity.com/animated-testimonials.webp",
          "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
          "https://assets.aceternity.com/github-globe.png",
          "https://assets.aceternity.com/glare-card.png",
          "https://assets.aceternity.com/layout-grid.png",
          "https://assets.aceternity.com/flip-text.png",
          "https://assets.aceternity.com/hero-highlight.png",
          "https://assets.aceternity.com/carousel.webp",
          "https://assets.aceternity.com/placeholders-and-vanish-input.png",
          "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
          "https://assets.aceternity.com/signup-form.png",
          "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
          "https://assets.aceternity.com/spotlight-new.webp",
          "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
          "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
          "https://assets.aceternity.com/tabs.png",
          "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
          "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
          "https://assets.aceternity.com/glowing-effect.webp",
          "https://assets.aceternity.com/hover-border-gradient.png",
          "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
          "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
          "https://assets.aceternity.com/macbook-scroll.png",
          "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
          "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
          "https://assets.aceternity.com/multi-step-loader.png",
          "https://assets.aceternity.com/vortex.png",
          "https://assets.aceternity.com/wobble-card.png",
          "https://assets.aceternity.com/world-map.webp",
        ]}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-background/40 z-5" />

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center h-full w-full px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl dark:bg-[#0e0e0e]/80 border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <IllustrationLogo />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-illustration-accent hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
