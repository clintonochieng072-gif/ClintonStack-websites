import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { displayName, email } = await request.json();

    await dbConnect();

    const currentUser = await User.findById(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
      currentUser.email = email;
    }

    await currentUser.save();

    // Update site title if provided
    if (displayName) {
      await Site.updateOne({ ownerId: user.id }, { title: displayName });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: currentUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}
