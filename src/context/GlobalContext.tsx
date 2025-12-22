"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";

type User = {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  role?: string;
  onboarded?: boolean;
  emailVerified?: boolean;
  referralCode?: string;
  clientId?: string;
  has_paid?: boolean;
  subscriptionStatus?: string;
  subscriptionType?: string | null;
  niche?: string;
  hasSites?: boolean;
  firstSiteNiche?: string | null;
  // add other safe fields you want client-side
};

type Context = {
  user: User | null;
  authLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

  // Handle NextAuth session
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // Use session data directly
      const userData = session.user as any;
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        role: userData.role,
        onboarded: userData.onboarded,
        emailVerified: userData.emailVerified,
        referralCode: userData.referralCode,
        clientId: userData.clientId,
        has_paid: userData.has_paid,
        subscriptionStatus: userData.subscriptionStatus,
        subscriptionType: userData.subscriptionType,
      });
      setAuthLoading(false);
    } else {
      // No session
      setUser(null);
      setAuthLoading(false);
    }
  }, [session, status]);

  // Listen for real-time user updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = pusherClient.subscribe(`user-${user.id}`);
    channel.bind("payment-approved", () => {
      // Refresh user data if needed
      // update(); // Commented out to prevent potential loops
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`user-${user.id}`);
    };
  }, [user?.id]);

  const login = (u: User) => setUser(u);
  const logout = async () => {
    setUser(null);
    // Clear onboarding data
    localStorage.removeItem("onboarding_category");
    localStorage.removeItem("onboarding_niche");
    localStorage.removeItem("onboarding_template");
    // Sign out from NextAuth
    await signOut({ callbackUrl: "/auth/login" });
  };

  const refreshUser = async () => {
    // Refresh session to get updated user data
    await update();
  };

  return (
    <GlobalContext.Provider
      value={{ user, authLoading, login, logout, refreshUser }}
    >
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
