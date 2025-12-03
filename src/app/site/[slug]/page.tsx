// src/app/site/[slug]/page.tsx
import { Metadata } from "next";
import { getPublicSite } from "@/lib/getPublicSite";
import { getPreviewSite } from "@/lib/getPreviewSite";
import PublicSiteContent from "@/components/public/PublicSiteContent";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "true";
  const site = isPreview
    ? await getPreviewSite(slug)
    : await getPublicSite(slug);

  if (!site) {
    return {
      title: "Site not found",
    };
  }

  const seo = site.userWebsite?.data?.seo || {};
  const title = seo.title || site.title || "ClintonStack Site";
  const description =
    seo.description ||
    site.userWebsite?.data?.description ||
    "Professional real estate website";
  const heroImage = site.userWebsite?.data?.blocks?.find(
    (b: any) => b.type === "hero"
  )?.data?.heroImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: heroImage ? [{ url: heroImage }] : [],
    },
  };
}

export default async function PublicSite({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "true";
  const site = isPreview
    ? await getPreviewSite(slug)
    : await getPublicSite(slug);

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Site not found
          </h1>
          <p className="text-gray-600">
            The site you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Check if site is published (not just preview mode)
  if (!isPreview && !site.published) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Site Not Published
          </h1>
          <p className="text-gray-600">
            This website is not yet live. Please check back later or contact the
            site owner.
          </p>
        </div>
      </div>
    );
  }

  return <PublicSiteContent site={site} />;
}
