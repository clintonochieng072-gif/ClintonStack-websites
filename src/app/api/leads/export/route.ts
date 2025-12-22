// src/app/api/leads/export/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";
import Contact from "@/lib/models/Contact";
import { escapeCSV } from "@/lib/csv";

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
    const format = searchParams.get("format") || "csv";

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Get all leads/contacts for this site
    const leads = await Contact.find({ siteId: site._id })
      .sort({ createdAt: -1 })
      .lean();

    if (format === "csv") {
      // Create CSV content
      const csvHeaders = [
        "Name",
        "Email",
        "Phone",
        "Message",
        "Status",
        "Source",
        "Created Date",
        "IP Address",
        "Referrer",
        "Notes",
      ];

      const csvRows = leads.map((lead: any) => [
        escapeCSV(lead.name),
        escapeCSV(lead.email),
        escapeCSV(lead.phone || ""),
        escapeCSV(lead.message),
        escapeCSV(lead.status),
        escapeCSV(lead.source),
        escapeCSV(new Date(lead.createdAt).toISOString().split("T")[0]),
        escapeCSV(lead.metadata?.ipAddress || ""),
        escapeCSV(lead.metadata?.referrer || ""),
        escapeCSV(lead.notes || ""),
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leads-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    } else if (format === "json") {
      // Return JSON
      return NextResponse.json({
        success: true,
        data: leads,
        total: leads.length,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid format. Use 'csv' or 'json'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Leads export error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export leads" },
      { status: 500 }
    );
  }
}
