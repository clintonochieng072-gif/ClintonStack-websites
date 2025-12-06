// src/app/api/site/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

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
            properties: Array.isArray(block.data?.properties)
              ? block.data.properties
              : Array.isArray(block.data?.list)
              ? block.data.list
              : [],
            categories: Array.isArray(block.data?.categories)
              ? block.data.categories
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
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const { id } = await params;
  const user = await getUserFromToken();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const site = await Site.findById(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(site.ownerId) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Return site with data set to draft for editor compatibility
  const siteObj = site.toObject();
  siteObj.data = site.userWebsite?.draft || {};

  // Normalize blocks to ensure proper data structure
  if (siteObj.data?.blocks) {
    siteObj.data.blocks = normalizeSite(siteObj.data.blocks);
  }

  return NextResponse.json({ data: siteObj });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const { id } = await params;
  const user = await getUserFromToken();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const site = await Site.findById(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(site.ownerId) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payload = await req.json();
  // expected fields: data, title, theme, published, layout, logo, integrations
  if (!site.userWebsite) site.userWebsite = { draft: {}, published: {} };

  // Allow partial updates by deep merging with existing draft
  if (payload.data) {
    site.userWebsite.draft = deepMerge(site.userWebsite.draft, payload.data);
    site.markModified("userWebsite.draft");
  }
  site.title = payload.title ?? site.title;
  site.theme = payload.theme ?? site.theme;
  site.published = payload.published ?? site.published;
  site.layout = payload.layout ?? site.layout;
  if (payload.logo !== undefined) site.logo = payload.logo;
  if (payload.integrations) {
    site.integrations = deepMerge(
      site.integrations || {},
      payload.integrations
    );
  }

  // Sync properties into blocks
  const Property = (await import("@/lib/models/Property")).default;
  const properties = await Property.find({ siteId: site._id }).lean();

  // Update property block inside blocks
  site.userWebsite.draft.blocks = site.userWebsite.draft.blocks.map(
    (block: any) => {
      if (block.type === "properties") {
        return {
          ...block,
          data: {
            properties: properties,
          },
        };
      }
      return block;
    }
  );

  // Mark the nested field as modified for Mongoose to save
  site.markModified("userWebsite.draft.blocks");

  await site.save();

  // Broadcast site update to preview
  await pusherServer.trigger(`site-${site.slug}`, "site-updated", {
    slug: site.slug,
  });

  return NextResponse.json({ data: site });
}
