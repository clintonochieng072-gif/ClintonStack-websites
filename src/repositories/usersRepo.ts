import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "../lib/utils";
import bcrypt from "bcryptjs";
import { UserRole, SubscriptionStatus } from "../generated/enums";

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  passwordHash?: string;
  role?: UserRole;
  referralCode?: string | null;
  clientId: string;
  referredById?: string | null;
  emailVerified?: boolean;
  onboarded?: boolean;
}

export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  referralCode?: string | null;
  has_paid?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionType?: string;
  onboarded?: boolean;
}

export class UsersRepository {
  // Create a new user
  async create(data: CreateUserData) {
    // Generate referral code for affiliates
    let referralCode = data.referralCode;
    if (data.role === "affiliate" && !referralCode) {
      referralCode = await this.generateUniqueReferralCode();
    }

    return await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || "client",
        referralCode: referralCode,
        clientId: data.clientId,
        referredById: data.referredById,
        emailVerified: data.emailVerified || false,
        onboarded: data.onboarded || false,
      },
      include: {
        affiliate: {
          select: {
            id: true,
            availableBalance: true,
            totalEarned: true,
            commissionRate: true,
          },
        },
      },
    });
  }

  // Find user by ID
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        affiliate: {
          select: {
            id: true,
            availableBalance: true,
            totalEarned: true,
            commissionRate: true,
          },
        },
        referredUsers: {
          include: {
            affiliate: {
              select: {
                id: true,
                commissionRate: true,
              },
            },
          },
        },
        payments: true,
      },
    });
  }

  // Find user by email
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        affiliate: {
          select: {
            id: true,
            availableBalance: true,
            totalEarned: true,
            commissionRate: true,
          },
        },
      },
    });
  }

  // Find user by username
  async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        affiliate: {
          select: {
            id: true,
            availableBalance: true,
            totalEarned: true,
            commissionRate: true,
          },
        },
      },
    });
  }

  // Find user by referral code
  async findByReferralCode(referralCode: string) {
    return await prisma.user.findUnique({
      where: { referralCode },
      include: {
        affiliate: {
          select: {
            id: true,
            availableBalance: true,
            totalEarned: true,
            commissionRate: true,
          },
        },
      },
    });
  }

  // Update user
  async update(id: string, data: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        affiliate: {
          select: {
            id: true,
            availableBalance: true,
            totalEarned: true,
            commissionRate: true,
          },
        },
      },
    });
  }

  // Delete user
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  // List users with pagination
  async list(
    options: {
      role?: UserRole;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { role, limit = 50, offset = 0 } = options;

    return await prisma.user.findMany({
      where: role ? { role } : undefined,
      include: {
        affiliate: {
          select: {
            id: true,
            availableBalance: true,
            totalEarned: true,
            commissionRate: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate unique referral code
  async generateUniqueReferralCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = generateReferralCode();
      const existing = await this.findByReferralCode(code);
      if (!existing) {
        return code;
      }
      attempts++;
    }

    throw new Error("Failed to generate unique referral code");
  }

  // Get user stats
  async getStats() {
    const [totalUsers, affiliates, clients, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "affiliate" } }),
      prisma.user.count({ where: { role: "client" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    return {
      total: totalUsers,
      affiliates,
      clients,
      admins,
    };
  }
}

export const usersRepo = new UsersRepository();
