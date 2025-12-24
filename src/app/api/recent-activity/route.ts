// src/app/api/recent-activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";
import Contact from "@/lib/models/Contact";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

async function getUserFromRequest(request: NextRequest) {
  try {
    // First try JWT token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            onboarded: true,
            username: true,
            role: true,
          },
        });

        if (user) {
          return {
            id: user.id,
            email: user.email,
            onboarded: user.onboarded,
            username: user.username,
            niche: null,
            role: user.role,
          };
        }
      }
    }

    // If no JWT, try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          onboarded: true,
          username: true,
          role: true,
        },
      });

      if (user) {
        return {
          id: user.id,
          email: user.email,
          onboarded: user.onboarded,
          username: user.username,
          niche: null,
          role: user.role,
        };
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes <= 0 ? "Just now" : `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const niche = url.searchParams.get("niche");
    if (!niche) {
      return NextResponse.json({ error: "Niche parameter required" }, { status: 400 });
    }

    await dbConnect();

    // Find the user's site with matching niche
    const site = await Site.findOne({ ownerId: user.id, niche });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Fetch recent contacts
    const contacts = await Contact.find({ siteId: site._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email message createdAt")
      .lean();

    // Format the response
    const recentActivity = contacts.map(contact => ({
      name: contact.name,
      email: contact.email,
      message: contact.message,
      time: formatRelativeTime(new Date(contact.createdAt)),
    }));

    return NextResponse.json(recentActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}