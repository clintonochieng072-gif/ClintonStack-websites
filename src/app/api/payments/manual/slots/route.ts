import { NextRequest, NextResponse } from "next/server";
import ManualPayment from "@/lib/models/ManualPayment";

export async function GET(req: NextRequest) {
  try {
    // Count approved and pending lifetime payments
    const lifetimePayments = await ManualPayment.find({
      planType: "lifetime",
      status: { $in: ["approved", "pending"] },
    });

    const remainingSlots = Math.max(0, 10 - lifetimePayments.length);

    return NextResponse.json({
      success: true,
      remainingSlots,
      totalSlots: 10,
      usedSlots: lifetimePayments.length,
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
