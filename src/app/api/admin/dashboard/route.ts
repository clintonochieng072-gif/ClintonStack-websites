import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";
import { usersRepo } from "@/repositories/usersRepo";
import { getUserFromToken } from "@/lib/auth";

const isAdmin = (user: any) => user.email === "clintonochieng072@gmail.com";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    // If admin, return user list with pagination
    if (isAdmin(user)) {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const size = parseInt(searchParams.get("size") || "10");

      const offset = (page - 1) * size;

      // Get users from PostgreSQL
      const userStats = await usersRepo.getStats();
      const usersResult = await usersRepo.list({
        limit: size,
        offset,
      });

      // Transform to match expected format
      const users = usersResult.map((u: any) => ({
        username: u.username,
        email: u.email,
        has_paid: false, // Not in current schema
        is_first_login: true, // Not in current schema
        isLocked: false, // Not in current schema
        status: "active", // Not in current schema
        createdAt: u.createdAt,
        lastLogin: null, // Not in current schema
      }));

      return NextResponse.json({
        users,
        pagination: {
          page,
          size,
          total: userStats.total,
          totalPages: Math.ceil(userStats.total / size),
        },
      });
    }

    // Regular user dashboard - site data from MongoDB, user from PostgreSQL
    await dbConnect();
    const site = await Site.findOne({ ownerId: user.id });
    const userData = await usersRepo.findById(user.id);

    return NextResponse.json({
      user: userData,
      site,
      stats: {
        listingsCount: site?.data?.listings?.items?.length || 0,
        agentsCount: site?.data?.agents?.items?.length || 0,
        testimonialsCount: site?.data?.testimonials?.items?.length || 0,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json(
      { error: "Error fetching dashboard data" },
      { status: 500 }
    );
  }
}
