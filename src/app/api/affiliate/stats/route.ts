import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/repositories/usersRepo";
import { affiliatesRepo } from "@/repositories/affiliatesRepo";
import { referralsRepo } from "@/repositories/referralsRepo";

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

    // Get user from PostgreSQL
    const user = await usersRepo.findById(decoded.userId);
    if (!user || user.role !== "affiliate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get affiliate profile
    const affiliate = await affiliatesRepo.findByUserId(user.id);
    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate profile not found" },
        { status: 404 }
      );
    }

    // Get referral stats from PostgreSQL
    const referralStats = await referralsRepo.getStats(affiliate.id);

    // Get affiliate stats including commissions
    const affiliateStats = await affiliatesRepo.getStats(affiliate.id);

    // For now, product stats are simplified - in a real implementation,
    // you'd have products table and link commissions to products
    const productStats: any[] = [];

    return NextResponse.json({
      totalReferrals: referralStats.total,
      pendingPayments: referralStats.active, // Active referrals could be considered pending
      totalEarnings: affiliateStats?.totalCommissions || 0,
      availableBalance: affiliateStats?.pendingCommissions || 0, // Pending commissions as available balance
      referralCode: user.referralCode,
      productStats,
    });
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
