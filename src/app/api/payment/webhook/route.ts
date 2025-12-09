import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { intaSendService } from "@/lib/intasend";
import Payment from "@/lib/models/Payment";
import { activateSubscription } from "@/lib/db/subscription";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const signature = req.headers.get("x-intasend-signature");
    const challenge = req.headers.get("x-intasend-challenge");

    console.log("IntaSend webhook received:", JSON.stringify(body, null, 2));
    console.log("Signature:", signature);
    console.log("Challenge:", challenge);

    // Verify webhook challenge if provided
    const expectedChallenge = process.env.INTASEND_WEBHOOK_CHALLENGE;
    if (challenge && expectedChallenge && challenge !== expectedChallenge) {
      console.error("Invalid webhook challenge:", challenge);
      return NextResponse.json(
        { success: false, message: "Invalid challenge" },
        { status: 401 }
      );
    }

    // IntaSend webhook structure
    // {
    //   "state": "COMPLETE",
    //   "invoice_id": "invoice_id_here",
    //   "transaction_id": "transaction_id_here",
    //   "transaction_reference": "reference_here",
    //   "amount": 100,
    //   "currency": "KES",
    //   "phone_number": "+254712345678",
    //   "created_at": "2023-01-01T00:00:00Z",
    //   "updated_at": "2023-01-01T00:00:00Z"
    // }

    // Find the payment by transaction ID
    const payment = await Payment.findOne({
      $or: [
        { checkoutRequestId: body.transaction_id },
        { providerReference: body.transaction_id },
      ],
    });

    if (!payment) {
      console.error("Payment not found for transaction:", body.transaction_id);
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status based on IntaSend state
    const newStatus = body.state === "COMPLETE" ? "success" : "failed";

    await Payment.findByIdAndUpdate(payment._id, {
      status: newStatus,
      callbackMetadata: body,
      updatedAt: new Date(),
    });

    console.log(`Payment ${payment._id} updated to status: ${newStatus}`);

    // Handle successful payment
    if (body.state === "COMPLETE") {
      const activationResult = await activateSubscription(
        payment.userId.toString(),
        payment.planType,
        payment.amount
      );

      if (!activationResult.success) {
        console.error(
          "Failed to activate subscription:",
          activationResult.error
        );
        // Don't return error to IntaSend, just log it
      } else {
        console.log(
          "Subscription activated successfully for user:",
          payment.userId
        );
      }
    } else if (body.state === "FAILED") {
      console.log("Payment failed for user:", payment.userId);
      // Could send notification to user about failed payment
    }

    // Always return 200 to IntaSend to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    // Still return 200 to prevent IntaSend from retrying with error
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 200 } // IntaSend expects 200 even on errors
    );
  }
}
