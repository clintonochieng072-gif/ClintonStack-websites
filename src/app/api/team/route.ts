// src/app/api/team/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";
import TeamMember from "@/lib/models/Team";
import User from "@/lib/models/User";

export async function GET(req: Request) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Get all team members for this site
    const teamMembers = await TeamMember.find({ siteId: site._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Team fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { email, name, role } = await req.json();

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Check if user is already a team member
    const existingMember = await TeamMember.findOne({
      siteId: site._id,
      email: email.toLowerCase(),
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, message: "User is already a team member" },
        { status: 400 }
      );
    }

    // Check if user exists in the system
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // Create team member
    const teamMember = new TeamMember({
      siteId: site._id,
      userId: existingUser?._id,
      email: email.toLowerCase(),
      name,
      role,
      status: existingUser ? "active" : "pending",
      permissions: getPermissionsForRole(role),
    });

    await teamMember.save();

    // TODO: Send invitation email if user doesn't exist

    return NextResponse.json({
      success: true,
      data: teamMember,
      message: "Team member invited successfully",
    });
  } catch (error) {
    console.error("Team invite error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to invite team member" },
      { status: 500 }
    );
  }
}

function getPermissionsForRole(role: string) {
  switch (role) {
    case "admin":
      return {
        canEditContent: true,
        canPublish: true,
        canManageProperties: true,
        canViewAnalytics: true,
        canManageTeam: true,
      };
    case "editor":
      return {
        canEditContent: true,
        canPublish: true,
        canManageProperties: true,
        canViewAnalytics: true,
        canManageTeam: false,
      };
    case "viewer":
    default:
      return {
        canEditContent: false,
        canPublish: false,
        canManageProperties: false,
        canViewAnalytics: true,
        canManageTeam: false,
      };
  }
}
