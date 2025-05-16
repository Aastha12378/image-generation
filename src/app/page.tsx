import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import IllustrationLogo from "../components/IllustrationLogo";
import { createClient } from "../integrations/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <IllustrationLogo />
          <div className="flex items-center space-x-4">
            {user?.email ? (
              <span className="text-sm font-medium text-gray-700">
                {user.email}
              </span>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
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
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Create beautiful illustrations with AI
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
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
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 bg-illustration-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-illustration-accent">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Describe your idea
                </h3>
                <p className="text-gray-600">
                  Type a description of the illustration you want to create.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 bg-illustration-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-illustration-accent">
                    2
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose a style</h3>
                <p className="text-gray-600">
                  Select from various styles like Notion, Doodle, or Flat
                  design.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 bg-illustration-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-illustration-accent">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Generate & customize
                </h3>
                <p className="text-gray-600">
                  Our AI creates your illustration, and you can customize it to
                  your needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to create?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of designers, marketers, and content creators who
              use Illustration.app daily.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Create your first illustration</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <IllustrationLogo small />
              <span className="ml-2 text-sm text-gray-500">
                © 2023 Illustration.app
              </span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
