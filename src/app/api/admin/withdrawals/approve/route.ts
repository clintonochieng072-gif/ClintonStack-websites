import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import WithdrawalRequest from "@/lib/models/WithdrawalRequest";
import { intaSendService } from "@/lib/intasend";

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

    await dbConnect();

    // Get user and verify admin role
    const admin = await User.findById(decoded.userId);
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
    const withdrawal = await WithdrawalRequest.findById(withdrawalId);
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

    // Get the affiliate user
    const affiliate = await User.findById(withdrawal.userId);
    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Initiate payout via IntaSend
      const payoutResult = await intaSendService.initiatePayout({
        amount: withdrawal.amount,
        phoneNumber: withdrawal.phoneNumber,
        reference: `WITHDRAWAL-${withdrawal._id}`,
      });

      if (payoutResult.success) {
        // Update withdrawal status
        withdrawal.status = "completed";
        withdrawal.transactionId = payoutResult.data?.transaction_id;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        // Update user's withdrawal history
        const historyEntry = affiliate.withdrawalHistory?.find(
          (h) => h.withdrawalId === withdrawalId
        );
        if (historyEntry) {
          historyEntry.status = "completed";
          historyEntry.processedAt = new Date();
        }

        await affiliate.save();

        return NextResponse.json({
          message: "Withdrawal approved and payout initiated successfully",
          transactionId: payoutResult.data?.transaction_id,
        });
      } else {
        // Payout failed
        withdrawal.status = "failed";
        withdrawal.failureReason = payoutResult.message;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        // Refund amount to available balance
        affiliate.availableBalance =
          (affiliate.availableBalance || 0) + withdrawal.amount;

        // Update withdrawal history
        const historyEntry = affiliate.withdrawalHistory?.find(
          (h) => h.withdrawalId === withdrawalId
        );
        if (historyEntry) {
          historyEntry.status = "failed";
          historyEntry.processedAt = new Date();
        }

        await affiliate.save();

        return NextResponse.json(
          {
            error: "Payout failed",
            details: payoutResult.message,
          },
          { status: 500 }
        );
      }
    } else if (action === "reject") {
      // Reject the withdrawal
      withdrawal.status = "failed";
      withdrawal.failureReason = "Rejected by admin";
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      // Refund amount to available balance
      affiliate.availableBalance =
        (affiliate.availableBalance || 0) + withdrawal.amount;

      // Update withdrawal history
      const historyEntry = affiliate.withdrawalHistory?.find(
        (h) => h.withdrawalId === withdrawalId
      );
      if (historyEntry) {
        historyEntry.status = "failed";
        historyEntry.processedAt = new Date();
      }

      await affiliate.save();

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
