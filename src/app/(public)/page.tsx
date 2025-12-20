// src/app/page.tsx - ClintonStack Landing Page
"use client";
import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalContext } from "@/context/GlobalContext";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authLoading } = useGlobalContext();

  useEffect(() => {
    if (authLoading) return;

    // Handle referral tracking
    const ref = searchParams?.get("ref");
    if (ref) {
      document.cookie = `affiliate_ref=${ref}; path=/; max-age=86400`; // 24 hours
    }

    if (user) {
      // Redirect authenticated users to dashboard (which will handle role-based routing)
      router.replace("/dashboard");
    }
  }, [authLoading, user, router, searchParams]);

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            ClintonStack
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Simple website builder for your business
          </p>
          <div className="flex justify-center mb-6 sm:mb-8">
            <Link
              href="/client-signup"
              className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Build Your Website
            </Link>
          </div>
          <div className="flex justify-center">
            <Link
              href="/auth/login"
              className="px-6 sm:px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </header>

        {/* Features */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Why Choose ClintonStack?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Simple & Easy
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Create professional websites in minutes. No coding or design
                skills required.
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Business Focused
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Tailored for different business types with industry-specific
                features.
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Instant Publishing
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Publish your website instantly and share it with the world.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of businesses creating stunning websites with
            ClintonStack.
          </p>
          <div className="flex justify-center">
            <Link
              href="/client-signup"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Start Building Today
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
