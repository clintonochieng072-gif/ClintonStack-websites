import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import ManualPayment from "@/lib/models/ManualPayment";
import { Notification } from "@/lib/models/Notification";

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
    const { reason } = await req.json();

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
    manualPayment.status = "rejected";
    await manualPayment.save();

    // Create notification for the user
    await Notification.create({
      userId: manualPayment.userId,
      type: "payment_rejected",
      title: "Payment Rejected",
      message: `Your payment request has been rejected. ${
        reason || "Please contact support for more information."
      }`,
    });

    return NextResponse.json({
      success: true,
      message: "Payment rejected successfully",
    });
  } catch (error: any) {
    console.error("Admin payment rejection error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
