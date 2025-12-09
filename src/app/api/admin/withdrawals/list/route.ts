import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import WithdrawalRequest from "@/lib/models/WithdrawalRequest";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, completed, failed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    // Get withdrawals with pagination
    const withdrawals = await WithdrawalRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get total count
    const total = await WithdrawalRequest.countDocuments(query);

    // Get unique user IDs
    const userIds = [...new Set(withdrawals.map((w) => w.userId))];

    // Fetch user details
    const users = await User.find({ _id: { $in: userIds } })
      .select("name email username")
      .lean();

    // Create user map
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {} as Record<string, any>);

    // Format response
    const formattedWithdrawals = withdrawals.map((withdrawal) => {
      const user = userMap[withdrawal.userId];
      return {
        id: withdrawal._id,
        userId: withdrawal.userId,
        userName: user?.name || "Unknown",
        userEmail: user?.email || "Unknown",
        userUsername: user?.username || "Unknown",
        amount: withdrawal.amount,
        phoneNumber: withdrawal.phoneNumber,
        status: withdrawal.status,
        transactionId: withdrawal.transactionId,
        failureReason: withdrawal.failureReason,
        createdAt: withdrawal.createdAt,
        processedAt: withdrawal.processedAt,
      };
    });

    return NextResponse.json({
      withdrawals: formattedWithdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
