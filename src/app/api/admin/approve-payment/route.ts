import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getUserFromToken } from "@/lib/auth";
import { usersRepo } from "@/repositories/usersRepo";
import { Notification } from "@/lib/models/Notification";
import { pusherServer } from "@/lib/pusher";

const isAdmin = (user: any) =>
  user.role === "admin" || user.email === "clintonochieng072@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user
    const targetUser = await usersRepo.findByEmail(email);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Approve the user directly (manual payment system)
    const updateData = {
      has_paid: true,
      onboarded: true,
      subscriptionStatus: "active" as const,
      subscriptionType: "lifetime" as const, // Manual approval gives lifetime
    };
    await usersRepo.update(targetUser.id, updateData);

    // Trigger real-time update for the user
    await pusherServer.trigger(`user-${targetUser.id}`, "payment-approved", {});

    // Create notification for the user
    await Notification.create({
      userId: targetUser.id, // Use PostgreSQL id
      type: "payment_approved",
      title: "Payment Approved",
      message:
        "Your account has been manually approved. You can now publish your website.",
    });

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
    });
  } catch (error: any) {
    console.error("Admin payment approval error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
