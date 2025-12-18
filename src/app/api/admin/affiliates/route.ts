import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.email !== "clintonochieng072@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
          include: {
            withdrawalRequests: {
              select: {
                id: true,
                amount: true,
                phoneNumber: true,
                status: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        commissions: true,
        referrals: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      affiliates,
      total: affiliates.length,
    });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
