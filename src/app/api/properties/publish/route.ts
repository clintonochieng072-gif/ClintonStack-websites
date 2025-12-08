import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import Property from "@/lib/models/Property";
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

    // Determine plan details
    let planName: string;

    if (planType === "monthly") {
      planName = "Monthly Plan";
    } else {
      planName = "One-time Plan";
    }

    // Mark property as published (no payment required)
    property.isPublished = true;
    property.paid = true;
    property.planType = planType;

    // Set expiration date for monthly plans (30 days from now)
    if (planType === "monthly") {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      property.paymentExpiresAt = expirationDate;
    }

    await property.save();

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Property published successfully.",
      data: {
        plan: {
          type: planType,
          name: planName,
        },
        propertyId: propertyId,
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
