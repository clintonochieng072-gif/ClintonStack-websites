// src/app/site/[slug]/page.tsx
import { Metadata } from "next";
import { getPreviewSite } from "@/lib/getPreviewSite";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import PublicSiteContent from "@/components/public/PublicSiteContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;


function normalizeSite(blocks: any[]) {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((block) => {
    switch (block.type) {
      case "services":
        return {
          ...block,
          data: {
            ...block.data,
            services: Array.isArray(block.data?.services)
              ? block.data.services
              : [],
            items: Array.isArray(block.data?.items) ? block.data.items : [],
          },
        };
      case "gallery":
        return {
          ...block,
          data: {
            ...block.data,
            images: Array.isArray(block.data?.images) ? block.data.images : [],
            photos: Array.isArray(block.data?.photos) ? block.data.photos : [],
          },
        };
      case "testimonials":
        return {
          ...block,
          data: {
            ...block.data,
            testimonials: Array.isArray(block.data?.testimonials)
              ? block.data.testimonials
              : [],
            items: Array.isArray(block.data?.items) ? block.data.items : [],
          },
        };
      case "contact":
        return {
          ...block,
          data: {
            ...block.data,
            email: block.data?.email || "",
            phone: block.data?.phone || "",
            address: block.data?.address || "",
          },
        };
      case "hero":
        return {
          ...block,
          data: {
            ...block.data,
            title: block.data?.title || "",
            subtitle: block.data?.subtitle || "",
            ctaText: block.data?.ctaText || "",
            heroImage: block.data?.heroImage || "",
          },
        };
      case "properties":
        return {
          ...block,
          data: {
            ...block.data,
            list: Array.isArray(block.data?.list)
              ? block.data.list.map((prop: any) =>
                  JSON.parse(JSON.stringify(prop))
                )
              : Array.isArray(block.data?.properties)
              ? block.data.properties.map((prop: any) =>
                  JSON.parse(JSON.stringify(prop))
                )
              : [],
            properties: Array.isArray(block.data?.properties)
              ? block.data.properties.map((prop: any) =>
                  JSON.parse(JSON.stringify(prop))
                )
              : Array.isArray(block.data?.list)
              ? block.data.list.map((prop: any) =>
                  JSON.parse(JSON.stringify(prop))
                )
              : [],
          },
        };
      default:
        return block;
    }
  });
}

async function getPublicSiteDirect(slug: string) {
  try {
    await connectDb();
    const site = await Site.findOne({ slug, published: true });

    if (!site) return null;

    // Start with published data
    const publishedData = site.publishedWebsite?.data || {};
    console.log("PUBLIC DATA:", publishedData);

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

    // Normalize blocks to ensure proper data structure
    if (publishedData.blocks) {
      publishedData.blocks = normalizeSite(publishedData.blocks);
    }

    // For public site, use the properties from publishedWebsite.data.blocks
    // (already copied from draft.blocks during publish)
    // No need to fetch from Property collection - public site shows published content

    // Create a completely plain object manually
    const plainSite = {
      _id: site._id.toString(),
      ownerId:
        typeof site.ownerId === "string"
          ? site.ownerId
          : site.ownerId.toString(),
      slug: site.slug,
      niche: site.niche,
      title: site.title,
      published: site.published,
      layout: site.layout,
      propertyTypes: Array.isArray(site.propertyTypes)
        ? site.propertyTypes.map((pt: any) =>
            typeof pt === "string" ? pt : pt.toString()
          )
        : [],
      createdAt: site.createdAt?.toISOString(),
      updatedAt: site.updatedAt?.toISOString(),
      integrations: {
        phoneNumber: site.integrations?.phoneNumber || "",
        whatsappNumber: site.integrations?.whatsappNumber || "",
        tawkToId: site.integrations?.tawkToId || "",
        crispId: site.integrations?.crispId || "",
        googleAnalyticsId: site.integrations?.googleAnalyticsId || "",
        googleTagManagerId: site.integrations?.googleTagManagerId || "",
        metaPixelId: site.integrations?.metaPixelId || "",
        mailchimpApiKey: site.integrations?.mailchimpApiKey || "",
        mailchimpListId: site.integrations?.mailchimpListId || "",
        brevoApiKey: site.integrations?.brevoApiKey || "",
        googleMapsApiKey: site.integrations?.googleMapsApiKey || "",
        customScript: site.integrations?.customScript || "",
      },
      publishSchedule: site.publishSchedule
        ? {
            enabled: site.publishSchedule.enabled,
            frequency: site.publishSchedule.frequency,
            time: site.publishSchedule.time,
            dayOfWeek: site.publishSchedule.dayOfWeek,
            dayOfMonth: site.publishSchedule.dayOfMonth,
            lastPublished: site.publishSchedule.lastPublished?.toISOString(),
            nextPublish: site.publishSchedule.nextPublish?.toISOString(),
          }
        : { enabled: false, frequency: "daily", time: "09:00" },
      // ADD THIS:
      publishedWebsite: {
        data: publishedData,
      },
    };

    return plainSite;
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

  const seo = site.publishedWebsite?.data?.seo || {};
  const title = seo.title || site.title || "ClintonStack Site";
  const description =
    seo.description ||
    site.publishedWebsite?.data?.description ||
    "Professional real estate website";
  const heroImage = site.publishedWebsite?.data?.blocks?.find(
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
  // Public site always shows published data, never draft/preview
  const site = await getPublicSiteDirect(slug);

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

  // Check if site is published
  if (!site.published) {
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
