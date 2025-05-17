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
import { GridMotion } from "@/src/components/GridMotion";
import Image from "next/image";
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

  // const onGoogleSignIn = () => {
  //   setGoogleSignIn(true);
  //   router.push(`/auth/google?figma=${isFigmaAuth}&writeKey=${writeKey}`);
  // }

  return (
    <div className="flex min-h-screen bg-illustration-background">
      {/* Left side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <IllustrationLogo />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start creating beautiful illustrations today
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              <p className="text-sm text-gray-600">
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

      {/* Right side - GridMotion */}
      {/* <div className="hidden lg:block lg:w-1/2">
        <GridMotion
          gradientColor="black"
          items={[
            { title: "AI Image Generation", image: "/images/ai-gen.svg", description: "Create stunning visuals" },
            { title: "Vector Graphics", image: "/images/vector.svg", description: "Scalable designs" },
            { title: "Custom Styles", image: "/images/styles.svg", description: "Multiple options" },
            { title: "SVG Output", image: "/images/svg.svg", description: "Web ready" },
            { title: "Fast Generation", image: "/images/fast.svg", description: "Quick results" },
            { title: "High Quality", image: "/images/quality.svg", description: "Professional grade" },
            { title: "Easy to Use", image: "/images/easy.svg", description: "Simple interface" },
            { title: "Multiple Formats", image: "/images/formats.svg", description: "Flexible output" },
            { title: "Customizable", image: "/images/custom.svg", description: "Tailor to needs" },
            { title: "Web Ready", image: "/images/web.svg", description: "Optimized for web" },
            { title: "Modern Design", image: "/images/modern.svg", description: "Contemporary look" },
            { title: "Professional", image: "/images/pro.svg", description: "Industry standard" },
            { title: "Creative Tools", image: "/images/tools.svg", description: "Powerful features" },
            { title: "Smart AI", image: "/images/smart.svg", description: "Intelligent generation" },
          ]}
        />

      </div> */}
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
          // items={[
          //   { title: "AI Image Generation", image: "/images/ai-gen.svg", description: "Create stunning visuals" },
          //   { title: "Vector Graphics", image: "/images/vector.svg", description: "Scalable designs" },
          //   { title: "Custom Styles", image: "/images/styles.svg", description: "Multiple options" },
          //   { title: "SVG Output", image: "/images/svg.svg", description: "Web ready" },
          //   { title: "Fast Generation", image: "/images/fast.svg", description: "Quick results" },
          //   { title: "High Quality", image: "/images/quality.svg", description: "Professional grade" },
          //   { title: "Easy to Use", image: "/images/easy.svg", description: "Simple interface" },
          //   { title: "Multiple Formats", image: "/images/formats.svg", description: "Flexible output" },
          //   { title: "Customizable", image: "/images/custom.svg", description: "Tailor to needs" },
          //   { title: "Web Ready", image: "/images/web.svg", description: "Optimized for web" },
          //   { title: "Modern Design", image: "/images/modern.svg", description: "Contemporary look" },
          //   { title: "Professional", image: "/images/pro.svg", description: "Industry standard" },
          //   { title: "Creative Tools", image: "/images/tools.svg", description: "Powerful features" },
          //   { title: "Smart AI", image: "/images/smart.svg", description: "Intelligent generation" },
          // ].slice(0, 14)}
          gradientColor="hsl(var(--brand-foreground))"
          className="opacity-75"
        />
      </div>
    </div>
  );
};

export default Register;
