import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all active products that affiliates can promote
    const products = await Product.find({ isActive: true, status: "active" })
      .select("name description slug commissionRate features pricing sortOrder")
      .sort({ sortOrder: 1, name: 1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
