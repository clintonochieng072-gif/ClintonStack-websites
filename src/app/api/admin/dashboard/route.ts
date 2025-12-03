import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";
import User from "@/lib/models/User";
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

      const skip = (page - 1) * size;

      const totalUsers = await User.countDocuments();
      const users = await User.find({})
        .select(
          "username email has_paid is_first_login isLocked status createdAt lastLogin"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .lean();

      return NextResponse.json({
        users,
        pagination: {
          page,
          size,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / size),
        },
      });
    }

    // Regular user dashboard
    const site = await Site.findOne({ ownerId: user.id });
    const userData = await User.findById(user.id).select("-password");

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
