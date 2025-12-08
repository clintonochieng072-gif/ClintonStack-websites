import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Withdrawal from "@/lib/models/Withdrawal";

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

    const { amount, paymentMethod, paymentDetails } = await request.json();

    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Amount and payment method are required" },
        { status: 400 }
      );
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 1000) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is KES 1,000" },
        { status: 400 }
      );
    }

    if (withdrawalAmount > (user.withdrawableBalance || 0)) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      affiliateId: user._id,
      amount: withdrawalAmount,
      paymentMethod,
      paymentDetails: paymentDetails || null,
      status: "pending",
    });

    await withdrawal.save();

    // Deduct from withdrawable balance
    user.withdrawableBalance =
      (user.withdrawableBalance || 0) - withdrawalAmount;
    await user.save();

    return NextResponse.json({
      message: "Withdrawal request submitted successfully",
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
