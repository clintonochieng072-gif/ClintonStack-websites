import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { usersRepo } from "@/repositories/usersRepo";
import { affiliatesRepo } from "@/repositories/affiliatesRepo";
import { referralsRepo } from "@/repositories/referralsRepo";
import { prisma } from "@/lib/prisma";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import AffiliateDashboardClient from "@/components/AffiliateDashboardClient";
import { redirect } from "next/navigation";

export default async function AffiliateDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect("/auth/login");
  }

  // Get user from PostgreSQL
  const user = await usersRepo.findById(session.user.id);
  if (!user || user.role !== "affiliate") {
    redirect("/dashboard");
  }

  // Get or create affiliate profile
  let affiliate = await affiliatesRepo.findByUserId(user.id);
  if (!affiliate) {
    affiliate = (await affiliatesRepo.create({
      userId: user.id,
    })) as any;
  }
  if (!affiliate) {
    throw new Error("Failed to create affiliate profile");
  }

  // Ensure user has a referral code
  let referralCode = user.referralCode;
  if (!referralCode || referralCode.trim() === "") {
    referralCode = await usersRepo.generateUniqueReferralCode();
    await usersRepo.update(user.id, { referralCode });
  }

  // Fetch all data server-side
  const [referralStats, affiliateStats, referrals, products, balanceData] = await Promise.all([
    referralsRepo.getStats(affiliate.id),
    affiliatesRepo.getStats(affiliate.id),
    referralsRepo.listByAffiliate(affiliate.id),
    (async () => {
      await dbConnect();
      return Product.find({
        isActive: true,
        status: "active",
        name: "ClintonStack Real Estate",
      })
        .select("name description slug commissionRate features pricing sortOrder")
        .sort({ sortOrder: 1, name: 1 });
    })(),
    (async () => {
      const userWithAffiliate = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          affiliate: true,
          withdrawalRequests: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!userWithAffiliate?.affiliate) return null;
      return {
        availableBalance: userWithAffiliate.affiliate.availableBalance,
        totalEarned: userWithAffiliate.affiliate.totalEarned,
        withdrawalHistory: userWithAffiliate.withdrawalRequests.map((req) => ({
          withdrawalId: req.id,
          amount: req.amount,
          status: req.status,
          requestedAt: req.createdAt,
          processedAt: req.processedAt,
          phoneNumber: req.phoneNumber,
        })),
      };
    })(),
  ]);

  // Format referrals
  const formattedReferrals = await Promise.all(
    referrals.map(async (referral) => {
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
        productId: "real-estate",
        clientName: referral.referredUser.name,
        clientEmail: referral.referredUser.email,
        signupDate: referral.createdAt,
        paymentStatus: (commission ? "paid" : "pending") as "pending" | "paid",
        commissionEarned: commission?.commissionAmount || 0,
        productName: "ClintonStack Real Estate",
      };
    })
  );

  const stats = {
    totalReferrals: referralStats.total,
    convertedReferrals: referralStats.converted,
    totalEarnings: affiliateStats?.totalCommissions || 0,
    availableBalance: affiliate.availableBalance,
    referralCode,
    affiliateId: affiliate.id,
    productStats: [],
  };

  return (
    <AffiliateDashboardClient
      initialStats={stats}
      initialBalance={balanceData}
      initialReferrals={formattedReferrals}
      initialProducts={products}
      user={user}
    />
  );
}
