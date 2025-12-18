import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    // Get affiliate statistics
    const totalAffiliates = await prisma.affiliate.count();

    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: true,
        commissions: {
          where: { status: "paid" },
        },
      },
    });

    let totalEarnings = 0;
    let topAffiliate = null;
    let maxEarnings = 0;

    affiliates.forEach((affiliate) => {
      const earnings = affiliate.commissions.reduce(
        (sum, commission) => sum + commission.commissionAmount,
        0
      );
      totalEarnings += earnings;

      if (earnings > maxEarnings) {
        maxEarnings = earnings;
        topAffiliate = {
          name: affiliate.user.name,
          earnings,
        };
      }
    });

    // Get pending withdrawals count
    const pendingWithdrawals = await prisma.withdrawalRequest.count({
      where: { status: "pending" },
    });

    return NextResponse.json({
      totalAffiliates,
      totalEarnings,
      pendingWithdrawals,
      topAffiliate,
    });
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
