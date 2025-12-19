// src/app/preview/[slug]/page.tsx
"use client";
import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Head from "next/head";
import PublicSiteContent from "@/components/public/PublicSiteContent";
import FloatingButtons from "@/components/public/FloatingButtons";
import { pusherClient } from "@/lib/pusher-client";
import { getBaseUrl, getAuthHeaders } from "@/lib/utils";

export default function PreviewSite() {
  const router = useRouter();
  const params = useParams();
  const [site, setSite] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const slug = (params as { slug: string }).slug;

  useEffect(() => {
    if (!slug) return;

    const fetchSite = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/site/preview/${slug}`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setSite(json.data);
        } else {
          console.error("Preview API error:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch preview:", error);
      }
      setLoading(false);
    };

    fetchSite();

    // Also poll for updates every 5 seconds as fallback
    const interval = setInterval(fetchSite, 5000);

    return () => clearInterval(interval);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const channel = pusherClient.subscribe(`site-${slug}`);

    channel.bind("site-updated", async () => {
      // Refetch site data instantly without page refresh
      try {
        const res = await fetch(`${getBaseUrl()}/api/site/preview/${slug}`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setSite(json.data);
        }
      } catch (error) {
        console.error("Failed to refetch preview:", error);
      }
    });

    return () => {
      pusherClient.unsubscribe(`site-${slug}`);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Preview not available
          </h1>
          <p className="text-gray-600">
            You may not have permission to view this preview or the site doesn't
            exist.
          </p>
        </div>
      </div>
    );
  }

  // Reuse the same renderer as the public site
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`/site/${slug}`} />
        <title>Preview - {site.title || "ClintonStack"}</title>
      </Head>
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium">
        🔍 Preview Mode - This is not the live site
      </div>
      <PublicSiteContent site={site} />

      {/* Floating Contact Buttons */}
      <FloatingButtons
        phoneNumber={site.integrations?.phoneNumber}
        whatsappNumber={site.integrations?.whatsappNumber}
      />
    </>
  );
}
