"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      // No session, redirect to login
      router.push("/auth/login");
      return;
    }

    const { role, onboarded } = session.user as any;

    if (role === "affiliate") {
      router.push("/dashboard/affiliate");
    } else if (role === "client" && !onboarded) {
      router.push("/onboarding/niches");
    } else {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
