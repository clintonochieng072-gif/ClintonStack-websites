// src/app/site/[slug]/page.tsx
import { Metadata } from "next";
import { getPreviewSite } from "@/lib/getPreviewSite";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import PublicSiteContent from "@/components/public/PublicSiteContent";

async function getPublicSiteDirect(slug: string) {
  try {
    await connectDb();
    const site = await Site.findOne({ slug, published: true });

    if (!site) return null;

    // Return site with full userWebsite object for public view
    const siteObj = site.toObject();

    // Ensure userWebsite exists and has data and integrations
    siteObj.userWebsite = {
      ...site.userWebsite,
      data: site.userWebsite?.published || {},
      integrations: site.userWebsite?.integrations || {},
    };

    const publishedData = siteObj.userWebsite.data;

    // Convert flat data structure to blocks array if needed
    if (!publishedData.blocks) {
      const blockTypes = [
        "hero",
        "about",
        "company",
        "services",
        "gallery",
        "testimonials",
        "contact",
        "listings",
        "properties",
        "agents",
        "faq",
      ];
      publishedData.blocks = Object.entries(publishedData)
        .filter(([key]) => blockTypes.includes(key))
        .map(([type, data]) => ({ type, data }));
    }

    // Fetch and include published properties for this site owner
    const Property = (await import("@/lib/models/Property")).default;
    const properties = await Property.find({
      userId: site.ownerId,
      isPublished: true,
    }).sort({ createdAt: -1 });

    // Add properties to the site's data if not already present
    const hasPropertiesBlock = publishedData.blocks?.some(
      (block: any) => block.type === "properties"
    );
    if (!hasPropertiesBlock && properties.length > 0) {
      publishedData.blocks = publishedData.blocks || [];
      publishedData.blocks.push({
        type: "properties",
        data: {
          properties: properties.map((prop) => ({
            id: prop._id,
            title: prop.title,
            description: prop.description,
            price: prop.price,
            location: prop.location,
            images: prop.images,
            features: prop.features,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area,
            status: "for-sale", // Default status
          })),
        },
      });
    }

    return siteObj;
  } catch (error) {
    console.error("Error fetching public site:", error);
    return null;
  }
}

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
    : await getPublicSiteDirect(slug);

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
    : await getPublicSiteDirect(slug);

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
