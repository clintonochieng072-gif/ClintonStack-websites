import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Plan from "@/lib/models/Plan";
import BillingStats from "@/lib/models/BillingStats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDb();

    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });

    // Check lifetime availability
    const billingStats = await BillingStats.findOne();
    const lifetimeAvailable = !billingStats || billingStats.lifetimeCount < billingStats.lifetimeLimit;

    return NextResponse.json({
      success: true,
      data: plans,
      lifetimeAvailable,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
