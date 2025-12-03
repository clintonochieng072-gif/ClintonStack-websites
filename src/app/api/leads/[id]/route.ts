// src/app/api/leads/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";
import Contact from "@/lib/models/Contact";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const updates = await req.json();

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Find and update the contact
    const contact = await Contact.findOneAndUpdate(
      { _id: id, siteId: site._id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Lead update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Find and delete the contact
    const contact = await Contact.findOneAndDelete({
      _id: id,
      siteId: site._id,
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Lead delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
