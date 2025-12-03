// src/app/api/analytics/track/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import Analytics from "@/lib/models/Analytics";

export async function POST(req: Request) {
  await connectDb();

  try {
    const {
      siteSlug,
      visitorId,
      sessionId,
      page,
      referrer,
      userAgent,
      deviceType,
    } = await req.json();

    // Find the site
    const site = await Site.findOne({ slug: siteSlug });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Create or update analytics record
    const existingRecord = await Analytics.findOne({
      siteId: site._id,
      visitorId,
      sessionId,
      page,
    });

    if (existingRecord) {
      // Update page views
      existingRecord.pageViews = (existingRecord.pageViews || 1) + 1;
      existingRecord.timestamp = new Date();
      await existingRecord.save();
    } else {
      // Create new record
      const analytics = new Analytics({
        siteId: site._id,
        visitorId,
        sessionId,
        page,
        referrer,
        userAgent,
        deviceType: deviceType || "desktop",
      });
      await analytics.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}
