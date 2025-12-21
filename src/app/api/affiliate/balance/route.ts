import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with affiliate data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      processedAt: req.processedAt as Date | undefined,
      phoneNumber: req.phoneNumber as string | undefined,
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
