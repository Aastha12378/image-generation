"use client";
import { Input } from "@/src/components/ui/input";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Label } from "@/src/components/ui/label";
import { supabase } from "@/src/integrations/supabase/client"; // Import Supabase client
import { Button } from "@/src/components/ui/button";
import { GridMotion } from "@/src/components/GridMotion";
import Image from "next/image";
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
        const { data: user, error } = await supabase
          .from("users")
          .select("id")
          .eq("email", emailkey); // Use session.user.email

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
  }, []); // Add router as dependency

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    <div className="flex min-h-screen bg-illustration-background">
      {/* Left side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <IllustrationLogo />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form  onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
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
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
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

      {/* Right side - Illustration */}
      <div className="h-screen lg:w-1/2 bg-black">
        <GridMotion
          items={[
            "Item 1",
            <div key="jsx-item-1">dfggdg</div>,
            "images/ai-gen.svg",
            "Item 2",
            <div key="jsx-item-2">Custom JSX Content</div>,
            "Item 4",
            <div key="jsx-item-2">Custom JSX Content</div>,
            "images/ai-gen.svg",
            "Item 5",
            <div key="jsx-item-2">Custom JSX Content</div>,
            <Image src={"images/ai-gen.svg"} width={50} height={50} alt="ai" />,
            <div key="jsx-item-2">Custom JSX Content</div>,
            "images/ai-gen.svg",
            "Item 8",
            <div key="jsx-item-2">Custom JSX Content</div>,
            "Item 10",
            <div key="jsx-item-3">Custom JSX Content</div>,
            "images/ai-gen.svg",
            "Item 11",
            <div key="jsx-item-2">Custom JSX Content</div>,
            "Item 13",
            <div key="jsx-item-4">Custom JSX Content</div>,
            "images/ai-gen.svg",
            "Item 14",
          ]}
          gradientColor="hsl(var(--brand-foreground))"
          className="opacity-75"
        />
      </div>
    </div>
  );
};

export default Login;
