// src/app/api/site/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";
import jwt from "jsonwebtoken";
import User from "@/lib/models/User";

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

async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userId) return null;

    await dbConnect();
    const user = await User.findById(decoded.userId)
      .select("email onboarded username niche role")
      .lean();

    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      onboarded: user.onboarded === true,
      username: user.username,
      niche: user.niche || null,
      role: user.role || "user",
    };
  } catch (e) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if requesting all sites
    const url = new URL(request.url);
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
      return addNoCacheHeaders(NextResponse.json({ data: sites }));
    } else {
      // Return the most recently updated site with content (for backward compatibility) - optimized
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

      // First try to find a site with draft content (most recently edited)
      let site = (await Site.findOne(
        { ownerId: user.id, "userWebsite.draft": { $exists: true } },
        projection
      )
        .sort({ updatedAt: -1 })
        .lean()
        .maxTimeMS(3000)) as any;

      // If no site with draft content, get the most recently updated site
      if (!site) {
        site = (await Site.findOne({ ownerId: user.id }, projection)
          .sort({ updatedAt: -1 })
          .lean()
          .maxTimeMS(3000)) as any;
      }

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

      return addNoCacheHeaders(
        NextResponse.json({ data: { ...site, counts } })
      );
    }
  } catch (err) {
    console.error("GET /api/site/me error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
