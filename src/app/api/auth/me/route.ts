import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { usersRepo } from "@/repositories/usersRepo";

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use PostgreSQL to find user by email
    const user = await usersRepo.findByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return user data without sensitive fields
    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      onboarded: user.onboarded,
      emailVerified: user.emailVerified,
      referralCode: user.referralCode,
      clientId: user.clientId,
      // Legacy fields for compatibility
      category: null,
      niche: null,
      avatarUrl: null,
      plan: null,
      status: "active",
      customDomain: null,
      has_paid: user.has_paid || false,
      is_first_login: false,
      subscriptionStatus: user.subscriptionStatus || "trial",
      subscriptionType: user.subscriptionType || null,
      trialEndsAt: null,
      availableBalance: 0,
      totalEarned: 0,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
