import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { usersRepo } from "@/repositories/usersRepo";
import { getUserFromToken } from "@/lib/auth";

export async function GET() {
  try {
    // Try NextAuth session first
    const session = await auth();

    let user;
    if (session?.user?.email) {
      // Use PostgreSQL to find user by email
      user = await usersRepo.findByEmail(session.user.email);
    } else {
      // Fall back to JWT token
      const tokenUser = await getUserFromToken();
      if (tokenUser) {
        // Use PostgreSQL to find user by ID
        user = await usersRepo.findById(tokenUser.id);
      }
    }

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
