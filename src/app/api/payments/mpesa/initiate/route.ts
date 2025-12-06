import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { mpesaPaymentInitiateSchema } from "@/lib/validations";
import { getAccessToken, initiateSTKPush } from "@/lib/mpesa";
import Plan from "@/lib/models/Plan";
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = mpesaPaymentInitiateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { phoneNumber, amount, planSlug } = validationResult.data;

    // Verify plan exists and is active
    const plan = await Plan.findOne({ slug: planSlug, isActive: true });
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    // Verify amount matches plan price
    if (plan.price !== amount) {
      return NextResponse.json(
        {
          success: false,
          message: `Amount mismatch. Plan ${plan.name} costs ${plan.price} KES`,
        },
        { status: 400 }
      );
    }

    // Get M-Pesa access token
    const accessToken = await getAccessToken();

    // Generate callback URL
    const baseUrl = getBaseUrl();
    const callbackUrl = `${baseUrl}/api/payments/mpesa/callback`;

    // Prepare transaction details
    const accountReference = `PLAN-${plan.slug}-${user.id}`;
    const transactionDesc = `Payment for ${plan.name} plan`;

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(
      accessToken,
      process.env.MPESA_SHORTCODE!,
      process.env.MPESA_PASSKEY!,
      amount,
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
      amount: amount,
      currency: "KES",
      status: "pending",
      providerReference: stkResponse.CheckoutRequestID,
      userId: user.id,
      planId: plan._id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      phoneNumber: phoneNumber,
    });

    // Return success response with CheckoutRequestID
    return NextResponse.json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        responseCode: stkResponse.ResponseCode,
        responseDescription: stkResponse.ResponseDescription,
        customerMessage: stkResponse.CustomerMessage,
        plan: {
          name: plan.name,
          slug: plan.slug,
          price: plan.price,
        },
      },
    });
  } catch (error) {
    console.error("M-Pesa STK Push initiation error:", error);

    // Handle specific M-Pesa errors (axios errors)
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
