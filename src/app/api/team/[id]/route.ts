// src/app/api/team/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";
import TeamMember from "@/lib/models/Team";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const updates = await req.json();

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Find and update the team member
    const teamMember = await TeamMember.findOneAndUpdate(
      { _id: id, siteId: site._id },
      {
        ...updates,
        permissions: updates.role
          ? getPermissionsForRole(updates.role)
          : undefined,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!teamMember) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error("Team member update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Find and delete the team member
    const teamMember = await TeamMember.findOneAndDelete({
      _id: id,
      siteId: site._id,
    });

    if (!teamMember) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Team member delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove team member" },
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
