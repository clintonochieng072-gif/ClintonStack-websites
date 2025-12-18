// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateClientId } from "@/lib/utils";
import { usersRepo } from "@/repositories/usersRepo";
import { affiliatesRepo } from "@/repositories/affiliatesRepo";
import { referralsRepo } from "@/repositories/referralsRepo";

export async function POST(req: Request) {
  try {
    const {
      name,
      username,
      email,
      password,
      role = "client",
      referralCode,
      productSlug,
    } = await req.json();

    // Get affiliate ref from cookie
    const cookies = req.headers.get("cookie") || "";
    const affiliateRefMatch = cookies.match(/affiliate_ref=([^;]+)/);
    const affiliateRef = affiliateRefMatch ? affiliateRefMatch[1] : null;

    // Basic validation
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists in PostgreSQL
    const existingUserByEmail = await usersRepo.findByEmail(email);
    const existingUserByUsername = await usersRepo.findByUsername(username);

    if (existingUserByEmail || existingUserByUsername) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique referral code only for affiliates
    let uniqueReferralCode = null;
    if (role === "affiliate") {
      try {
        uniqueReferralCode = await usersRepo.generateUniqueReferralCode();
      } catch (error) {
        console.error("Failed to generate unique referral code:", error);
        return NextResponse.json(
          { error: "Failed to generate unique referral code" },
          { status: 500 }
        );
      }
    }

    // Generate clientId for all users
    const clientId = generateClientId();

    // Handle referral logic if affiliateRef is provided
    let affiliateId = null;
    if (affiliateRef) {
      const affiliate = await affiliatesRepo.findById(affiliateRef);

      // Validate affiliate exists
      if (affiliate) {
        // Prevent affiliates from referring other affiliates
        if (role === "affiliate") {
          return NextResponse.json(
            { error: "Affiliates cannot refer other affiliates" },
            { status: 400 }
          );
        }
        affiliateId = affiliate.id;
      }
      // If affiliate not found, silently ignore (no error)
    }

    // Create user in PostgreSQL
    const pgUser = await usersRepo.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      role,
      referralCode: role === "affiliate" ? uniqueReferralCode : null,
      clientId,
      referredById: null, // Not using this anymore
      emailVerified: false,
      onboarded: role === "affiliate",
    });

    // Create affiliate profile if role is affiliate
    if (role === "affiliate") {
      await affiliatesRepo.create({
        userId: pgUser.id,
      });
    }

    // Create referral if affiliate ref provided
    if (affiliateId) {
      await referralsRepo.create({
        affiliateId,
        referredUserId: pgUser.id,
        status: "active",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: pgUser.id,
        email: pgUser.email,
        role: pgUser.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Return user data and token (map PostgreSQL fields to expected format)
    const userData = {
      id: pgUser.id,
      name: pgUser.name,
      username: pgUser.username,
      email: pgUser.email,
      role: pgUser.role,
      onboarded: pgUser.onboarded,
      emailVerified: pgUser.emailVerified,
      referralCode: pgUser.referralCode,
      clientId: pgUser.clientId,
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
      message: "User registered successfully",
      token,
      user: userData,
    });

    // Set httpOnly cookie for middleware
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      if (error.message.includes("referralCode")) {
        return NextResponse.json(
          { error: "Referral code conflict. Please try again." },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
