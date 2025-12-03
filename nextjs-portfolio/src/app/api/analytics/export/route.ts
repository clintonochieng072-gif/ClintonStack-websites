// src/app/api/analytics/export/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";
import Analytics from "@/lib/models/Analytics";

export async function GET(req: Request) {
  await connectDb();
  const user = await getUserFromToken(req as any);
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

    // Create CSV content
    const csvHeaders = [
      "Date",
      "Visitor ID",
      "Session ID",
      "Page",
      "Referrer",
      "Device Type",
      "Country",
      "City",
      "Page Views",
      "Session Duration",
    ];

    const csvRows = analytics.map((item) => [
      item.timestamp.toISOString().split("T")[0],
      item.visitorId,
      item.sessionId,
      item.page,
      item.referrer || "",
      item.deviceType,
      item.country || "",
      item.city || "",
      item.pageViews,
      item.sessionDuration || "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${range}-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Analytics export error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export analytics" },
      { status: 500 }
    );
  }
}
