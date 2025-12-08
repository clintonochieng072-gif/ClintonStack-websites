import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { payHeroService } from "@/lib/payhero";
import Payment from "@/lib/models/Payment";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json(
        { success: false, message: "Checkout request ID is required" },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await Payment.findOne({
      checkoutRequestId,
      userId: user.id,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // If payment is already completed, return the status
    if (payment.status === "success" || payment.status === "failed") {
      return NextResponse.json({
        success: true,
        data: {
          status: payment.status,
          message:
            payment.status === "success"
              ? "Payment completed successfully"
              : "Payment failed",
        },
      });
    }

    // Check status with PayHero
    const statusResponse = await payHeroService.checkPaymentStatus(
      checkoutRequestId
    );

    if (!statusResponse.success || !statusResponse.data) {
      return NextResponse.json(
        { success: false, message: "Failed to check payment status" },
        { status: 500 }
      );
    }

    const { status, resultCode, resultDesc, callbackMetadata } =
      statusResponse.data;

    // Update payment status if it has changed
    if (status !== payment.status) {
      await Payment.findByIdAndUpdate(payment._id, {
        status,
        callbackMetadata,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        resultCode,
        resultDesc,
        message:
          status === "success"
            ? "Payment completed successfully"
            : status === "failed"
            ? "Payment failed"
            : "Payment is being processed",
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
