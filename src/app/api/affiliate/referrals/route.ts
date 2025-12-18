import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/repositories/usersRepo";
import { affiliatesRepo } from "@/repositories/affiliatesRepo";
import { referralsRepo } from "@/repositories/referralsRepo";
import { prisma } from "@/lib/prisma";

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

    // Get referrals with client details and commissions
    const referrals = await referralsRepo.listByAffiliate(affiliate.id);

    // Format the response
    const formattedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        // Get commission for this referral's user
        const commission = await prisma.commission.findFirst({
          where: {
            affiliateId: affiliate.id,
            payment: {
              userId: referral.referredUserId,
            },
          },
        });

        return {
          _id: referral.id,
          clientId: referral.referredUser.id,
          clientName: referral.referredUser.name,
          clientEmail: referral.referredUser.email,
          signupDate: referral.createdAt,
          paymentStatus: commission ? "paid" : "pending",
          commissionEarned: commission?.commissionAmount || 0,
        };
      })
    );

    return NextResponse.json(formattedReferrals);
  } catch (error) {
    console.error("Error fetching affiliate referrals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
