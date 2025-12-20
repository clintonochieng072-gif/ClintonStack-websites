"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { getAuthHeaders } from "@/lib/utils";
import { SiteProvider } from "@/lib/siteContext";

const fetcher = (url: string) =>
  fetch(url, {
    headers: getAuthHeaders(),
    cache: "no-store",
    next: { revalidate: 0 },
  }).then((r) => r.json());

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: siteData, error } = useSWR("/api/site/me", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 0,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 0,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });
  const [loading, setLoading] = useState(!siteData && !error);

  useEffect(() => {
    setLoading(false);
  }, [siteData, error]);

  return (
    <SiteProvider
      value={{
        site: siteData?.data || null,
        loading,
        error,
      }}
    >
      {children}
    </SiteProvider>
  );
}
