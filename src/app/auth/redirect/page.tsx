"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RedirectPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      // No session, redirect to login
      router.push("/auth/login");
      return;
    }

    const roleParam = searchParams.get("role");
    const { role, onboarded, id } = session.user as any;

    // If role param is affiliate and current role is not, update user role
    if (roleParam === "affiliate" && role !== "affiliate") {
      fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "affiliate" }),
      })
        .then(() => {
          // Update session
          update({ role: "affiliate" });
          router.push("/dashboard/affiliate");
        })
        .catch((err) => {
          console.error("Failed to update role:", err);
          router.push("/dashboard/affiliate");
        });
      return;
    }

    if (role === "affiliate") {
      router.push("/dashboard/affiliate");
    } else if (role === "client" && !onboarded) {
      router.push("/onboarding/niches");
    } else {
      router.push("/dashboard");
    }
  }, [session, status, router, searchParams, update]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
