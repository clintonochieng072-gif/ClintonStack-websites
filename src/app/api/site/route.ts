// src/app/api/site/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";
import jwt from "jsonwebtoken";
import { usersRepo } from "@/repositories/usersRepo";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Add no-cache headers to all responses
function addNoCacheHeaders(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "no-cache, no-store, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

async function getUserFromRequest(request: NextRequest) {
  try {
    // First try JWT token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.userId) {
        // Use PostgreSQL for user lookup
        const user = await usersRepo.findById(decoded.userId);

        if (user) {
          return {
            id: user.id,
            email: user.email,
            onboarded: user.onboarded,
            username: user.username,
            niche: null, // Not in current schema
            role: user.role || "client",
          };
        }
      }
    }

    // If no JWT, try NextAuth session
    const session = await auth();
    if (session?.user?.email) {
      // Use PostgreSQL for user lookup
      const user = await usersRepo.findByEmail(session.user.email);

      if (user) {
        return {
          id: user.id,
          email: user.email,
          onboarded: user.onboarded,
          username: user.username,
          niche: null, // Not in current schema
          role: user.role || "client",
        };
      }
    }

    return null;
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

    // Mark user as onboarded in PostgreSQL
    await prisma.user.update({
      where: { id: user.id },
      data: { onboarded: true },
    });

    return addNoCacheHeaders(NextResponse.json({ data: site }));
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, niche, seoTitle, seoDescription } =
      await request.json();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (niche !== undefined) updateData.niche = niche;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined)
      updateData.seoDescription = seoDescription;

    const site = await Site.findOneAndUpdate({ ownerId: user.id }, updateData, {
      new: true,
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return addNoCacheHeaders(NextResponse.json({ data: site }));
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
