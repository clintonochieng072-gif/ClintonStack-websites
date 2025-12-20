import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user and verify admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { withdrawalId, action } = await request.json();

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: "Withdrawal ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Find the withdrawal request
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
    });
    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: "Withdrawal request has already been processed" },
        { status: 400 }
      );
    }

    // Get the affiliate user and affiliate data
    const user = await prisma.user.findUnique({
      where: { id: withdrawal.userId },
      include: { affiliate: true },
    });
    if (!user || !user.affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Update withdrawal status
      await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: "completed",
          processedAt: new Date(),
        },
      });

      // Deduct from available balance
      await prisma.affiliate.update({
        where: { userId: user.id },
        data: {
          availableBalance: {
            decrement: withdrawal.amount,
          },
        },
      });

      return NextResponse.json({
        message: "Withdrawal approved successfully",
      });
    } else if (action === "reject") {
      // Update withdrawal status
      await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: "failed",
          failureReason: "Rejected by admin",
          processedAt: new Date(),
        },
      });

      // Refund amount to available balance
      await prisma.affiliate.update({
        where: { userId: user.id },
        data: {
          availableBalance: {
            increment: withdrawal.amount,
          },
        },
      });

      return NextResponse.json({
        message: "Withdrawal request rejected",
      });
    }
  } catch (error) {
    console.error("Error processing withdrawal approval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
