import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { referralsRepo } from "@/repositories/referralsRepo";
import { affiliatesRepo } from "@/repositories/affiliatesRepo";
import { pusherServer } from "@/lib/pusher";


export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      session.user.email !== "clintonochieng072@gmail.com"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const users = await prisma.user.findMany({
      where: {
        role: "client",
        has_paid: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        payments: {
          select: {
            amount: true,
            paymentMethod: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      users,
      total: await prisma.user.count({
        where: {
          role: "client",
          has_paid: false,
        },
      }),
    });
  } catch (error) {
    console.error("Error fetching unpaid users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      session.user.email !== "clintonochieng072@gmail.com"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, amount, planType = "lifetime" } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { error: "User ID and amount are required" },
        { status: 400 }
      );
    }

    // Get user for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: "KES",
        status: "success",
        paymentMethod: "manual",
        planType,
      },
    });

    // Check if user was referred and calculate commission
    const referral = await prisma.referral.findFirst({
      where: { referredUserId: userId },
      include: { affiliate: true },
    });

    if (referral) {
      // Calculate 15% commission, truncated to whole number
      const commissionAmount = Math.floor(amount * 0.15);

      // Get current affiliate data for pusher
      const affiliate = await affiliatesRepo.findById(referral.affiliateId);

      // Create commission record
      await prisma.commission.create({
        data: {
          affiliateId: referral.affiliateId,
          paymentId: payment.id,
          commissionAmount,
          status: "paid", // Immediately mark as paid since payment is approved
        },
      });

      // Update affiliate balance
      await prisma.affiliate.update({
        where: { id: referral.affiliateId },
        data: {
          totalEarned: { increment: commissionAmount },
          availableBalance: { increment: commissionAmount },
        },
      });

      // Update referral status to converted
      await referralsRepo.convertReferral(referral.id);

      // Trigger real-time update for the affiliate
      if (affiliate) {
        await pusherServer.trigger(
          `affiliate-${referral.affiliateId}`,
          "commission-earned",
          {
            commissionAmount,
            totalEarned: affiliate.totalEarned + commissionAmount,
            availableBalance: affiliate.availableBalance + commissionAmount,
          }
        );
      }
    }

    // Update user to paid
    await prisma.user.update({
      where: { id: userId },
      data: { has_paid: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "manual_payment_approval",
        details: {
          userId,
          amount,
          commissionAmount: referral ? Math.floor(amount * 0.15) : 0,
        },
        targetId: userId,
        userId: session.user.id,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "payment_approved",
        message: `Payment approved for user: ${user.name}`,
        data: { userId, userName: user.name },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "User payment approved successfully",
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
