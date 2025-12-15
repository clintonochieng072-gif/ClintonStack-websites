"use client";

import React, { createContext, useContext } from "react";

// Site Context for centralized data fetching
const SiteContext = createContext<{
  site: any;
  loading: boolean;
  error: any;
} | null>(null);

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}

export function SiteProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: { site: any; loading: boolean; error: any };
}) {
  return (
    <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
  );
}