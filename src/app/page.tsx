// src/app/page.tsx - ClintonStack Landing Page
"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/GlobalContext";

export default function Home() {
  const router = useRouter();
  const { user, authLoading } = useGlobalContext();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Redirect authenticated users to dashboard (which will handle role-based routing)
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // User is authenticated, show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ClintonStack
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Simple website builder for your business
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </header>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ClintonStack?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Simple & Easy</h3>
              <p className="text-gray-600">
                Create professional websites in minutes. No coding or design
                skills required.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Business Focused</h3>
              <p className="text-gray-600">
                Tailored for different business types with industry-specific
                features.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Instant Publishing</h3>
              <p className="text-gray-600">
                Publish your website instantly and share it with the world.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Build Your Website?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of businesses creating stunning websites with
            ClintonStack.
          </p>
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Building Today
          </Link>
        </section>
      </div>
    </div>
  );
}
