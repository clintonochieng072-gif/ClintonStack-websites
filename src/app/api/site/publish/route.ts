// src/app/api/site/publish/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const { siteId } = await req.json();
  if (!siteId)
    return NextResponse.json(
      { success: false, message: "Site ID required" },
      { status: 400 }
    );

  const site = await Site.findById(siteId);
  if (!site)
    return NextResponse.json(
      { success: false, message: "Site not found" },
      { status: 404 }
    );
  if (String(site.ownerId) !== String(user.id))
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );

  // Copy draft to published
  if (!site.userWebsite) site.userWebsite = { draft: {}, published: {} };
  site.userWebsite.published = { ...site.userWebsite.draft };
  await site.save();

  // Revalidate the public site cache
  revalidatePath(`/site/${site.slug}`);

  const liveUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/site/${site.slug}`;

  return NextResponse.json({
    success: true,
    message: "Site published successfully!",
    liveUrl,
  });
}
