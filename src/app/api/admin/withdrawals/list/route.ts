import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";


export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user and verify admin role
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, completed, failed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    // Get withdrawals with pagination
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true, username: true } },
      },
    });

    // Get total count
    const total = await prisma.withdrawalRequest.count({ where });

    // Create user map
    const userMap = withdrawals.reduce((map, withdrawal) => {
      if (withdrawal.user) {
        map[withdrawal.userId] = withdrawal.user;
      }
      return map;
    }, {} as Record<string, any>);

    // Format response
    const formattedWithdrawals = withdrawals.map((withdrawal) => {
      const user = withdrawal.user;
      return {
        id: withdrawal.id,
        userId: withdrawal.userId,
        userName: user?.name || "Unknown",
        userEmail: user?.email || "Unknown",
        userUsername: user?.username || "Unknown",
        amount: withdrawal.amount,
        phoneNumber: withdrawal.phoneNumber,
        mpesaName: withdrawal.mpesaName,
        status: withdrawal.status,
        transactionId: withdrawal.transactionId,
        failureReason: withdrawal.failureReason,
        createdAt: withdrawal.createdAt,
        processedAt: withdrawal.processedAt,
      };
    });

    return NextResponse.json({
      withdrawals: formattedWithdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
