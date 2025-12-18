import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { usersRepo } from "@/repositories/usersRepo";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use PostgreSQL to find user by email
    const user = await usersRepo.findByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded,
        emailVerified: user.emailVerified,
        referralCode: user.referralCode,
        clientId: user.clientId,
        has_paid: user.has_paid || false,
        subscriptionStatus: user.subscriptionStatus || "trial",
        subscriptionType: user.subscriptionType || null,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
