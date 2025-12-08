import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Referral from "@/lib/models/Referral";

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "affiliate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get referrals with client and product details
    const referrals = await Referral.find({ referrerId: user._id })
      .populate("clientId", "name email")
      .populate("productId", "name slug")
      .sort({ signupDate: -1 });

    // Format the response
    const formattedReferrals = referrals.map((referral) => {
      const client = referral.clientId as any;
      const product = referral.productId as any;
      return {
        _id: referral._id,
        clientId: client._id || client,
        clientName: client.name || "Unknown",
        clientEmail: client.email || "N/A",
        productId: product._id || product,
        productName: product.name || "General",
        signupDate: referral.signupDate,
        paymentStatus: referral.paymentStatus,
        commissionEarned: referral.commissionEarned,
      };
    });

    return NextResponse.json(formattedReferrals);
  } catch (error) {
    console.error("Error fetching affiliate referrals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
