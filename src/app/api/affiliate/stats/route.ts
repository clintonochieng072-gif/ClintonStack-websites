import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Referral from "@/lib/models/Referral";
import AffiliateEarnings from "@/lib/models/AffiliateEarnings";
import Product from "@/lib/models/Product";

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

    // Get referral stats
    const referrals = await Referral.find({ referrerId: user._id });

    const totalReferrals = referrals.length;
    const pendingPayments = referrals.filter(
      (r) => r.paymentStatus === "pending"
    ).length;
    const paidReferrals = referrals.filter(
      (r) => r.paymentStatus === "paid"
    ).length;

    // Get product-specific stats
    const affiliateEarnings = await AffiliateEarnings.find({
      affiliateId: user._id,
    })
      .populate("productId", "name slug")
      .sort({ lastUpdated: -1 });

    const productStats = affiliateEarnings.map((earning) => {
      const product = earning.productId as any;
      return {
        productId: product._id || product,
        productName: product.name || "Unknown Product",
        referralCount: earning.referralCount,
        paidReferralCount: earning.paidReferralCount,
        earnings: earning.paidEarnings,
      };
    });

    // Calculate total earnings from all products
    const totalEarnings = affiliateEarnings.reduce(
      (sum, earning) => sum + earning.paidEarnings,
      0
    );
    const withdrawableBalance = user.withdrawableBalance || 0;

    return NextResponse.json({
      totalReferrals,
      pendingPayments,
      totalEarnings,
      withdrawableBalance,
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
