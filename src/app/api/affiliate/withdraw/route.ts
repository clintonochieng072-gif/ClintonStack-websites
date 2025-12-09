import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import WithdrawalRequest from "@/lib/models/WithdrawalRequest";
import { logger } from "@/lib/logger";
import { intaSendService } from "@/lib/intasend";

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "affiliate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, phoneNumber } = await request.json();

    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { error: "Amount and phone number are required" },
        { status: 400 }
      );
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 200) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is KES 200" },
        { status: 400 }
      );
    }

    if (withdrawalAmount > (user.availableBalance || 0)) {
      return NextResponse.json(
        { error: "Insufficient available balance" },
        { status: 400 }
      );
    }

    // Rate limiting: Check if user has made a withdrawal in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentWithdrawal = await WithdrawalRequest.findOne({
      userId: user._id,
      createdAt: { $gte: oneDayAgo },
    });

    if (recentWithdrawal) {
      return NextResponse.json(
        { error: "You can only make one withdrawal per day" },
        { status: 429 }
      );
    }

    // Create withdrawal request as processing
    const withdrawalRequest = new WithdrawalRequest({
      userId: user._id,
      amount: withdrawalAmount,
      phoneNumber,
      status: "pending",
    });

    await withdrawalRequest.save();

    // Attempt immediate payout
    const payoutResult = await intaSendService.initiatePayout({
      amount: withdrawalAmount,
      phoneNumber,
      reference: `WITHDRAWAL-${withdrawalRequest._id}`,
    });

    let finalStatus: "completed" | "failed" = "failed";
    let transactionId: string | undefined;
    let failureReason: string | undefined;

    if (payoutResult.success) {
      finalStatus = "completed";
      transactionId = payoutResult.data?.transaction_id;
      // Deduct from available balance only on successful payout
      user.availableBalance = (user.availableBalance || 0) - withdrawalAmount;
    } else {
      failureReason = payoutResult.message;
      // Don't deduct balance on failure
    }

    // Update withdrawal request
    withdrawalRequest.status = finalStatus;
    withdrawalRequest.transactionId = transactionId;
    withdrawalRequest.failureReason = failureReason;
    withdrawalRequest.processedAt = new Date();
    await withdrawalRequest.save();

    // Add to withdrawal history
    if (!user.withdrawalHistory) user.withdrawalHistory = [];
    user.withdrawalHistory.push({
      withdrawalId: withdrawalRequest._id.toString(),
      amount: withdrawalAmount,
      status: finalStatus,
      requestedAt: new Date(),
      processedAt: new Date(),
      phoneNumber,
    });

    await user.save();

    logger.info("Withdrawal processed", {
      userId: user._id,
      withdrawalId: withdrawalRequest._id,
      amount: withdrawalAmount,
      phoneNumber,
      status: finalStatus,
      transactionId,
      failureReason,
    });

    if (finalStatus === "completed") {
      return NextResponse.json({
        message: "Withdrawal completed successfully",
        withdrawalId: withdrawalRequest._id,
        transactionId,
      });
    } else {
      return NextResponse.json(
        {
          error: "Withdrawal failed",
          details: failureReason,
          withdrawalId: withdrawalRequest._id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
