import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { payHeroService } from "@/lib/payhero";
import Payment from "@/lib/models/Payment";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const signature = req.headers.get("x-payhero-signature");

    // Verify webhook signature if secret is configured
    if (process.env.PAYHERO_WEBHOOK_SECRET && signature) {
      const isValidSignature = payHeroService.verifyWebhookSignature(
        body,
        signature
      );
      if (!isValidSignature) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const webhookData = payHeroService.parseWebhookPayload(body);

    console.log("PayHero webhook received:", webhookData);

    // Find the payment by checkout request ID or transaction ID
    const payment = await Payment.findOne({
      $or: [
        { checkoutRequestId: webhookData.transactionId },
        { providerReference: webhookData.transactionId },
      ],
    });

    if (!payment) {
      console.error(
        "Payment not found for transaction:",
        webhookData.transactionId
      );
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status
    const newStatus = webhookData.status === "success" ? "success" : "failed";

    await Payment.findByIdAndUpdate(payment._id, {
      status: newStatus,
      callbackMetadata: webhookData,
      updatedAt: new Date(),
    });

    // Handle payment based on status and type
    if (webhookData.status === "success") {
      if (payment.providerReference?.startsWith("RENEWAL-")) {
        await renewSubscription(payment);
      } else {
        await activateSubscription(payment);
      }
    } else if (webhookData.status === "failed") {
      if (payment.providerReference?.startsWith("RENEWAL-")) {
        await handleRenewalFailure(payment);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function activateSubscription(payment: any) {
  try {
    // Find or create subscription
    let subscription = await Subscription.findOne({ userId: payment.userId });

    if (!subscription) {
      // Find the appropriate plan
      const planType =
        payment.planType === "monthly" ? "subscription" : "one_time";
      const plan = await Plan.findOne({ type: planType, isActive: true });

      if (!plan) {
        console.error("Plan not found for payment:", payment._id);
        return;
      }

      // Create new subscription
      subscription = await Subscription.create({
        userId: payment.userId,
        planId: plan._id,
        status: payment.planType === "lifetime" ? "lifetime" : "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd:
          payment.planType === "lifetime"
            ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) // 100 years for lifetime
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for monthly
        paymentMethod: "payhero",
        autoRenew: payment.planType === "monthly",
      });
    } else {
      // Update existing subscription
      subscription.status =
        payment.planType === "lifetime" ? "lifetime" : "active";
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd =
        payment.planType === "lifetime"
          ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      subscription.paymentMethod = "payhero";
      subscription.autoRenew = payment.planType === "monthly";
      await subscription.save();
    }

    // Update user's plan and payment status
    await User.findByIdAndUpdate(payment.userId, {
      plan: payment.planType === "monthly" ? "monthly" : "lifetime",
      has_paid: true,
      isLocked: false,
    });

    console.log("Subscription activated for user:", payment.userId);
  } catch (error: any) {
    console.error("Error activating subscription:", error);
  }
}

async function renewSubscription(payment: any) {
  try {
    // Find the existing subscription
    const subscription = await Subscription.findOne({
      userId: payment.userId,
      status: "active",
      autoRenew: true,
    });

    if (!subscription) {
      console.error(
        "No active subscription found for renewal:",
        payment.userId
      );
      return;
    }

    // Extend the subscription period by 30 days
    const currentEnd = subscription.currentPeriodEnd;
    subscription.currentPeriodStart = currentEnd; // Start from when it expired
    subscription.currentPeriodEnd = new Date(
      currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000
    ); // Add 30 days
    subscription.paymentMethod = "payhero";
    await subscription.save();

    // Ensure user remains active
    await User.findByIdAndUpdate(payment.userId, {
      has_paid: true,
      isLocked: false,
    });

    console.log(
      `Subscription renewed for user ${payment.userId} until ${subscription.currentPeriodEnd}`
    );
  } catch (error: any) {
    console.error("Error renewing subscription:", error);
  }
}

async function handleRenewalFailure(payment: any) {
  try {
    // Find the subscription that failed to renew
    const subscription = await Subscription.findOne({
      userId: payment.userId,
      status: "active",
      autoRenew: true,
    });

    if (!subscription) {
      console.error(
        "No active subscription found for failed renewal:",
        payment.userId
      );
      return;
    }

    // Mark subscription as expired
    subscription.status = "expired";
    await subscription.save();

    // Suspend user account (lock it)
    await User.findByIdAndUpdate(payment.userId, {
      isLocked: true,
      // Keep has_paid as true since they paid initially
    });

    console.log(
      `Subscription expired and user ${payment.userId} account locked due to failed renewal`
    );

    // TODO: Send email notification about failed renewal
    // This would require email service integration
  } catch (error: any) {
    console.error("Error handling renewal failure:", error);
  }
}
