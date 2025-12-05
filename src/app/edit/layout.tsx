"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders(), cache: "no-store" }).then((r) =>
    r.json()
  );

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

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: siteData, error } = useSWR("/api/site/me", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 0,
  });
  const [loading, setLoading] = useState(!siteData && !error);

  useEffect(() => {
    setLoading(false);
  }, [siteData, error]);

  return (
    <SiteContext.Provider
      value={{
        site: siteData?.data || null,
        loading,
        error,
      }}
    >
      <DashboardLayout>{children}</DashboardLayout>
    </SiteContext.Provider>
  );
}
