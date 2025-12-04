import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    const { name, username, email, password } = await request.json();

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

    // Create new user
    const newUser = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      role: "user",
      onboarded: false,
      emailVerified: true, // For simplicity, mark as verified
    });

    await newUser.save();

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
