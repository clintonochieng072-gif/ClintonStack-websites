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
    integrations: site.userWebsite?.integrations,
  });

  // Return site with full userWebsite object for preview
  const siteObj = site.toObject();

  // Ensure userWebsite exists and has data and integrations
  siteObj.userWebsite = {
    ...site.userWebsite,
    data: site.userWebsite?.draft || {},
    integrations: site.userWebsite?.integrations || {},
  };

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
    "Preview API - Final siteObj.userWebsite.integrations:",
    siteObj.userWebsite.integrations
  );

  // Normalize blocks to ensure proper data structure
  if (siteObj.userWebsite.data?.blocks) {
    siteObj.userWebsite.data.blocks = normalizeSite(
      siteObj.userWebsite.data.blocks
    );
  }

  // RETURN THE WHOLE SITE → THIS IS THE MOST IMPORTANT FIX
  return NextResponse.json({ data: siteObj });
}
