import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import Payment from "@/lib/models/Payment";
import User from "@/lib/models/User";
import ManualPayment from "@/lib/models/ManualPayment";

const isAdmin = (user: any) => user.email === "clintonochieng072@gmail.com";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const user = await getUserFromToken();

    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get recent payments with user details
    const payments = await Payment.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get manual payments
    const manualPaymentsQuery = await ManualPayment.find({})
      .sort({ submittedAt: -1 })
      .limit(50)
      .lean();

    const manualPayments = manualPaymentsQuery.map((payment) => ({
      _id: payment._id,
      userId: payment.userId,
      planType: payment.planType,
      planName: payment.planName,
      planAmount: payment.planAmount,
      fullName: payment.fullName,
      phoneNumber: payment.phoneNumber,
      email: payment.email,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      amount: payment.amount,
      notes: payment.notes,
      status: payment.status,
      submittedAt: payment.submittedAt,
      approvedAt: payment.approvedAt,
    }));

    // Calculate payment statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const successfulPayments = await Payment.countDocuments({
      status: "success",
    });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const failedPayments = await Payment.countDocuments({ status: "failed" });

    // Get recent successful payments for display
    const recentPayments = payments
      .filter((payment) => payment.status === "success")
      .slice(0, 10)
      .map((payment) => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        planType: payment.planType,
        phoneNumber: payment.phoneNumber,
        user: payment.userId
          ? {
              name: (payment.userId as any).name || "Unknown",
              email: (payment.userId as any).email || "Unknown",
            }
          : null,
        createdAt: payment.createdAt,
      }));

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalRevenue: totalRevenue[0]?.total || 0,
          successfulPayments,
          pendingPayments,
          failedPayments,
        },
        recentPayments,
        manualPayments,
      },
    });
  } catch (error: any) {
    console.error("Admin payments fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
