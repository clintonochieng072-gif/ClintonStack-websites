// src/app/api/site/preview/[slug]/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";

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
              ? block.data.list
              : Array.isArray(block.data?.properties)
              ? block.data.properties
              : [],
          },
        };
      default:
        return block;
    }
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDb();
  const { slug } = await params;
  const user = await getUserFromToken();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await Site.findOne({ slug, ownerId: user.id });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  console.log("Preview API - Raw site from DB:", {
    userWebsite: site.userWebsite,
    integrations: site.integrations,
  });

  // Return site with full userWebsite object for preview
  const siteObj = site.toObject();

  // Ensure userWebsite exists and has data and integrations
  siteObj.userWebsite = {
    ...site.userWebsite,
    data: site.userWebsite?.draft || {},
  };
  siteObj.integrations = site.integrations || {};

  const draftData = siteObj.userWebsite.data;

  // Convert flat data structure to blocks array if needed
  if (!draftData.blocks) {
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
    draftData.blocks = Object.entries(draftData)
      .filter(([key]) => blockTypes.includes(key))
      .map(([type, data]) => ({ type, data }));
  }

  console.log(
    "Preview API - Final siteObj.integrations:",
    siteObj.integrations
  );

  // Normalize blocks to ensure proper data structure
  if (siteObj.userWebsite.data?.blocks) {
    siteObj.userWebsite.data.blocks = normalizeSite(
      siteObj.userWebsite.data.blocks
    );
  }

  // Fetch and include published properties for this site owner
  const Property = (await import("@/lib/models/Property")).default;
  const properties = await Property.find({
    userId: site.ownerId,
    isPublished: true,
  }).sort({ createdAt: -1 });

  // Set the properties block to the fetched properties
  siteObj.userWebsite.data.blocks = siteObj.userWebsite.data.blocks || [];
  const propertiesBlockIndex = siteObj.userWebsite.data.blocks.findIndex(
    (block: any) => block.type === "properties"
  );
  const propertiesData = {
    properties: properties.map((prop) => ({
      id: prop._id.toString(),
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
  };
  if (propertiesBlockIndex >= 0) {
    siteObj.userWebsite.data.blocks[propertiesBlockIndex].data = propertiesData;
  } else {
    siteObj.userWebsite.data.blocks.push({
      type: "properties",
      data: propertiesData,
    });
  }

  // RETURN THE WHOLE SITE → THIS IS THE MOST IMPORTANT FIX
  return NextResponse.json({ data: siteObj });
}
