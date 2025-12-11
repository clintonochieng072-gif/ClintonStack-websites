import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import ManualPayment from "@/lib/models/ManualPayment";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify user authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const {
      planType,
      planName,
      planAmount,
      fullName,
      phoneNumber,
      email,
      paymentMethod,
      transactionId,
      amount,
      notes,
    } = body;

    // Validate required fields
    if (
      !planType ||
      !planName ||
      !planAmount ||
      !fullName ||
      !phoneNumber ||
      !email ||
      !paymentMethod ||
      !transactionId ||
      !amount
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!["monthly", "lifetime"].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Create manual payment record
    const manualPayment = new ManualPayment({
      userId: user._id,
      planType,
      planName,
      planAmount: Number(planAmount),
      fullName,
      phoneNumber,
      email,
      paymentMethod,
      transactionId,
      amount,
      notes,
      status: "pending",
    });

    await manualPayment.save();

    return NextResponse.json({
      success: true,
      message:
        "Payment details submitted successfully. We'll review and approve within 24 hours.",
      paymentId: manualPayment._id,
    });
  } catch (error: any) {
    console.error("Manual payment submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment details" },
      { status: 500 }
    );
  }
}
