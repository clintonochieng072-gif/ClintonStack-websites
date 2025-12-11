import { prisma } from "@/lib/prisma";

export const SubscriptionStatus = {
  active: "active",
  cancelled: "cancelled",
  expired: "expired",
  trial: "trial",
  lifetime: "lifetime",
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  paymentMethod?: string;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionData {
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  paymentMethod?: string;
  autoRenew?: boolean;
}

export class SubscriptionsRepository {
  // Create a new subscription
  async create(data: CreateSubscriptionData) {
    return await prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status || "trial",
        currentPeriodStart: data.currentPeriodStart || new Date(),
        currentPeriodEnd:
          data.currentPeriodEnd ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        trialEndsAt:
          data.trialEndsAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        cancelledAt: data.cancelledAt,
        paymentMethod: data.paymentMethod,
        autoRenew: data.autoRenew ?? true,
      },
      include: {
        user: true,
        plan: true,
      },
    });
  }

  // Find subscription by ID
  async findById(id: string) {
    return await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: true,
        plan: true,
      },
    });
  }

  // Find subscription by user ID
  async findByUserId(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: true,
        plan: true,
      },
    });
  }

  // Update subscription
  async update(id: string, data: UpdateSubscriptionData) {
    return await prisma.subscription.update({
      where: { id },
      data,
      include: {
        user: true,
        plan: true,
      },
    });
  }

  // Update subscription by user ID
  async updateByUserId(userId: string, data: UpdateSubscriptionData) {
    return await prisma.subscription.update({
      where: { userId },
      data,
      include: {
        user: true,
        plan: true,
      },
    });
  }

  // Delete subscription
  async delete(id: string) {
    return await prisma.subscription.delete({
      where: { id },
    });
  }

  // List subscriptions with pagination
  async list(
    options: {
      status?: SubscriptionStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, limit = 50, offset = 0 } = options;

    return await prisma.subscription.findMany({
      where: status ? { status } : undefined,
      include: {
        user: true,
        plan: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // Get subscriptions expiring soon
  async getExpiringSoon(days: number = 7) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return await prisma.subscription.findMany({
      where: {
        currentPeriodEnd: {
          lte: futureDate,
          gt: new Date(),
        },
        status: "active",
        autoRenew: true,
      },
      include: {
        user: true,
        plan: true,
      },
    });
  }

  // Get subscription stats
  async getStats() {
    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.subscription.count({ where: { status: "trial" } }),
      prisma.subscription.count({ where: { status: "cancelled" } }),
    ]);

    return {
      total: totalSubscriptions,
      active: activeSubscriptions,
      trial: trialSubscriptions,
      cancelled: cancelledSubscriptions,
    };
  }
}

export const subscriptionsRepo = new SubscriptionsRepository();
