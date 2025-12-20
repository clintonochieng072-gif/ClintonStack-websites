import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import User from "@/lib/models/User";
import ManualPayment from "@/lib/models/ManualPayment";
import { Notification } from "@/lib/models/Notification";
import { pusherServer } from "@/lib/pusher";
import { usersRepo } from "@/repositories/usersRepo";

const isAdmin = (user: any) => user.email === "clintonochieng072@gmail.com";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    await connectDb();
    const user = await getUserFromToken();

    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { paymentId } = await params;

    // Find the manual payment
    const manualPayment = await ManualPayment.findById(paymentId);
    if (!manualPayment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    if (manualPayment.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Payment is not pending" },
        { status: 400 }
      );
    }

    // Update payment status
    manualPayment.status = "approved";
    manualPayment.approvedAt = new Date();
    await manualPayment.save();

    // Update user subscription status
    const userToUpdate = await User.findById(manualPayment.userId);
    if (userToUpdate) {
      if (manualPayment.planType === "lifetime") {
        userToUpdate.subscriptionType = "lifetime";
        userToUpdate.subscriptionStatus = "active";
        userToUpdate.has_paid = true;
      } else if (manualPayment.planType === "monthly") {
        userToUpdate.subscriptionType = "monthly";
        userToUpdate.subscriptionStatus = "active";
        userToUpdate.has_paid = true;
        // Set expiration to 30 days from now
        userToUpdate.subscriptionExpiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
      }
      await userToUpdate.save();

      // Also update PostgreSQL user
      const pgUser = await usersRepo.findByEmail(userToUpdate.email);
      if (pgUser) {
        const updateData = {
          has_paid: true,
          subscriptionStatus: "active" as const,
          subscriptionType: manualPayment.planType,
        };
        await usersRepo.update(pgUser.id, updateData);

        // Trigger real-time update for the user
        await pusherServer.trigger(`user-${pgUser.id}`, "payment-approved", {});
      }
    }

    // Create notification for the user
    await Notification.create({
      userId: manualPayment.userId,
      type: "payment_approved",
      title: "Payment Approved",
      message: `Your payment of KES ${manualPayment.planAmount} for ${manualPayment.planName} has been approved. You can now publish your website.`,
    });

    return NextResponse.json({
      success: true,
      message: "Payment approved successfully",
    });
  } catch (error: any) {
    console.error("Admin payment approval error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
