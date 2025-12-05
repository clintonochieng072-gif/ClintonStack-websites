// src/app/preview/[slug]/page.tsx
"use client";
import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Head from "next/head";
import PublicSiteContent from "@/components/public/PublicSiteContent";
import { pusherClient } from "@/lib/pusher-client";
import { getBaseUrl } from "@/lib/utils";

export default function PreviewSite() {
  const router = useRouter();
  const params = useParams();
  const [site, setSite] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const slug = (params as { slug: string }).slug;

  useEffect(() => {
    if (!slug) return;

    const fetchSite = async () => {
      const res = await fetch(`${getBaseUrl()}/api/site/preview/${slug}`, {
        headers: {
          Cookie: "", // This will be set by the browser
        },
      });
      if (res.ok) {
        const json = await res.json();
        setSite(json.data);
      }
      setLoading(false);
    };

    fetchSite();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const channel = pusherClient.subscribe(`site-${slug}`);

    channel.bind("site-updated", () => {
      router.refresh();
    });

    return () => {
      pusherClient.unsubscribe(`site-${slug}`);
    };
  }, [slug, router]);

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
    </>
  );
}
