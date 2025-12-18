import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    // Get available balance (real money only)
    const availableBalance = user.availableBalance || 0;

    // Get total earned
    const totalEarned = user.totalEarned || 0;

    return NextResponse.json({
      availableBalance,
      totalEarned,
      withdrawalHistory: user.withdrawalHistory || [],
    });
  } catch (error) {
    console.error("Error fetching affiliate balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
