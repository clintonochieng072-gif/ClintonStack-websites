import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import Subscription from "@/lib/models/Subscription";
import Plan from "@/lib/models/Plan";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

// Get current user's subscription
export async function GET(req: Request) {
  try {
    await connectDb();
    const user = await getUserFromToken(req as any);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await Subscription.findOne({ userId: user.id })
      .populate("planId")
      .exec();

    if (!subscription) {
      // Create trial subscription for new users
      const starterPlan = await Plan.findOne({ slug: "starter" });
      if (starterPlan) {
        const newSubscription = await Subscription.create({
          userId: user.id,
          planId: starterPlan._id,
          status: "trial",
        });

        const populatedSubscription = await Subscription.findById(
          newSubscription._id
        )
          .populate("planId")
          .exec();

        return NextResponse.json({
          success: true,
          data: populatedSubscription,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// Update subscription (upgrade/downgrade)
export async function PUT(req: Request) {
  try {
    await connectDb();
    const user = await getUserFromToken(req as any);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planSlug } = await req.json();

    if (!planSlug) {
      return NextResponse.json(
        { success: false, message: "Plan slug is required" },
        { status: 400 }
      );
    }

    const plan = await Plan.findOne({ slug: planSlug, isActive: true });
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    let subscription = await Subscription.findOne({ userId: user.id });

    if (!subscription) {
      // Create new subscription
      subscription = await Subscription.create({
        userId: user.id,
        planId: plan._id,
        status: "active",
      });
    } else {
      // Update existing subscription
      subscription.planId = plan._id;
      subscription.status = "active";
      await subscription.save();
    }

    // Update user's plan field
    await User.findByIdAndUpdate(user.id, { plan: planSlug });

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate("planId")
      .exec();

    return NextResponse.json({
      success: true,
      data: populatedSubscription,
      message: `Successfully upgraded to ${plan.name} plan`,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
