"use client"
import React,{ useState, useEffect } from "react";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { toast } from "sonner"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/src/components/ui/input-otp";
import { supabase } from "@/src/integrations/supabase/client";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "@/src/lib/actions/auth";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/components/ui/label";

const otpSchema = z.object({
    otp: z.array(z.string().length(1).regex(/^\d$/)).length(6),
    email: z.string().email()
});

type OtpFormValues = z.infer<typeof otpSchema>;

const VerifyOtp = () => {
    const searchParams = useSearchParams();
const router = useRouter();
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const paramemail=searchParams.get("email") as string;
  console.log(paramemail)

  useEffect(() => {
    // Get email from location state

    // if (!searchParams.get("email")) {
    //     toast.error("No email provided");
    //   redirect("/register");
    //   return;
    // }
    setEmail(paramemail);
  }, [paramemail]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
        toast.error("Invalid OTP");
      return;
    }
    setLoading(true);
    try {
      const formData=new FormData();
      formData.append("email", email);  
      formData.append("otp", otp);

      await verifyOtp(formData);
      toast.success("Email verified successfully");
      router.push("/");
    } catch (error: any) {
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
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
    toast.success("Verification code resent successfully");
    } catch (error: any) {
      console.error("Failed to resend code:", error);
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-illustration-background">
      <div className="w-full max-w-md mx-auto flex flex-col justify-center px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <IllustrationLogo />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code
            </Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
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
  );
};

export default VerifyOtp;
