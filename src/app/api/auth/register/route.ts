import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Referral from "@/lib/models/Referral";
import Product from "@/lib/models/Product";

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password, role, referralCode, productSlug } =
      await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Determine role
    const userRole = role || "client";

    // Handle referral logic
    let referrerId = null;
    let generatedReferralCode = null;
    let productId = null;

    if (userRole === "affiliate") {
      // Generate unique referral code for affiliate
      generatedReferralCode = `AFF${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;
    } else if (userRole === "client" && referralCode) {
      // Find referrer by referral code
      const referrer = await User.findOne({ referralCode, role: "affiliate" });
      if (referrer) {
        // Self-referral prevention
        if (referrer.email === email.toLowerCase()) {
          return NextResponse.json(
            { error: "You cannot refer yourself" },
            { status: 400 }
          );
        }

        // Check for duplicate accounts (same email domain or similar patterns)
        const emailDomain = email.split('@')[1];
        const referrerEmailDomain = referrer.email.split('@')[1];

        // Prevent multiple accounts from same domain
        const existingUsersFromDomain = await User.countDocuments({
          email: { $regex: `@${emailDomain}$`, $options: 'i' },
          role: "client"
        });

        if (existingUsersFromDomain >= 2) {
          return NextResponse.json(
            { error: "Multiple accounts from the same email domain are not allowed" },
            { status: 400 }
          );
        }

        referrerId = referrer._id.toString();
      }

      // Find product by slug if provided
      if (productSlug) {
        const product = await Product.findOne({
          slug: productSlug,
          isActive: true,
        });
        if (product) {
          productId = product._id.toString();
        }
      }
    }

    // Create new user
    const newUser = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      onboarded: false,
      emailVerified: true,
      referralCode: generatedReferralCode,
      referrerId,
    });

    await newUser.save();

    // Create referral record if referred
    if (referrerId) {
      await Referral.create({
        clientId: newUser._id.toString(),
        referrerId,
        productId: productId || null,
        signupDate: new Date(),
        paymentStatus: "pending",
        commissionEarned: 0,
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Return user data and token
    const userData = {
      id: newUser._id.toString(),
      email: newUser.email,
      onboarded: newUser.onboarded,
      username: newUser.username,
      niche: newUser.niche,
      role: newUser.role,
    };

    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Error in /api/auth/register:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
