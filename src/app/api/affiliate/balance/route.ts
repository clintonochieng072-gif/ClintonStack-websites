import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Get user with affiliate data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        affiliate: true,
        withdrawalRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user || user.role !== "affiliate" || !user.affiliate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get balances from affiliate
    const availableBalance = user.affiliate.availableBalance;
    const totalEarned = user.affiliate.totalEarned;

    // Format withdrawal history
    const withdrawalHistory = user.withdrawalRequests.map((req) => ({
      withdrawalId: req.id,
      amount: req.amount,
      status: req.status,
      requestedAt: req.createdAt,
      processedAt: req.processedAt,
      phoneNumber: req.phoneNumber,
    }));

    return NextResponse.json({
      availableBalance,
      totalEarned,
      withdrawalHistory,
    });
  } catch (error) {
    console.error("Error fetching affiliate balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
