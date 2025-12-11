import { prisma } from "@/lib/prisma";
import { ReferralStatus } from "../generated/enums";

export interface CreateReferralData {
  affiliateId: string;
  referredUserId: string;
  clickTimestamp?: Date;
  conversionTimestamp?: Date | null;
  status?: ReferralStatus;
}

export interface UpdateReferralData {
  clickTimestamp?: Date;
  conversionTimestamp?: Date | null;
  status?: ReferralStatus;
}

export class ReferralsRepository {
  // Create a new referral
  async create(data: CreateReferralData) {
    return await prisma.referral.create({
      data: {
        affiliateId: data.affiliateId,
        referredUserId: data.referredUserId,
        clickTimestamp: data.clickTimestamp || new Date(),
        conversionTimestamp: data.conversionTimestamp,
        status: data.status || "active",
      },
      include: {
        affiliate: {
          include: {
            user: true,
          },
        },
        referredUser: true,
      },
    });
  }

  // Find referral by ID
  async findById(id: string) {
    return await prisma.referral.findUnique({
      where: { id },
      include: {
        affiliate: {
          include: {
            user: true,
          },
        },
        referredUser: true,
      },
    });
  }

  // Find referral by affiliate and referred user
  async findByAffiliateAndUser(affiliateId: string, referredUserId: string) {
    return await prisma.referral.findUnique({
      where: {
        affiliateId_referredUserId: {
          affiliateId,
          referredUserId,
        },
      },
      include: {
        affiliate: {
          include: {
            user: true,
          },
        },
        referredUser: true,
      },
    });
  }

  // Update referral
  async update(id: string, data: UpdateReferralData) {
    return await prisma.referral.update({
      where: { id },
      data,
      include: {
        affiliate: {
          include: {
            user: true,
          },
        },
        referredUser: true,
      },
    });
  }

  // Delete referral
  async delete(id: string) {
    return await prisma.referral.delete({
      where: { id },
    });
  }

  // List referrals for an affiliate
  async listByAffiliate(
    affiliateId: string,
    options: {
      status?: ReferralStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, limit = 50, offset = 0 } = options;

    return await prisma.referral.findMany({
      where: {
        affiliateId,
        ...(status && { status }),
      },
      include: {
        referredUser: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // Convert referral (mark as converted)
  async convertReferral(id: string) {
    return await this.update(id, {
      status: "converted",
      conversionTimestamp: new Date(),
    });
  }

  // Get referral stats
  async getStats(affiliateId?: string) {
    const where = affiliateId ? { affiliateId } : {};

    const [totalReferrals, activeReferrals, convertedReferrals] =
      await Promise.all([
        prisma.referral.count({ where }),
        prisma.referral.count({ where: { ...where, status: "active" } }),
        prisma.referral.count({ where: { ...where, status: "converted" } }),
      ]);

    return {
      total: totalReferrals,
      active: activeReferrals,
      converted: convertedReferrals,
      conversionRate:
        totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0,
    };
  }
}

export const referralsRepo = new ReferralsRepository();
