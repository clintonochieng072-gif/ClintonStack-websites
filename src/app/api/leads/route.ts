// src/app/api/leads/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";
import Contact from "@/lib/models/Contact";

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
    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Get all contacts/leads for this site
    const leads = await Contact.find({ siteId: site._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
