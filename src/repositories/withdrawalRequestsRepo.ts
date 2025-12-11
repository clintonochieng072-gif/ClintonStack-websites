import { prisma } from "@/lib/prisma";

export const WithdrawalStatus = {
  pending: "pending",
  completed: "completed",
  failed: "failed",
} as const;

export type WithdrawalStatus =
  (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export interface CreateWithdrawalRequestData {
  userId: string;
  phoneNumber: string;
  amount: number;
  status?: WithdrawalStatus;
  transactionId?: string;
  failureReason?: string;
  processedAt?: Date;
}

export interface UpdateWithdrawalRequestData {
  status?: WithdrawalStatus;
  transactionId?: string;
  failureReason?: string;
  processedAt?: Date;
}

export class WithdrawalRequestsRepository {
  // Create a new withdrawal request
  async create(data: CreateWithdrawalRequestData) {
    return await prisma.withdrawalRequest.create({
      data: {
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        amount: data.amount,
        status: data.status || "pending",
        transactionId: data.transactionId,
        failureReason: data.failureReason,
        processedAt: data.processedAt,
      },
      include: {
        user: true,
      },
    });
  }

  // Find withdrawal request by ID
  async findById(id: string) {
    return await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  // Find withdrawal requests by user ID
  async findByUserId(
    userId: string,
    options: {
      status?: WithdrawalStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, limit = 50, offset = 0 } = options;

    return await prisma.withdrawalRequest.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        user: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // Update withdrawal request
  async update(id: string, data: UpdateWithdrawalRequestData) {
    return await prisma.withdrawalRequest.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  // Delete withdrawal request
  async delete(id: string) {
    return await prisma.withdrawalRequest.delete({
      where: { id },
    });
  }

  // List withdrawal requests with pagination
  async list(
    options: {
      status?: WithdrawalStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, limit = 50, offset = 0 } = options;

    return await prisma.withdrawalRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        user: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // Get pending withdrawal requests
  async getPending() {
    return await prisma.withdrawalRequest.findMany({
      where: { status: "pending" },
      include: {
        user: true,
      },
      orderBy: { createdAt: "asc" }, // Process oldest first
    });
  }

  // Get withdrawal request stats
  async getStats() {
    const [
      totalRequests,
      pendingRequests,
      completedRequests,
      failedRequests,
      totalAmount,
    ] = await Promise.all([
      prisma.withdrawalRequest.count(),
      prisma.withdrawalRequest.count({ where: { status: "pending" } }),
      prisma.withdrawalRequest.count({ where: { status: "completed" } }),
      prisma.withdrawalRequest.count({ where: { status: "failed" } }),
      prisma.withdrawalRequest.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
    ]);

    return {
      total: totalRequests,
      pending: pendingRequests,
      completed: completedRequests,
      failed: failedRequests,
      totalAmountPaid: totalAmount._sum.amount || 0,
    };
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    // Kenyan phone number validation (07XXXXXXXX or +2547XXXXXXXX)
    return /^(\+254|0)7[0-9]{8}$/.test(phoneNumber);
  }

  // Check minimum withdrawal amount
  validateAmount(amount: number): boolean {
    return amount >= 200; // Minimum 200 KES
  }
}

export const withdrawalRequestsRepo = new WithdrawalRequestsRepository();
