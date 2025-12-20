import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

const isAdmin = (user: any) => user.email === "clintonochieng072@gmail.com";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");

    // If email is provided, search for specific user
    if (email) {
      const foundUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          username: true,
          email: true,
          onboarded: true,
          role: true,
          createdAt: true,
        },
      });

      if (!foundUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        user: {
          id: foundUser.id,
          name: foundUser.username,
          email: foundUser.email,
          has_paid: false, // Not in schema
          is_first_login: false, // Not in schema
          isLocked: false, // Not in schema
          status: "active", // Not in schema
          createdAt: foundUser.createdAt,
          lastLogin: null, // Not in schema
        },
      });
    }

    // If no email, return paginated list of all users
    const skip = (page - 1) * size;

    const totalUsers = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        onboarded: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: size,
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.username,
        email: user.email,
        has_paid: false, // Not in schema
        is_first_login: false, // Not in schema
        isLocked: false, // Not in schema
        status: "active", // Not in schema
        createdAt: user.createdAt,
        lastLogin: null, // Not in schema
      })),
      pagination: {
        page,
        size,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / size),
      },
    });
  } catch (err) {
    console.error("Search user error:", err);
    return NextResponse.json(
      { error: "Error searching user" },
      { status: 500 }
    );
  }
}
