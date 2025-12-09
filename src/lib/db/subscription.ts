import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Referral from "@/lib/models/Referral";
import AffiliateEarnings from "@/lib/models/AffiliateEarnings";

async function processAffiliateCommission(
  userId: string,
  paymentAmount: number
) {
  // Find the referral
  const referral = await Referral.findOne({
    clientId: userId,
    paymentStatus: "pending",
  });

  if (!referral) {
    console.log(`No pending referral found for user ${userId}`);
    return;
  }

  // Get the affiliate
  const affiliate = await User.findById(referral.referrerId);
  if (!affiliate || affiliate.role !== "affiliate") {
    console.log(
      `Affiliate not found or not an affiliate: ${referral.referrerId}`
    );
    return;
  }

  // Calculate commission (assuming 10% commission for now)
  const commissionAmount = Math.round(paymentAmount * 0.1);

  // Add directly to available balance (real money)
  affiliate.availableBalance =
    (affiliate.availableBalance || 0) + commissionAmount;

  // Update total earned
  affiliate.totalEarned = (affiliate.totalEarned || 0) + commissionAmount;

  await affiliate.save();

  // Update referral status
  referral.paymentStatus = "paid";
  referral.commissionEarned = commissionAmount;
  referral.creditedAt = new Date();
  await referral.save();

  // Update AffiliateEarnings model for stats
  await AffiliateEarnings.findOneAndUpdate(
    { affiliateId: referral.referrerId, productId: referral.productId },
    {
      $inc: {
        paidEarnings: commissionAmount,
        paidReferralCount: 1,
      },
      $set: { lastUpdated: new Date() },
    },
    { upsert: true }
  );

  console.log(
    `Commission of KES ${commissionAmount} credited to affiliate ${affiliate.email}`
  );
}

export async function activateSubscription(
  userId: string,
  planType: "monthly" | "lifetime",
  amount: number
) {
  try {
    await dbConnect();

    const updateData: any = {
      has_paid: true,
      isLocked: false,
      subscriptionStatus: "active",
      subscriptionType: planType,
      plan: planType === "monthly" ? "monthly" : "lifetime",
    };

    // Set expiration date for monthly subscriptions
    if (planType === "monthly") {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // Add 1 month
      updateData.subscriptionExpiresAt = expiresAt;
    } else {
      // Lifetime subscription - set to far future
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 years for lifetime
      updateData.subscriptionExpiresAt = expiresAt;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    console.log(`Subscription activated for user ${userId}: ${planType} plan`);

    // Process affiliate commission if user was referred
    if (updatedUser.referrerId) {
      try {
        await processAffiliateCommission(updatedUser._id.toString(), amount);
      } catch (commissionError) {
        console.error(
          "Error processing affiliate commission:",
          commissionError
        );
        // Don't fail the subscription activation if commission processing fails
      }
    }

    return {
      success: true,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionType: updatedUser.subscriptionType,
        subscriptionExpiresAt: updatedUser.subscriptionExpiresAt,
        plan: updatedUser.plan,
        has_paid: updatedUser.has_paid,
      },
    };
  } catch (error: any) {
    console.error("Error activating subscription:", error);
    return {
      success: false,
      error: error.message || "Failed to activate subscription",
    };
  }
}

export async function checkSubscriptionStatus(userId: string) {
  try {
    await dbConnect();

    const user = await User.findById(userId).select(
      "subscriptionStatus subscriptionType subscriptionExpiresAt plan has_paid isLocked"
    );

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if monthly subscription has expired
    if (
      user.subscriptionType === "monthly" &&
      user.subscriptionExpiresAt &&
      new Date() > user.subscriptionExpiresAt
    ) {
      // Auto-expire the subscription
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: "inactive",
        isLocked: true,
      });

      return {
        success: true,
        subscription: {
          status: "expired",
          type: user.subscriptionType,
          expiresAt: user.subscriptionExpiresAt,
          plan: user.plan,
          has_paid: user.has_paid,
          isLocked: true,
        },
      };
    }

    return {
      success: true,
      subscription: {
        status: user.subscriptionStatus,
        type: user.subscriptionType,
        expiresAt: user.subscriptionExpiresAt,
        plan: user.plan,
        has_paid: user.has_paid,
        isLocked: user.isLocked || false,
      },
    };
  } catch (error: any) {
    console.error("Error checking subscription status:", error);
    return {
      success: false,
      error: error.message || "Failed to check subscription status",
    };
  }
}
