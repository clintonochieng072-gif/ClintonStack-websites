import { prisma } from "@/lib/prisma";
import { AffiliateStatus } from "../generated/enums";

export interface CreateAffiliateData {
  userId: string;
  commissionRate?: number;
  payoutMethod?: string;
  status?: AffiliateStatus;
}

export interface UpdateAffiliateData {
  commissionRate?: number;
  payoutMethod?: string;
  status?: AffiliateStatus;
}

export class AffiliatesRepository {
  // Create affiliate profile for user
  async create(data: CreateAffiliateData) {
    return await prisma.affiliate.create({
      data: {
        userId: data.userId,
        commissionRate: data.commissionRate || 0.1, // 10% default
        payoutMethod: data.payoutMethod,
        status: data.status || "active",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            referralCode: true,
          },
        },
        referrals: {
          include: {
            referredUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        commissions: true,
      },
    });
  }

  // Find affiliate by ID
  async findById(id: string) {
    return await prisma.affiliate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            referralCode: true,
          },
        },
        referrals: {
          include: {
            referredUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        commissions: {
          include: {
            payment: true,
          },
        },
      },
    });
  }

  // Find affiliate by user ID
  async findByUserId(userId: string) {
    return await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            referralCode: true,
          },
        },
        referrals: {
          include: {
            referredUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        commissions: {
          include: {
            payment: true,
          },
        },
      },
    });
  }

  // Update affiliate
  async update(id: string, data: UpdateAffiliateData) {
    return await prisma.affiliate.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            referralCode: true,
          },
        },
      },
    });
  }

  // Delete affiliate
  async delete(id: string) {
    return await prisma.affiliate.delete({
      where: { id },
    });
  }

  // List affiliates with pagination
  async list(
    options: {
      status?: AffiliateStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, limit = 50, offset = 0 } = options;

    return await prisma.affiliate.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            referralCode: true,
          },
        },
        _count: {
          select: {
            referrals: true,
            commissions: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // Get affiliate stats
  async getStats(affiliateId: string) {
    const affiliate = await this.findById(affiliateId);
    if (!affiliate) return null;

    const [
      totalReferrals,
      convertedReferrals,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
    ] = await Promise.all([
      prisma.referral.count({ where: { affiliateId } }),
      prisma.referral.count({ where: { affiliateId, status: "converted" } }),
      prisma.commission.aggregate({
        where: { affiliateId },
        _sum: { commissionAmount: true },
      }),
      prisma.commission.aggregate({
        where: { affiliateId, status: "paid" },
        _sum: { commissionAmount: true },
      }),
      prisma.commission.aggregate({
        where: { affiliateId, status: "pending" },
        _sum: { commissionAmount: true },
      }),
    ]);

    return {
      affiliateId,
      totalReferrals,
      convertedReferrals,
      conversionRate:
        totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0,
      totalCommissions: totalCommissions._sum.commissionAmount || 0,
      paidCommissions: paidCommissions._sum.commissionAmount || 0,
      pendingCommissions: pendingCommissions._sum.commissionAmount || 0,
    };
  }

  // Get affiliate leaderboard
  async getLeaderboard(limit: number = 10) {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            referralCode: true,
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
        commissions: {
          select: {
            commissionAmount: true,
            status: true,
          },
        },
      },
    });

    // Calculate earnings for each affiliate
    const leaderboard = affiliates.map((affiliate: any) => {
      const totalEarnings = affiliate.commissions
        .filter((c: any) => c.status === "paid")
        .reduce((sum: number, c: any) => sum + c.commissionAmount, 0);

      return {
        id: affiliate.id,
        userId: affiliate.userId,
        email: affiliate.user.email,
        referralCode: affiliate.user.referralCode,
        totalReferrals: affiliate._count.referrals,
        totalEarnings,
        commissionRate: affiliate.commissionRate,
      };
    });

    // Sort by total earnings descending
    return leaderboard
      .sort((a: any, b: any) => b.totalEarnings - a.totalEarnings)
      .slice(0, limit);
  }
}

export const affiliatesRepo = new AffiliatesRepository();
