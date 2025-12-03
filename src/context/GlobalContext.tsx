"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id?: string;
  email?: string;
  onboarded?: boolean;
  niche?: string;
  role?: string;
  hasSites?: boolean;
  firstSiteNiche?: string | null;
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

  // Restore session on app load
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        // Expect { user: null } or { user: {...} }
        if (mounted && json?.user && json.user.id) setUser(json.user);
        else if (mounted) setUser(null);
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (u: User) => setUser(u);
  const logout = () => {
    setUser(null);
    // Optionally clear local storage keys used in onboarding
    localStorage.removeItem("onboarding_category");
    localStorage.removeItem("onboarding_niche");
    localStorage.removeItem("onboarding_template");
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
