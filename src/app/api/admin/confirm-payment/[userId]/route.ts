import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { Notification } from "@/lib/models/Notification";
import { getUserFromToken } from "@/lib/auth";

const isAdmin = (user: any) => user.email === "clintonochieng072@gmail.com";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromToken();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { userId } = await params;

    await dbConnect();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update payment status and unlock account
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          has_paid: true,
          isLocked: false,
        },
      }
    );

    // Create notification for the user
    await Notification.create({
      userId,
      type: "payment",
      title: "Payment Confirmed",
      message:
        "Your payment has been confirmed and your account is now active.",
      read: false,
    });

    return NextResponse.json({ message: "Payment confirmed successfully" });
  } catch (err) {
    console.error("Confirm payment error:", err);
    return NextResponse.json(
      { error: "Error confirming payment" },
      { status: 500 }
    );
  }
}
