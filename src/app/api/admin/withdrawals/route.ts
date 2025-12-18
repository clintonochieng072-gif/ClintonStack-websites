import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = status === "all" ? {} : { status: status as any };

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      withdrawals,
      total: await prisma.withdrawalRequest.count({ where }),
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
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

    const { withdrawalId, action } = await request.json();

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: "Withdrawal ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "deny"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'deny'" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { user: { include: { affiliate: true } } },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: "Withdrawal request is not pending" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "completed" : "failed";

    // Update withdrawal status
    await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: newStatus,
        processedAt: new Date(),
      },
    });

    // If approving, update affiliate balance
    if (action === "approve" && withdrawal.user.affiliate) {
      await prisma.affiliate.update({
        where: { id: withdrawal.user.affiliate.id },
        data: {
          availableBalance: {
            decrement: withdrawal.amount,
          },
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `withdrawal_${action}`,
        details: {
          withdrawalId,
          amount: withdrawal.amount,
          userId: withdrawal.userId,
        },
        targetId: withdrawalId,
        userId: session.user.id,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: `withdrawal_${action}`,
        message: `Withdrawal ${action}d: KES ${withdrawal.amount} for ${withdrawal.user.name}`,
        data: {
          withdrawalId,
          amount: withdrawal.amount,
          userId: withdrawal.userId,
        },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: `Withdrawal ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
