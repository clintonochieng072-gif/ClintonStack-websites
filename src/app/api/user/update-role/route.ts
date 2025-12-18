import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { usersRepo } from "@/repositories/usersRepo";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();
    if (!role) {
      return NextResponse.json({ error: "Role required" }, { status: 400 });
    }

    // Find user and update role
    const user = await usersRepo.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await usersRepo.update(user.id, { role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
