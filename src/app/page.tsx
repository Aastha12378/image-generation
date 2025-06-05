import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import IllustrationLogo from "../components/IllustrationLogo";
import { createClient } from "../integrations/supabase/server";
import PricingPlans from "./(protected)/payment/page";
import { BackgroundLines } from "@/src/components/BackgroundLines";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <IllustrationLogo />
          <div className="flex items-center space-x-4">
            {user?.email ? (
              <span className="text-sm font-medium text-gray-300">
                {user.email}
              </span>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white"
              >
                Sign in
              </Link>
            )}
            <Button asChild>
              <Link href="/playground">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-12 md:py-16 relative flex items-center min-h-[60vh]">
          <BackgroundLines>
            <div className="container mx-auto px-4 text-center relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Create beautiful illustrations with AI
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                Illustration.app helps you create unique, customizable
                illustrations for your projects in seconds. No design skills
                required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/playground">Try it for free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/playground">View examples</Link>
                </Button>
              </div>
            </div>
          </BackgroundLines>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm text-center border border-border">
                <div className="w-12 h-12 bg-illustration-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Describe your idea
                </h3>
                <p className="text-gray-300">
                  Type a description of the illustration you want to create.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm text-center border border-border">
                <div className="w-12 h-12 bg-illustration-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">
                    2
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Choose a style</h3>
                <p className="text-gray-300">
                  Select from various styles like Notion, Doodle, or Flat
                  design.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm text-center border border-border">
                <div className="w-12 h-12 bg-illustration-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Generate & customize
                </h3>
                <p className="text-gray-300">
                  Our AI creates your illustration, and you can customize it to
                  your needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <PricingPlans hideHeader={true} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">Ready to create?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of designers, marketers, and content creators who
              use Illustration.app daily.
            </p>
            <Button size="lg" asChild>
              <Link href="/playground">Create your first illustration</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <IllustrationLogo small />
              <span className="ml-2 text-sm text-gray-400">
                © 2023 Illustration.app
              </span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
