import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "../generated/enums";

export interface CreatePaymentData {
  userId: string;
  amount: number;
  status?: PaymentStatus;
  paymentMethod: string;
  transactionId?: string | null;
  planType: string;
}

export interface UpdatePaymentData {
  amount?: number;
  status?: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string | null;
  planType?: string;
}

export class PaymentsRepository {
  // Create a new payment
  async create(data: CreatePaymentData) {
    return await prisma.payment.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        status: data.status || "pending",
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        planType: data.planType,
      },
      include: {
        user: true,
        commissions: {
          include: {
            affiliate: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  // Find payment by ID
  async findById(id: string) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        commissions: {
          include: {
            affiliate: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  // Find payment by transaction ID
  async findByTransactionId(transactionId: string) {
    return await prisma.payment.findUnique({
      where: { transactionId },
      include: {
        user: true,
        commissions: true,
      },
    });
  }

  // Update payment
  async update(id: string, data: UpdatePaymentData) {
    return await prisma.payment.update({
      where: { id },
      data,
      include: {
        user: true,
        commissions: {
          include: {
            affiliate: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  // Delete payment
  async delete(id: string) {
    return await prisma.payment.delete({
      where: { id },
    });
  }

  // List payments for a user
  async listByUser(
    userId: string,
    options: {
      status?: PaymentStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, limit = 50, offset = 0 } = options;

    return await prisma.payment.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        commissions: {
          include: {
            affiliate: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // List all payments
  async list(
    options: {
      status?: PaymentStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, limit = 50, offset = 0 } = options;

    return await prisma.payment.findMany({
      where: status ? { status } : undefined,
      include: {
        user: true,
        commissions: {
          include: {
            affiliate: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // Mark payment as successful and create commission if applicable (transactional)
  async markSuccessful(id: string) {
    return await prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!payment) throw new Error("Payment not found");

      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status: "success" },
        include: {
          user: true,
          commissions: {
            include: {
              affiliate: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Check if user was referred and create commission
      const referredUser = await tx.user.findUnique({
        where: { id: payment.userId },
        include: {
          referredUsers: {
            include: {
              affiliate: true,
            },
          },
        },
      });

      if (referredUser && referredUser.referredUsers.length > 0) {
        const referral = referredUser.referredUsers[0];
        if (referral.affiliate) {
          // Calculate commission
          const commissionAmount =
            payment.amount * referral.affiliate.commissionRate;

          // Create commission
          await tx.commission.create({
            data: {
              affiliateId: referral.affiliate.id,
              paymentId: payment.id,
              commissionAmount,
              status: "pending",
            },
          });

          // Mark referral as converted if not already
          if (referral.status !== "converted") {
            await tx.referral.update({
              where: { id: referral.id },
              data: {
                status: "converted",
                conversionTimestamp: new Date(),
              },
            });
          }
        }
      }

      return updatedPayment;
    });
  }

  // Get payment stats
  async getStats() {
    const [
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "success" } }),
      prisma.payment.count({ where: { status: "pending" } }),
      prisma.payment.count({ where: { status: "failed" } }),
      prisma.payment.aggregate({
        where: { status: "success" },
        _sum: { amount: true },
      }),
    ]);

    return {
      total: totalPayments,
      successful: successfulPayments,
      pending: pendingPayments,
      failed: failedPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}

export const paymentsRepo = new PaymentsRepository();
