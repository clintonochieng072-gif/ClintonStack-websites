import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { payHeroService } from "@/lib/payhero";
import Payment from "@/lib/models/Payment";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

// This endpoint should be called by a cron job daily
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    console.log("Starting subscription renewal process...");

    // Find all expired subscriptions that should auto-renew
    const expiredSubscriptions = await Subscription.find({
      status: "active",
      autoRenew: true,
      currentPeriodEnd: { $lt: new Date() },
    }).populate("userId");

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions to renew`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const subscription of expiredSubscriptions) {
      try {
        results.processed++;

        const user = subscription.userId as any;
        if (!user) {
          results.errors.push(`User not found for subscription ${subscription._id}`);
          continue;
        }

        // Get user's phone number from previous payments
        const lastPayment = await Payment.findOne({
          userId: user._id,
          status: "success",
        }).sort({ createdAt: -1 });

        if (!lastPayment?.phoneNumber) {
          results.errors.push(`No phone number found for user ${user._id}`);
          continue;
        }

        // Create renewal payment record
        const renewalPayment = await Payment.create({
          amount: 999, // Monthly plan amount
          currency: "KES",
          status: "pending",
          providerReference: `RENEWAL-${Date.now()}-${user._id}`,
          userId: user._id,
          planType: "monthly",
          phoneNumber: lastPayment.phoneNumber,
          paymentMethod: "payhero",
        });

        // Attempt STK Push for renewal
        const stkPushResponse = await payHeroService.initiateSTKPush({
          phoneNumber: lastPayment.phoneNumber,
          amount: 999,
          accountReference: `RENEWAL-${user._id}`,
          transactionDesc: "Monthly Subscription Renewal",
        });

        if (!stkPushResponse.success || !stkPushResponse.data) {
          // Mark payment as failed
          await Payment.findByIdAndUpdate(renewalPayment._id, {
            status: "failed",
            callbackMetadata: { error: stkPushResponse.message },
          });

          results.failed++;
          results.errors.push(`STK Push failed for user ${user._id}: ${stkPushResponse.message}`);
          continue;
        }

        // Update payment with checkout request ID
        await Payment.findByIdAndUpdate(renewalPayment._id, {
          checkoutRequestId: stkPushResponse.data.checkoutRequestId,
          providerReference: stkPushResponse.data.checkoutRequestId,
        });

        // Payment status will be updated via webhook when PayHero processes it
        // The webhook handler will extend the subscription if payment succeeds
        // or expire the subscription if payment fails

        console.log(`Renewal payment initiated for user ${user._id} with checkout ID: ${stkPushResponse.data.checkoutRequestId}`);

      } catch (error: any) {
        results.errors.push(`Error processing renewal for subscription ${subscription._id}: ${error.message}`);
        results.failed++;
      }
    }

    console.log("Renewal process completed:", results);

    return NextResponse.json({
      success: true,
      message: "Renewal process completed",
      results,
    });

  } catch (error: any) {
    console.error("Renewal processing error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check renewal status (for monitoring)
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const now = new Date();
    const expiredCount = await Subscription.countDocuments({
      status: "active",
      autoRenew: true,
      currentPeriodEnd: { $lt: now },
    });

    const expiringSoonCount = await Subscription.countDocuments({
      status: "active",
      autoRenew: true,
      currentPeriodEnd: {
        $gte: now,
        $lt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Expiring in 3 days
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        expiredSubscriptions: expiredCount,
        expiringSoon: expiringSoonCount,
        nextRenewalCheck: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      },
    });

  } catch (error: any) {
    console.error("Renewal status check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}