// src/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";
import Analytics from "@/lib/models/Analytics";

export async function GET(req: Request) {
  await connectDb();
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "7d":
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get analytics data
    const analytics = await Analytics.find({
      siteId: site._id,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    // Process data
    const totalVisits = analytics.length;
    const uniqueVisitors = new Set(analytics.map((a) => a.visitorId)).size;
    const pageViews = analytics.reduce((sum, a) => sum + (a.pageViews || 1), 0);

    // Calculate bounce rate (visits with only 1 page view)
    const bouncedVisits = analytics.filter(
      (a) => (a.pageViews || 1) === 1
    ).length;
    const bounceRate = totalVisits > 0 ? bouncedVisits / totalVisits : 0;

    // Average session duration (mock data for now)
    const avgSessionDuration = 180; // 3 minutes

    // Top pages
    const pageStats: { [key: string]: number } = {};
    analytics.forEach((a) => {
      const page = a.page || "/";
      pageStats[page] = (pageStats[page] || 0) + (a.pageViews || 1);
    });

    const topPages = Object.entries(pageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, views]) => ({
        page,
        views,
        percentage: totalVisits > 0 ? Math.round((views / pageViews) * 100) : 0,
      }));

    // Traffic sources (simplified)
    const sourceStats: { [key: string]: number } = {};
    analytics.forEach((a) => {
      const source = a.referrer ? "referral" : "direct";
      sourceStats[source] = (sourceStats[source] || 0) + 1;
    });

    const trafficSources = Object.entries(sourceStats).map(
      ([source, visits]) => ({
        source: source.charAt(0).toUpperCase() + source.slice(1),
        visits,
        percentage:
          totalVisits > 0 ? Math.round((visits / totalVisits) * 100) : 0,
      })
    );

    // Device breakdown
    const deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
    analytics.forEach((a) => {
      const device = a.deviceType || "desktop";
      if (deviceStats.hasOwnProperty(device)) {
        deviceStats[device as keyof typeof deviceStats]++;
      }
    });

    const deviceBreakdown = {
      desktop:
        totalVisits > 0
          ? Math.round((deviceStats.desktop / totalVisits) * 100)
          : 0,
      mobile:
        totalVisits > 0
          ? Math.round((deviceStats.mobile / totalVisits) * 100)
          : 0,
      tablet:
        totalVisits > 0
          ? Math.round((deviceStats.tablet / totalVisits) * 100)
          : 0,
    };

    // Daily visits
    const dailyStats: { [key: string]: number } = {};
    analytics.forEach((a) => {
      const date = a.timestamp.toISOString().split("T")[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    const dailyVisits = Object.entries(dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, visits]) => ({ date, visits }));

    const analyticsData = {
      totalVisits,
      uniqueVisitors,
      pageViews,
      bounceRate,
      avgSessionDuration,
      topPages,
      trafficSources,
      deviceBreakdown,
      dailyVisits,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
