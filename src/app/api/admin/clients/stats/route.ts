import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
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

    // Get client statistics
    const totalClients = await prisma.user.count({
      where: { role: "client" },
    });

    const paidClients = await prisma.user.count({
      where: {
        role: "client",
        has_paid: true,
      },
    });

    const activeClients = await prisma.user.count({
      where: {
        role: "client",
        subscription: {
          status: {
            in: ["active", "lifetime"],
          },
        },
      },
    });

    const inactiveClients = totalClients - activeClients;

    const unpaidClients = totalClients - paidClients;

    return NextResponse.json({
      totalClients,
      paidClients,
      activeClients,
      inactiveClients,
      unpaidClients,
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
