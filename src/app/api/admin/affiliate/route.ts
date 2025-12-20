import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

const isAdmin = (user: any) => user.email === "clintonochieng072@gmail.com";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all affiliate users
    const affiliates = await prisma.user.findMany({
      where: { role: "affiliate" },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        createdAt: true,
      },
    });

    // For each affiliate, count referrals and calculate status
    const affiliateData = await Promise.all(
      affiliates.map(async (affiliate) => {
        const referralCount = await prisma.referral.count({
          where: { affiliateId: affiliate.id },
        });

        // TODO: Calculate totalEarned and availableBalance from commissions/withdrawals
        const totalEarned = 0; // Placeholder
        const availableBalance = 0; // Placeholder

        return {
          _id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          referralCode: affiliate.referralCode,
          totalEarned,
          availableBalance,
          clientsReferred: referralCount,
          status: referralCount > 0 ? "active" : "inactive",
          createdAt: affiliate.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      affiliates: affiliateData,
    });
  } catch (error: any) {
    console.error("Admin affiliate fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
