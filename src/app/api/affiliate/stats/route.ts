import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { usersRepo } from "@/repositories/usersRepo";
import { affiliatesRepo } from "@/repositories/affiliatesRepo";
import { referralsRepo } from "@/repositories/referralsRepo";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from PostgreSQL
    const user = await usersRepo.findById(session.user.id);
    if (!user || user.role !== "affiliate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create affiliate profile
    let affiliate = await affiliatesRepo.findByUserId(user.id);
    if (!affiliate) {
      try {
        affiliate = (await affiliatesRepo.create({
          userId: user.id,
        })) as any;
        console.log("Created missing affiliate profile for user:", user.id);
      } catch (error) {
        console.error("Failed to create affiliate profile:", error);
        return NextResponse.json(
          { error: "Failed to create affiliate profile" },
          { status: 500 }
        );
      }
    }

    // Affiliate should exist now
    if (!affiliate) {
      return NextResponse.json(
        { error: "Failed to get affiliate profile" },
        { status: 500 }
      );
    }

    // Ensure user has a referral code
    let referralCode = user.referralCode;
    if (!referralCode || referralCode.trim() === "") {
      try {
        referralCode = await usersRepo.generateUniqueReferralCode();
        await usersRepo.update(user.id, { referralCode });
      } catch (error) {
        console.error("Failed to generate referral code:", error);
        return NextResponse.json(
          { error: "Failed to generate referral code" },
          { status: 500 }
        );
      }
    }

    // Get referral stats from PostgreSQL
    const referralStats = await referralsRepo.getStats(affiliate.id);

    // Get affiliate stats including commissions
    const affiliateStats = await affiliatesRepo.getStats(affiliate.id);

    // For now, product stats are simplified - in a real implementation,
    // you'd have products table and link commissions to products
    const productStats: any[] = [];

    // Safety net: ensure referralCode exists
    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code missing after generation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalReferrals: referralStats.total, // Clicks
      convertedReferrals: referralStats.converted, // Signups
      totalEarnings: affiliateStats?.totalCommissions || 0,
      availableBalance: affiliate.availableBalance,
      referralCode,
      affiliateId: affiliate.id,
      productStats,
      baseUrl: getBaseUrl(),
    });
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
