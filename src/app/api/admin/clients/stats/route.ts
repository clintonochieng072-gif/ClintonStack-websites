import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isValid) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
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

    const unpaidClients = totalClients - paidClients;

    return NextResponse.json({
      totalClients,
      paidClients,
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
