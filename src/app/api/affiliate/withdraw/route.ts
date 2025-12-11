import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import WithdrawalRequest from "@/lib/models/WithdrawalRequest";
import { logger } from "@/lib/logger";

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

    // Withdrawal requests are now processed manually by admin
    // Just create the request as pending

    // Add to withdrawal history
    if (!user.withdrawalHistory) user.withdrawalHistory = [];
    user.withdrawalHistory.push({
      withdrawalId: withdrawalRequest._id.toString(),
      amount: withdrawalAmount,
      status: "pending",
      requestedAt: new Date(),
      phoneNumber,
    });

    await user.save();

    logger.info("Withdrawal request created", {
      userId: user._id,
      withdrawalId: withdrawalRequest._id,
      amount: withdrawalAmount,
      phoneNumber,
      status: "pending",
    });

    return NextResponse.json({
      message:
        "Withdrawal request submitted successfully. It will be processed manually.",
      withdrawalId: withdrawalRequest._id,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
