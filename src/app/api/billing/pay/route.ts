import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { intaSendService } from "@/lib/intasend";
import Payment from "@/lib/models/Payment";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { phoneNumber, planType, amount } = await req.json();

    if (!phoneNumber || !planType || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number, plan type, and amount are required",
        },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!["monthly", "lifetime"].includes(planType)) {
      return NextResponse.json(
        { success: false, message: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Validate amount
    const expectedAmount = planType === "monthly" ? 999 : 5;
    if (amount !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid amount. Expected ${expectedAmount} KES for ${planType} plan`,
        },
        { status: 400 }
      );
    }

    // Environment preflight for IntaSend
    const { INTASEND_SECRET_KEY, INTASEND_AUTH_SCHEME, INTASEND_WALLET_ID } = process.env as Record<string, string | undefined>;
    if (!INTASEND_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Payment configuration error: INTASEND_SECRET_KEY is not set on the server" },
        { status: 500 }
      );
    }
    const mask = (s: string) => (s ? `${s.slice(0, 2)}...${s.slice(-4)}(${s.length})` : "unset");
    console.log("IntaSend config preflight:", {
      scheme: INTASEND_AUTH_SCHEME || "Bearer",
      secretKey: mask(INTASEND_SECRET_KEY),
      walletId: mask(INTASEND_WALLET_ID || ""),
    });

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\s+/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.substring(1);
    }
    // Ensure it starts with 254
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Validate phone number format
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format. Use format: 254712345678",
        },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await Payment.create({
      amount,
      currency: "KES",
      status: "pending",
      providerReference: `INTASEND-${Date.now()}-${user.id}`,
      userId: user.id,
      planType,
      phoneNumber: formattedPhone,
      paymentMethod: "intasend",
    });

    console.log("Billing API - Initiating IntaSend STK Push:");
    console.log("User ID:", user.id);
    console.log("Plan Type:", planType);
    console.log("Amount:", amount);
    console.log("Formatted Phone:", formattedPhone);

    // Initiate STK Push
    const stkPushResponse = await intaSendService.initiateSTKPush({
      amount,
      phoneNumber: formattedPhone,
      reference: `SUB-${planType}-${user.id}-${Date.now()}`,
    });

    console.log("STK Push Response:", stkPushResponse);

    if (!stkPushResponse.success || !stkPushResponse.data) {
      // Update payment status to failed
      await Payment.findByIdAndUpdate(payment._id, { status: "failed" });

      return NextResponse.json(
        {
          success: false,
          message: stkPushResponse.message || "Failed to initiate payment",
        },
        { status: 400 }
      );
    }

    // Update payment with transaction ID
    await Payment.findByIdAndUpdate(payment._id, {
      checkoutRequestId: stkPushResponse.data.transaction_id,
      providerReference: stkPushResponse.data.transaction_id,
    });

    return NextResponse.json({
      success: true,
      message: "Payment initiated successfully. Check your phone for STK push.",
      data: {
        transactionId: stkPushResponse.data.transaction_id,
        status: stkPushResponse.data.status,
        amount: stkPushResponse.data.amount,
        phoneNumber: stkPushResponse.data.phone_number,
      },
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
