import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      session.user.email !== "clintonochieng072@gmail.com"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get payment statistics
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: "success" },
      _sum: { amount: true },
    });

    const successfulPayments = await prisma.payment.count({
      where: { status: "success" },
    });
    const pendingPayments = await prisma.payment.count({
      where: { status: "pending" },
    });
    const failedPayments = await prisma.payment.count({
      where: { status: "failed" },
    });

    // Get recent successful payments
    const recentPayments = await prisma.payment.findMany({
      where: { status: "success" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const formattedRecentPayments = recentPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: "KES", // Default for now
      status: payment.status,
      planType: payment.planType,
      phoneNumber: payment.transactionId || "", // Using transactionId as phone for now
      user: payment.user
        ? {
            name: payment.user.name,
            email: payment.user.email,
          }
        : null,
      createdAt: payment.createdAt,
    }));

    // For now, return empty manual payments since we don't have that model yet
    const manualPayments: any[] = [];

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalRevenue: totalRevenue._sum.amount || 0,
          successfulPayments,
          pendingPayments,
          failedPayments,
        },
        recentPayments: formattedRecentPayments,
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
