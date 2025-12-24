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
              ? block.data.list.map((prop: any) => ({ ...prop }))
              : Array.isArray(block.data?.properties)
              ? block.data.properties.map((prop: any) => ({ ...prop }))
              : [],
            properties: Array.isArray(block.data?.properties)
              ? block.data.properties.map((prop: any) => ({ ...prop }))
              : Array.isArray(block.data?.list)
              ? block.data.list.map((prop: any) => ({ ...prop }))
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
    const siteDoc = (await Site.findOne({
      slug,
      published: true,
    }).lean()) as any;

    if (!siteDoc) return null;

    // Start with published data
    const publishedData = (siteDoc as any).publishedWebsite?.data || {};

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

    // Use blocks as is to avoid data processing issues
    // if (publishedData.blocks) {
    //   publishedData.blocks = normalizeSite(publishedData.blocks);
    // }

    // For public site, use the properties from publishedWebsite.data.blocks
    // (already copied from draft.blocks during publish)
    // No need to fetch from Property collection - public site shows published content

    // Create a completely plain object manually
    const plainSite = {
      _id: siteDoc._id.toString(),
      ownerId:
        typeof siteDoc.ownerId === "string"
          ? siteDoc.ownerId
          : siteDoc.ownerId.toString(),
      slug: siteDoc.slug,
      niche: siteDoc.niche,
      title: siteDoc.title,
      published: siteDoc.published,
      layout: siteDoc.layout,
      propertyTypes: Array.isArray(siteDoc.propertyTypes)
        ? siteDoc.propertyTypes.map((pt: any) =>
            typeof pt === "string" ? pt : pt.toString()
          )
        : [],
      createdAt: siteDoc.createdAt?.toISOString(),
      updatedAt: siteDoc.updatedAt?.toISOString(),
      integrations: siteDoc.publishedWebsite?.integrations || {
        phoneNumber: siteDoc.integrations?.phoneNumber || "",
        whatsappNumber: siteDoc.integrations?.whatsappNumber || "",
        tawkToId: siteDoc.integrations?.tawkToId || "",
        crispId: siteDoc.integrations?.crispId || "",
        googleAnalyticsId: siteDoc.integrations?.googleAnalyticsId || "",
        googleTagManagerId: siteDoc.integrations?.googleTagManagerId || "",
        metaPixelId: siteDoc.integrations?.metaPixelId || "",
        mailchimpApiKey: siteDoc.integrations?.mailchimpApiKey || "",
        mailchimpListId: siteDoc.integrations?.mailchimpListId || "",
        brevoApiKey: siteDoc.integrations?.brevoApiKey || "",
        googleMapsApiKey: siteDoc.integrations?.googleMapsApiKey || "",
        customScript: siteDoc.integrations?.customScript || "",
      },
      publishSchedule: siteDoc.publishSchedule
        ? {
            enabled: siteDoc.publishSchedule.enabled,
            frequency: siteDoc.publishSchedule.frequency,
            time: siteDoc.publishSchedule.time,
            dayOfWeek: siteDoc.publishSchedule.dayOfWeek,
            dayOfMonth: siteDoc.publishSchedule.dayOfMonth,
            lastPublished: siteDoc.publishSchedule.lastPublished?.toISOString(),
            nextPublish: siteDoc.publishSchedule.nextPublish?.toISOString(),
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

  // For preview, don't generate metadata since it's authenticated
  if (isPreview) {
    return {
      title: "Preview",
    };
  }

  const site = await getPublicSiteDirect(slug);

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  return (
    <PublicSiteContent
      site={{
        slug: site.slug,
        title: site.title,
        layout: site.layout,
        integrations: site.integrations,
        publishedWebsite: site.publishedWebsite,
      }}
    />
  );
}
