import { connectDb } from "./db";
import Subscription from "./models/Subscription";
import Plan from "./models/Plan";

export interface UsageLimits {
  storageGB: number;
  maxImages: number;
  maxProperties: number;
  canPublish: boolean;
  canUseCustomDomain: boolean;
  canUseAnalytics: boolean;
  teamAccounts: number;
}

export interface CurrentUsage {
  storageUsed: number;
  imagesUsed: number;
  propertiesCount: number;
}

/**
 * Get user's current plan and limits
 */
export async function getUserLimits(
  userId: string
): Promise<UsageLimits | null> {
  try {
    await connectDb();

    const subscription = await Subscription.findOne({ userId })
      .populate("planId")
      .exec();

    if (!subscription) {
      // Return free/trial limits (same as Starter)
      return {
        storageGB: 1,
        maxImages: 50,
        maxProperties: 10,
        canPublish: true,
        canUseCustomDomain: false,
        canUseAnalytics: false,
        teamAccounts: 0,
      };
    }

    const plan = subscription.planId as any;

    // Plan-specific limits based on the new structure
    const planLimits = {
      starter: {
        storageGB: 1,
        maxImages: 50,
        maxProperties: 10,
        canPublish: true,
        canUseCustomDomain: false,
        canUseAnalytics: false,
        teamAccounts: 0,
      },
      basic: {
        storageGB: 3,
        maxImages: 150,
        maxProperties: 30,
        canPublish: true,
        canUseCustomDomain: true,
        canUseAnalytics: true,
        teamAccounts: 1,
      },
      pro: {
        storageGB: 10,
        maxImages: 500,
        maxProperties: 100,
        canPublish: true,
        canUseCustomDomain: true,
        canUseAnalytics: true,
        teamAccounts: 3,
      },
      elite: {
        storageGB: Infinity, // Unlimited
        maxImages: Infinity, // Unlimited
        maxProperties: Infinity, // Unlimited
        canPublish: true,
        canUseCustomDomain: true,
        canUseAnalytics: true,
        teamAccounts: 10,
      },
    };

    const limits =
      planLimits[plan.slug as keyof typeof planLimits] || planLimits.starter;

    return {
      storageGB:
        limits.storageGB === Infinity
          ? Infinity
          : limits.storageGB + subscription.extraStorageGB,
      maxImages: limits.maxImages,
      maxProperties: limits.maxProperties,
      canPublish: limits.canPublish,
      canUseCustomDomain: limits.canUseCustomDomain,
      canUseAnalytics: limits.canUseAnalytics,
      teamAccounts: limits.teamAccounts,
    };
  } catch (error) {
    console.error("Error getting user limits:", error);
    return null;
  }
}

/**
 * Get user's current usage
 */
export async function getCurrentUsage(
  userId: string
): Promise<CurrentUsage | null> {
  try {
    await connectDb();

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return {
        storageUsed: 0,
        imagesUsed: 0,
        propertiesCount: 0,
      };
    }

    return {
      storageUsed: subscription.usage.storageUsed,
      imagesUsed: subscription.usage.imagesUsed,
      propertiesCount: subscription.usage.propertiesCount,
    };
  } catch (error) {
    console.error("Error getting current usage:", error);
    return null;
  }
}

/**
 * Check if user can perform an action based on their plan
 */
export async function canPerformAction(
  userId: string,
  action:
    | "upload_image"
    | "add_property"
    | "publish_site"
    | "use_custom_domain"
    | "use_analytics"
): Promise<boolean> {
  const limits = await getUserLimits(userId);
  if (!limits) return false;

  const usage = await getCurrentUsage(userId);
  if (!usage) return false;

  switch (action) {
    case "upload_image":
      return usage.imagesUsed < limits.maxImages;
    case "add_property":
      return (
        limits.maxProperties === Infinity ||
        usage.propertiesCount < limits.maxProperties
      );
    case "publish_site":
      return limits.canPublish;
    case "use_custom_domain":
      return limits.canUseCustomDomain;
    case "use_analytics":
      return limits.canUseAnalytics;
    default:
      return false;
  }
}

/**
 * Update usage counters
 */
export async function updateUsage(
  userId: string,
  updates: Partial<CurrentUsage>
): Promise<boolean> {
  try {
    await connectDb();

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) return false;

    if (updates.storageUsed !== undefined) {
      subscription.usage.storageUsed = updates.storageUsed;
    }
    if (updates.imagesUsed !== undefined) {
      subscription.usage.imagesUsed = updates.imagesUsed;
    }
    if (updates.propertiesCount !== undefined) {
      subscription.usage.propertiesCount = updates.propertiesCount;
    }

    await subscription.save();
    return true;
  } catch (error) {
    console.error("Error updating usage:", error);
    return false;
  }
}

/**
 * Reset monthly usage counters (should be called monthly)
 */
export async function resetMonthlyUsage(): Promise<void> {
  try {
    await connectDb();

    await Subscription.updateMany(
      {},
      {
        $set: {
          "usage.imagesUsed": 0,
          "usage.lastResetDate": new Date(),
        },
      }
    );

    console.log("Monthly usage reset completed");
  } catch (error) {
    console.error("Error resetting monthly usage:", error);
  }
}

/**
 * Check if user has exceeded their limits
 */
export async function checkLimits(userId: string): Promise<{
  exceeded: boolean;
  limits: UsageLimits | null;
  usage: CurrentUsage | null;
}> {
  const limits = await getUserLimits(userId);
  const usage = await getCurrentUsage(userId);

  if (!limits || !usage) {
    return { exceeded: true, limits: null, usage: null };
  }

  const exceeded =
    usage.imagesUsed >= limits.maxImages ||
    usage.storageUsed >= limits.storageGB ||
    (limits.maxProperties !== Infinity &&
      usage.propertiesCount >= limits.maxProperties);

  return { exceeded, limits, usage };
}
