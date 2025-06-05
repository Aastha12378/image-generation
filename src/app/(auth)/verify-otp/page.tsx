"use client";
import React, { useState, useEffect } from "react";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/src/components/ui/input-otp";
import { supabase } from "@/src/integrations/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "@/src/lib/actions/auth";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { ThreeDMarquee } from "@/src/components/GridMotion";

const VerifyOtp = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const paramemail = searchParams.get("email") as string;

  useEffect(() => {
    setEmail(paramemail);
  }, [paramemail]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Invalid OTP");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otp);

      await verifyOtp(formData);
      toast.success("Email verified successfully");
      router.push("/");
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      if (error) throw error;
      toast.success("Verification code resent successfully");
    } catch (error) {
      console.error("Failed to resend code:", error);
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
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

      {/* OTP Card */}
      <div className="relative z-10 flex items-center justify-center h-full w-full px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl dark:bg-[#0e0e0e]/80 border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <IllustrationLogo />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Verify your email
            </h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              We&apos;ve sent a verification code to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="block text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
                Enter verification code
              </Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-3">
                  <InputOTPGroup className="gap-3">
                    {[...Array(6)].map((_, idx) => (
                      <InputOTPSlot
                        key={idx}
                        index={idx}
                        className="w-12 h-14 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-center bg-white shadow-sm hover:border-blue-400"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                Please enter the 6-digit code sent to your email
              </p>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Didn&apos;t receive the code?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-illustration-accent"
                  onClick={handleResendCode}
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Resend code"}
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
