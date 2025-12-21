import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with affiliate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { affiliate: true },
    });

    if (!user || user.role !== "affiliate" || !user.affiliate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, phoneNumber, mpesaName } = await request.json();

    if (!amount || !phoneNumber || !mpesaName) {
      return NextResponse.json(
        { error: "Amount, phone number, and MPESA name are required" },
        { status: 400 }
      );
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 300) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is KES 300" },
        { status: 400 }
      );
    }

    if (withdrawalAmount > user.affiliate.availableBalance) {
      return NextResponse.json(
        { error: "Insufficient available balance" },
        { status: 400 }
      );
    }

    // Rate limiting: Check if user has made a withdrawal in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentWithdrawal = await prisma.withdrawalRequest.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentWithdrawal) {
      return NextResponse.json(
        { error: "You can only make one withdrawal per day" },
        { status: 429 }
      );
    }

    // Create withdrawal request
    const withdrawalRequest = await prisma.withdrawalRequest.create({
      data: {
        userId: user.id,
        amount: withdrawalAmount,
        phoneNumber,
        mpesaName,
        status: "pending",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "withdrawal_request_created",
        details: {
          withdrawalId: withdrawalRequest.id,
          amount: withdrawalAmount,
          phoneNumber,
          mpesaName,
        },
        targetId: withdrawalRequest.id,
        userId: user.id,
      },
    });

    // Notify all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: "admin" },
    });

    const notifications = adminUsers.map((admin) => ({
      userId: admin.id,
      type: "withdrawal_request",
      message: `New withdrawal request from ${user.name} (${user.email}) for KES ${withdrawalAmount}`,
      data: {
        withdrawalId: withdrawalRequest.id,
        affiliateId: user.id,
        affiliateName: user.name,
        affiliateEmail: user.email,
        amount: withdrawalAmount,
        phoneNumber,
        mpesaName,
      },
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      message:
        "Withdrawal request submitted successfully. It will be processed manually.",
      withdrawalId: withdrawalRequest.id,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
