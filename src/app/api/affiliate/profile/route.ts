import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with affiliate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { affiliate: true },
    });

    if (!user || user.role !== "affiliate" || !user.affiliate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      mpesaName: user.affiliate.mpesaName,
      mpesaPhone: user.affiliate.mpesaPhone,
    });
  } catch (error) {
    console.error("Error fetching affiliate profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with affiliate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { affiliate: true },
    });

    if (!user || user.role !== "affiliate" || !user.affiliate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, mpesaName, mpesaPhone } = await request.json();

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
    });

    // Update affiliate
    await prisma.affiliate.update({
      where: { userId: user.id },
      data: { mpesaName, mpesaPhone },
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating affiliate profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
