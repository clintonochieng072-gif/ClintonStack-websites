import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { getAccessToken, initiateSTKPush } from "@/lib/mpesa";
import Property from "@/lib/models/Property";
import Payment from "@/lib/models/Payment";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDb();

    // Authenticate user
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { propertyId, planType } = await request.json();

    if (!propertyId || !planType) {
      return NextResponse.json(
        { success: false, message: "Property ID and plan type are required" },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!["monthly", "one_time"].includes(planType)) {
      return NextResponse.json(
        { success: false, message: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Find the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    // Check if user owns this property
    if (property.userId?.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Check if property is already published and paid
    if (property.isPublished && property.paid) {
      return NextResponse.json(
        { success: false, message: "Property is already published and paid" },
        { status: 400 }
      );
    }

    // Determine plan amount
    let planAmount: number;
    let planName: string;

    if (planType === "monthly") {
      planAmount = 999;
      planName = "Monthly Plan";
    } else {
      // Check if user is within first 10 users for one-time plan
      const totalUsers = await Property.distinct("userId").then(
        (users) => users.length
      );
      if (totalUsers >= 10) {
        return NextResponse.json(
          {
            success: false,
            message: "One-time plan is only available for the first 10 users",
          },
          { status: 400 }
        );
      }
      planAmount = 3999;
      planName = "One-time Plan";
    }

    // Get M-Pesa access token
    const accessToken = await getAccessToken();

    // Generate callback URL
    const baseUrl = getBaseUrl();
    const callbackUrl = `${baseUrl}/api/payments/mpesa/callback`;

    // Prepare transaction details
    const accountReference = `Property-${propertyId}`;
    const transactionDesc = `ClintonStack Property Publish Payment - ${planName}`;

    // Use sandbox phone number
    const phoneNumber = process.env.MPESA_PHONE_NUMBER!;

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(
      accessToken,
      process.env.MPESA_SHORTCODE!,
      process.env.MPESA_PASSKEY!,
      planAmount,
      phoneNumber,
      accountReference,
      transactionDesc,
      callbackUrl
    );

    // Check if STK Push was initiated successfully
    if (stkResponse.ResponseCode !== "0") {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initiate payment",
          mpesaResponse: stkResponse,
        },
        { status: 400 }
      );
    }

    // Create pending payment record
    const payment = await Payment.create({
      amount: planAmount,
      currency: "KES",
      status: "pending",
      providerReference: stkResponse.CheckoutRequestID,
      userId: user.id,
      propertyId: propertyId,
      planType: planType,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      phoneNumber: phoneNumber,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message:
        "Payment initiated successfully. Please complete the payment on your phone.",
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        responseCode: stkResponse.ResponseCode,
        responseDescription: stkResponse.ResponseDescription,
        customerMessage: stkResponse.CustomerMessage,
        plan: {
          type: planType,
          name: planName,
          amount: planAmount,
        },
        paymentId: payment._id,
      },
    });
  } catch (error) {
    console.error("Property publish payment error:", error);

    // Handle specific M-Pesa errors
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      if (axiosError.response?.data) {
        return NextResponse.json(
          {
            success: false,
            message: "M-Pesa API error",
            error: axiosError.response.data,
          },
          { status: 400 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
