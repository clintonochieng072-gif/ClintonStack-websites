import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { getAccessToken, querySTKPush } from "@/lib/mpesa";
import Payment from "@/lib/models/Payment";
import Subscription from "@/lib/models/Subscription";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDb();

    // Get CheckoutRequestID from query parameters
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get("CheckoutRequestID");

    if (!checkoutRequestId) {
      return NextResponse.json(
        { success: false, message: "CheckoutRequestID is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the payment record
    const payment = await Payment.findOne({
      checkoutRequestId: checkoutRequestId,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    // Check permissions: users can only access their own payments, admins can access any
    const isAdmin = user.role === "admin";
    if (!isAdmin && payment.userId?.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    let updatedPayment = payment;
    let mpesaStatusResponse = null;

    // If payment is still pending, optionally query M-Pesa API for latest status
    if (payment.status === "pending") {
      try {
        const accessToken = await getAccessToken();
        const queryResponse = await querySTKPush(
          accessToken,
          process.env.MPESA_SHORTCODE!,
          process.env.MPESA_PASSKEY!,
          checkoutRequestId
        );

        mpesaStatusResponse = queryResponse;

        // Update payment status based on M-Pesa response
        if (queryResponse.ResultCode === "0") {
          // Payment successful
          payment.status = "success";
          await payment.save();
          updatedPayment = payment;
        } else if (queryResponse.ResultCode !== "1032" && queryResponse.ResultCode !== "1037") {
          // Payment failed (exclude "Request cancelled by user" and "Timeout")
          payment.status = "failed";
          await payment.save();
          updatedPayment = payment;
        }
        // If still 1032 or 1037, keep as pending
      } catch (mpesaError) {
        console.warn("M-Pesa status query failed:", mpesaError);
        // Continue with local status if M-Pesa query fails
      }
    }

    // Get subscription information if payment has userId and planId
    let subscriptionInfo = null;
    if (updatedPayment.userId && updatedPayment.planId) {
      const subscription = await Subscription.findOne({
        userId: updatedPayment.userId,
      });

      if (subscription) {
        const plan = await Plan.findById(subscription.planId);
        subscriptionInfo = {
          id: subscription._id,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
          cancelledAt: subscription.cancelledAt,
          extraStorageGB: subscription.extraStorageGB,
          usage: subscription.usage,
          autoRenew: subscription.autoRenew,
          plan: plan ? {
            id: plan._id,
            name: plan.name,
            slug: plan.slug,
            price: plan.price,
            type: plan.type,
            features: plan.features,
          } : null,
        };
      }
    }

    // Get plan details for payment if exists
    let paymentPlanInfo = null;
    if (updatedPayment.planId) {
      const plan = await Plan.findById(updatedPayment.planId);
      if (plan) {
        paymentPlanInfo = {
          id: plan._id,
          name: plan.name,
          slug: plan.slug,
          price: plan.price,
          type: plan.type,
          features: plan.features,
        };
      }
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        payment: {
          id: updatedPayment._id,
          checkoutRequestId: updatedPayment.checkoutRequestId,
          merchantRequestId: updatedPayment.merchantRequestId,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          status: updatedPayment.status,
          providerReference: updatedPayment.providerReference,
          phoneNumber: updatedPayment.phoneNumber,
          transactionDate: updatedPayment.transactionDate,
          createdAt: updatedPayment.createdAt,
          plan: paymentPlanInfo,
        },
        subscription: subscriptionInfo,
        mpesaQueryResult: mpesaStatusResponse,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("M-Pesa status query error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}