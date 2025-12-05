// src/app/api/site/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";
import jwt from "jsonwebtoken";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userId) return null;

    await dbConnect();
    const user = await User.findById(decoded.userId)
      .select("email onboarded username niche role")
      .lean();

    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      onboarded: user.onboarded === true,
      username: user.username,
      niche: user.niche || null,
      role: user.role || "user",
    };
  } catch (e) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { niche } = body;

    if (!niche)
      return NextResponse.json({ error: "niche is required" }, { status: 400 });

    // Generate a unique slug
    const safeUsername = user.username || user.email?.split("@")[0] || "user";
    const random = Math.floor(1000 + Math.random() * 9000);
    let slug = `${safeUsername}-${random}`;

    // Ensure uniqueness
    while (await Site.findOne({ slug })) {
      slug = `${safeUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const site = await Site.create({
      ownerId: user.id,
      niche,
      slug,
      title: `${niche.charAt(0).toUpperCase() + niche.slice(1)} Website`,
      blocks: [],
      published: true,
    });

    return NextResponse.json({ data: site });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
