import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { intaSendService } from "@/lib/intasend";
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

    // If payment is already completed (success or failed), return the status
    if (payment.status === "success" || payment.status === "failed") {
      return NextResponse.json({
        success: true,
        data: {
          transactionId: payment.checkoutRequestId,
          status: payment.status,
          amount: payment.amount,
          phoneNumber: payment.phoneNumber,
          planType: payment.planType,
        },
      });
    }

    // Otherwise, check with IntaSend for the latest status
    try {
      const verificationResult = await intaSendService.verifyPayment(transactionId);

      if (verificationResult.success && verificationResult.data) {
        const intasendStatus = verificationResult.data.status;

        // Update payment status if it has changed
        if (intasendStatus !== payment.status) {
          await Payment.findByIdAndUpdate(payment._id, {
            status: intasendStatus === "COMPLETE" ? "success" :
                   intasendStatus === "FAILED" ? "failed" : "pending",
            callbackMetadata: verificationResult.data,
            updatedAt: new Date(),
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            transactionId: verificationResult.data.transaction_id,
            status: intasendStatus === "COMPLETE" ? "success" :
                   intasendStatus === "FAILED" ? "failed" : "pending",
            amount: verificationResult.data.amount,
            phoneNumber: verificationResult.data.phone_number,
            planType: payment.planType,
          },
        });
      } else {
        // If verification fails, return current payment status
        return NextResponse.json({
          success: true,
          data: {
            transactionId: payment.checkoutRequestId,
            status: payment.status,
            amount: payment.amount,
            phoneNumber: payment.phoneNumber,
            planType: payment.planType,
          },
        });
      }
    } catch (error) {
      console.error("Error verifying payment with IntaSend:", error);
      // Return current payment status if verification fails
      return NextResponse.json({
        success: true,
        data: {
          transactionId: payment.checkoutRequestId,
          status: payment.status,
          amount: payment.amount,
          phoneNumber: payment.phoneNumber,
          planType: payment.planType,
        },
      });
    }
  } catch (error: any) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}