"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";

type User = {
  id?: string;
  email?: string;
  onboarded?: boolean;
  niche?: string;
  role?: string;
  hasSites?: boolean;
  firstSiteNiche?: string | null;
  subscriptionStatus?: string;
  subscriptionType?: string | null;
  has_paid?: boolean;
  // add other safe fields you want client-side
};

type Context = {
  user: User | null;
  authLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const GlobalContext = createContext<Context | undefined>(undefined);

export default function GlobalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const { data: session, status, update } = useSession();

  const loadUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/auth/me", {
        headers,
        credentials: "include",
      });
      const json = await res.json();
      // Expect { user: null } or { user: {...} }
      if (json?.user && json.user.id) setUser(json.user);
      else setUser(null);
    } catch (err) {
      setUser(null);
    }
  };

  // Handle NextAuth session
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // NextAuth user - fetch fresh data from API
      let mounted = true;
      loadUser().finally(() => {
        if (mounted) setAuthLoading(false);
      });
      return () => {
        mounted = false;
      };
    } else {
      // Fall back to custom JWT system
      let mounted = true;
      loadUser().finally(() => {
        if (mounted) setAuthLoading(false);
      });
      return () => {
        mounted = false;
      };
    }
  }, [session, status]);

  // Listen for real-time user updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = pusherClient.subscribe(`user-${user.id}`);
    channel.bind("payment-approved", () => {
      // Refresh user data
      loadUser();
      // Refresh session
      update();
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`user-${user.id}`);
    };
  }, [user?.id, update]);

  const login = (u: User) => setUser(u);
  const logout = async () => {
    setUser(null);
    // Clear auth token and onboarding data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("onboarding_category");
    localStorage.removeItem("onboarding_niche");
    localStorage.removeItem("onboarding_template");
    // Call logout API to clear httpOnly cookie
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    }
    // Sign out from NextAuth if there's a session
    if (session) {
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <GlobalContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const c = useContext(GlobalContext);
  if (!c) throw new Error("useGlobal must be used inside GlobalProvider");
  return c;
};

// Legacy alias for backward compatibility
export const useGlobalContext = useGlobal;
