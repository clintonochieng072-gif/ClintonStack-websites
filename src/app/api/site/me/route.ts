// src/app/api/site/me/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    await connectDb();
    // @ts-ignore - NextRequest isn't being used directly; adapt if using NextRequest
    const user = await getUserFromToken(req as any);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if requesting all sites
    const url = new URL(req.url);
    const all = url.searchParams.get("all");

    if (all === "true") {
      // Return all sites for the user (lightweight)
      const sites = await Site.find(
        { ownerId: user.id },
        {
          slug: 1,
          title: 1,
          niche: 1,
          published: 1,
          updatedAt: 1,
          ownerId: 1,
        }
      )
        .sort({ createdAt: -1 })
        .lean()
        .maxTimeMS(3000);
      return NextResponse.json({ data: sites });
    } else {
      // Return the first site (for backward compatibility) - optimized
      const projection = {
        slug: 1,
        title: 1,
        niche: 1,
        published: 1,
        "userWebsite.draft.blocks": 1,
        "userWebsite.published.blocks": 1,
        updatedAt: 1,
        ownerId: 1,
      };

      const site = (await Site.findOne({ ownerId: user.id }, projection)
        .lean()
        .maxTimeMS(3000)) as any;

      if (!site) {
        return NextResponse.json({ data: null });
      }

      // Build light counts for dashboard
      const draftBlocks = site.userWebsite?.draft?.blocks || [];
      const counts = {
        services:
          draftBlocks.find((b: any) => b.type === "services")?.data?.services
            ?.length || 0,
        gallery:
          draftBlocks.find((b: any) => b.type === "gallery")?.data?.images
            ?.length || 0,
        testimonials:
          draftBlocks.find((b: any) => b.type === "testimonials")?.data
            ?.testimonials?.length || 0,
        properties:
          draftBlocks.find((b: any) => b.type === "properties")?.data
            ?.properties?.length || 0,
      };

      return NextResponse.json({ data: { ...site, counts } });
    }
  } catch (err) {
    console.error("GET /api/site/me error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
