// src/app/api/site/[id]/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Add no-cache headers to all responses
function addNoCacheHeaders(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "no-cache, no-store, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

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
            categories: Array.isArray(block.data?.categories)
              ? block.data.categories.map((cat: any) =>
                  JSON.parse(JSON.stringify(cat))
                )
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = { id: session.user.id };
  const site = await Site.findById(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(site.ownerId) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return addNoCacheHeaders(NextResponse.json({ success: true }));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = { id: session.user.id };
  const site = await Site.findById(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(site.ownerId) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payload = await req.json();
  // expected fields: data, title, theme, published, layout, logo, integrations
  if (!site.userWebsite) site.userWebsite = { draft: {}, published: {} };

  // Allow partial updates by deep merging with existing draft
  if (payload.data) {
    site.userWebsite.draft = payload.data;
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

  // Mark the nested field as modified for Mongoose to save
  site.markModified("userWebsite.draft.blocks");

  await site.save();

  // Broadcast site update to preview
  await pusherServer.trigger(`site-${site.slug}`, "site-updated", {
    slug: site.slug,
  });

  // Return site with data set to draft for editor compatibility
  const siteObj = site.toObject();
  siteObj.data = site.userWebsite?.draft || {};

  // Normalize blocks to ensure proper data structure
  if (siteObj.data?.blocks) {
    siteObj.data.blocks = normalizeSite(siteObj.data.blocks);
  }

  // Serialize to plain objects to avoid Mongoose document issues
  const serializedSiteObj = JSON.parse(JSON.stringify(siteObj));

  return addNoCacheHeaders(NextResponse.json({ data: serializedSiteObj }));
}
