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

// Helper for safe repository calls with logging
async function safeCall<T>(fn: () => Promise<T>, name: string): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    console.error(`Error in ${name} (${__filename}):`, err.stack);
    throw err;
  }
}

export const dynamic = "force-dynamic";

export default async function AffiliateDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect("/auth/login");
  }

  // Get user from PostgreSQL
  const user = await usersRepo.findById(session.user.id);
  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "affiliate") {
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

  // Create plain user object to avoid circular references
  const plainUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    onboarded: user.onboarded,
    emailVerified: user.emailVerified,
    referralCode: user.referralCode,
    clientId: user.clientId,
    has_paid: user.has_paid,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionType: user.subscriptionType,
  };

  console.log("Starting Promise.all for affiliate data");
  // Fetch all data server-side
  let referralStats, affiliateStats, referrals, products, balanceData;
  try {
    [referralStats, affiliateStats, referrals, products, balanceData] =
      await Promise.all([
        safeCall(
          () => referralsRepo.getStats(affiliate.id),
          "referralsRepo.getStats"
        ),
        safeCall(
          () => affiliatesRepo.getStats(affiliate.id),
          "affiliatesRepo.getStats"
        ),
        safeCall(
          () => referralsRepo.listByAffiliate(affiliate.id),
          "referralsRepo.listByAffiliate"
        ),
        (async () => {
          await dbConnect();
          const products = await Product.find({
            isActive: true,
            status: "active",
            name: "ClintonStack Real Estate",
          })
            .select(
              "name description slug commissionRate features pricing sortOrder"
            )
            .sort({ sortOrder: 1, name: 1 });
          // Map to plain objects to avoid circular references
          return products.map((p: any) => ({
            _id: p._id.toString(),
            name: p.name,
            description: p.description,
            slug: p.slug,
            commissionRate: p.commissionRate,
            features: p.features || [],
            pricing: p.pricing || [],
          }));
        })(),
        (async () => {
          const userWithAffiliate = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
              affiliate: {
                select: {
                  availableBalance: true,
                  totalEarned: true,
                },
              },
              withdrawalRequests: {
                orderBy: { createdAt: "desc" },
              },
            },
          });
          if (!userWithAffiliate?.affiliate) return null;
          return {
            availableBalance: userWithAffiliate.affiliate.availableBalance,
            totalEarned: userWithAffiliate.affiliate.totalEarned,
            withdrawalHistory: userWithAffiliate.withdrawalRequests.map(
              (req) => ({
                withdrawalId: req.id,
                amount: req.amount,
                status: req.status,
                requestedAt: req.createdAt,
                processedAt: req.processedAt,
                phoneNumber: req.phoneNumber,
              })
            ),
          };
        })(),
      ]);
  } catch (err: any) {
    console.error("Error in affiliate dashboard data fetch:", {
      message: err.message,
      stack: err.stack,
      file: __filename,
    });
    throw err; // rethrow if needed
  }

  // Format referrals - ensure no circular references
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
        clientId: referral.referredUserId, // use ID instead of object
        productId: "real-estate",
        clientName: referral.referredUser?.name || "Unknown",
        clientEmail: referral.referredUser?.email || "",
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

  // Serialize to break any potential circular references
  const serializedStats = JSON.parse(JSON.stringify(stats));
  const serializedBalance = JSON.parse(JSON.stringify(balanceData));
  const serializedReferrals = JSON.parse(JSON.stringify(formattedReferrals));
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedUser = JSON.parse(JSON.stringify(plainUser));

  return (
    <AffiliateDashboardClient
      initialStats={serializedStats}
      initialBalance={serializedBalance}
      initialReferrals={serializedReferrals}
      initialProducts={serializedProducts}
      user={serializedUser}
    />
  );
}
