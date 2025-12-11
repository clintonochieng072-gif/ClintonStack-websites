import { prisma } from "@/lib/prisma";

export const PlanType = {
  subscription: "subscription",
  one_time: "one_time",
} as const;

export type PlanType = (typeof PlanType)[keyof typeof PlanType];

export interface CreatePlanData {
  name: string;
  slug: string;
  price: number;
  currency?: string;
  features: string[];
  isActive?: boolean;
  sortOrder?: number;
  type?: PlanType;
}

export interface UpdatePlanData {
  name?: string;
  slug?: string;
  price?: number;
  currency?: string;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
  type?: PlanType;
}

export class PlansRepository {
  // Create a new plan
  async create(data: CreatePlanData) {
    return await prisma.plan.create({
      data: {
        name: data.name,
        slug: data.slug,
        price: data.price,
        currency: data.currency || "KES",
        features: data.features,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        type: data.type || "subscription",
      },
    });
  }

  // Find plan by ID
  async findById(id: string) {
    return await prisma.plan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Find plan by slug
  async findBySlug(slug: string) {
    return await prisma.plan.findUnique({
      where: { slug },
      include: {
        subscriptions: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Update plan
  async update(id: string, data: UpdatePlanData) {
    return await prisma.plan.update({
      where: { id },
      data,
      include: {
        subscriptions: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Delete plan
  async delete(id: string) {
    return await prisma.plan.delete({
      where: { id },
    });
  }

  // List plans
  async list(
    options: {
      isActive?: boolean;
      type?: PlanType;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { isActive, type, limit = 50, offset = 0 } = options;

    return await prisma.plan.findMany({
      where: {
        ...(isActive !== undefined && { isActive }),
        ...(type && { type }),
      },
      include: {
        subscriptions: {
          include: {
            user: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { sortOrder: "asc" },
    });
  }

  // Get active plans for display
  async getActivePlans() {
    return await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  // Get plan stats
  async getStats() {
    const [
      totalPlans,
      activePlans,
      subscriptionPlans,
      oneTimePlans,
      totalSubscriptions,
    ] = await Promise.all([
      prisma.plan.count(),
      prisma.plan.count({ where: { isActive: true } }),
      prisma.plan.count({ where: { type: "subscription" } }),
      prisma.plan.count({ where: { type: "one_time" } }),
      prisma.subscription.count(),
    ]);

    return {
      total: totalPlans,
      active: activePlans,
      subscription: subscriptionPlans,
      oneTime: oneTimePlans,
      totalSubscriptions,
    };
  }

  // Check if slug is unique
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.plan.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !existing;
  }

  // Generate unique slug from name
  async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (!(await this.isSlugUnique(slug))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

export const plansRepo = new PlansRepository();
