"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/GlobalContext";

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, authLoading } = useGlobalContext();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }

      if (user.role === "affiliate") {
        router.replace("/dashboard/affiliate");
        return;
      }

      // Default to client dashboard
      router.replace("/dashboard/real-estate");
    }
  }, [authLoading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
