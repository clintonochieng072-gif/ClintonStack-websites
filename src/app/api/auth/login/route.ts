// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { usersRepo } from "@/repositories/usersRepo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email using PostgreSQL
    const user = await usersRepo.findByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Handle new Google users (check if passwordHash matches hash of "google")
    const googleTempHash = await bcrypt.hash("google", 12);
    const isGoogleUser =
      user.passwordHash && (await bcrypt.compare("google", user.passwordHash));

    if (isGoogleUser) {
      // Set the password for new Google user
      const passwordHash = await bcrypt.hash(password, 12);
      await usersRepo.update(user.id, { passwordHash });
      user.passwordHash = passwordHash;
    } else {
      // Verify password for existing users
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Return user data and token (map PostgreSQL fields to expected format)
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
      // Legacy fields for compatibility (set defaults if not in schema)
      category: null,
      niche: null,
      avatarUrl: null,
      plan: null,
      status: "active",
      customDomain: null,
      has_paid: false,
      is_first_login: false,
      subscriptionStatus: "trial",
      subscriptionType: null,
      trialEndsAt: null,
      availableBalance: 0,
      totalEarned: 0,
    };

    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: userData,
    });

    // Set redirect header based on user role and onboarding status
    if (user.role === "affiliate") {
      response.headers.set("X-Redirect", "/dashboard/affiliate");
    } else if (user.role === "client" && !user.onboarded) {
      response.headers.set("X-Redirect", "/onboarding/niches");
    } else {
      response.headers.set("X-Redirect", "/dashboard");
    }

    // Set httpOnly cookie for middleware
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
