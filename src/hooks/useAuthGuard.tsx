"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";

export function useAuthGuard({ requireOnboarded = true }: { requireOnboarded?: boolean } = {}) {
  const { user, authLoading } = useGlobal();
  const router = useRouter();

  useEffect(() => {
    // Wait until authLoading is false before acting
    if (authLoading) return;

    if (!user?.id) {
      router.replace("/auth/login");
      return;
    }

    if (requireOnboarded && user.onboarded === false) {
      // If user exists but not onboarded, push to onboarding start
      router.replace("/onboarding/category");
      return;
    }
    // else: allowed to stay
  }, [authLoading, user, requireOnboarded, router]);

  return { user, authLoading };
}