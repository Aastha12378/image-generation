"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { signUpAction } from "@/src/lib/actions/auth";
import { Button } from "@/src/components/ui/button";
import { ThreeDMarquee } from "@/src/components/GridMotion";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

const signUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});
type SignUpFormValues = z.infer<typeof signUpSchema>;

const Register = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {      
      await signUpAction(data.email);

      // Redirect to verify OTP with email parameter
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
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

      {/* Register Form */}
      <div className="relative z-10 flex items-center justify-center h-full w-full px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl dark:bg-[#0e0e0e]/80 border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <IllustrationLogo />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Start creating beautiful illustrations today
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                placeholder="you@example.com"
                required
                className="w-full"
                {...register("email")}
                aria-invalid={!!errors.email}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending Code..." : "Send Code"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-illustration-accent hover:underline"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
