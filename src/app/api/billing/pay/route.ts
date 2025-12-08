import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { payHeroService } from "@/lib/payhero";
import Payment from "@/lib/models/Payment";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
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
      providerReference: `PAYHERO-${Date.now()}-${user.id}`,
      userId: user.id,
      planType,
      phoneNumber: formattedPhone,
      paymentMethod: "payhero",
    });

    console.log("Billing API - Initiating STK Push:");
    console.log("User ID:", user.id);
    console.log("Plan Type:", planType);
    console.log("Amount:", amount);
    console.log("Formatted Phone:", formattedPhone);

    // Initiate STK Push
    const stkPushResponse = await payHeroService.initiateSTKPush({
      phoneNumber: formattedPhone,
      amount,
      accountReference: `SUB-${planType}-${user.id}`,
      transactionDesc: `${
        planType === "monthly" ? "Monthly" : "Lifetime"
      } Subscription Payment`,
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

    // Update payment with checkout request ID
    await Payment.findByIdAndUpdate(payment._id, {
      checkoutRequestId: stkPushResponse.data.checkoutRequestId,
      providerReference: stkPushResponse.data.checkoutRequestId, // Use checkoutRequestId as provider reference
    });

    return NextResponse.json({
      success: true,
      message:
        stkPushResponse.data.customerMessage ||
        "Payment initiated successfully",
      data: {
        checkoutRequestId: stkPushResponse.data.checkoutRequestId,
        customerMessage: stkPushResponse.data.customerMessage,
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
