import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userId) {
      return NextResponse.json({ user: null });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId)
      .select("email onboarded username niche role")
      .lean();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const userData = {
      id: user._id.toString(),
      email: user.email,
      onboarded: user.onboarded === true,
      username: user.username,
      niche: user.niche || null,
      role: user.role || "user",
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}