import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDb();

    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
