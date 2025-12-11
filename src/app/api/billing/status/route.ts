import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import Payment from "@/lib/models/Payment";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await Payment.findOne({
      $or: [
        { checkoutRequestId: transactionId },
        { providerReference: transactionId },
      ],
      userId: user.id,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Return the current payment status
    return NextResponse.json({
      success: true,
      data: {
        transactionId: payment.checkoutRequestId || payment.providerReference,
        status: payment.status,
        amount: payment.amount,
        phoneNumber: payment.phoneNumber,
        planType: payment.planType,
      },
    });
  } catch (error: any) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
