import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      session.user.email !== "clintonochieng072@gmail.com"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const users = await prisma.user.findMany({
      where: {
        role: "client",
        has_paid: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        payments: {
          select: {
            amount: true,
            paymentMethod: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      users,
      total: await prisma.user.count({
        where: {
          role: "client",
          has_paid: false,
        },
      }),
    });
  } catch (error) {
    console.error("Error fetching unpaid users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      session.user.email !== "clintonochieng072@gmail.com"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user to paid
    await prisma.user.update({
      where: { id: userId },
      data: { has_paid: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "manual_payment_approval",
        details: { userId },
        targetId: userId,
        userId: session.user.id,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "payment_approved",
        message: `Payment approved for user: ${user.name}`,
        data: { userId, userName: user.name },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "User payment approved successfully",
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
