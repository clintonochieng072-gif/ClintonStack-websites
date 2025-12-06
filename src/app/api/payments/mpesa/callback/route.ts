import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { mpesaCallbackSchema } from "@/lib/validations";
import Payment from "@/lib/models/Payment";
import Property from "@/lib/models/Property";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDb();

    // Parse and validate callback data
    const body = await request.json();
    const validationResult = mpesaCallbackSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "M-Pesa callback validation failed:",
        validationResult.error
      );
      // Still return 200 to M-Pesa to acknowledge receipt
      return new NextResponse("", { status: 200 });
    }

    const { Body } = validationResult.data;
    const { stkCallback } = Body;
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Extract payment details from metadata if successful
    let paymentDetails: {
      amount?: number;
      mpesaReceiptNumber?: string;
      transactionDate?: string;
      phoneNumber?: string;
    } = {};

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      CallbackMetadata.Item.forEach((item) => {
        switch (item.Name) {
          case "Amount":
            paymentDetails.amount = item.Value as number;
            break;
          case "MpesaReceiptNumber":
            paymentDetails.mpesaReceiptNumber = item.Value as string;
            break;
          case "TransactionDate":
            paymentDetails.transactionDate = item.Value as string;
            break;
          case "PhoneNumber":
            paymentDetails.phoneNumber = item.Value as string;
            break;
        }
      });
    }

    // Find the pending payment record
    const payment = await Payment.findOne({
      checkoutRequestId: CheckoutRequestID,
    });

    if (!payment) {
      console.error(
        "Payment record not found for CheckoutRequestID:",
        CheckoutRequestID
      );
      return new NextResponse("", { status: 200 });
    }

    // For successful payments
    if (ResultCode === 0) {
      // Update payment record
      payment.status = "success";
      payment.providerReference =
        paymentDetails.mpesaReceiptNumber || CheckoutRequestID;
      payment.transactionDate = paymentDetails.transactionDate;
      await payment.save();

      console.log("M-Pesa payment successful:", {
        merchantRequestId: MerchantRequestID,
        checkoutRequestId: CheckoutRequestID,
        receiptNumber: paymentDetails.mpesaReceiptNumber,
        amount: paymentDetails.amount,
        phoneNumber: paymentDetails.phoneNumber,
        userId: payment.userId,
        propertyId: payment.propertyId,
        planType: payment.planType,
      });

      // Handle property publishing payments
      if (payment.propertyId && payment.planType) {
        const property = await Property.findById(payment.propertyId);
        if (property) {
          // Mark property as paid and published
          property.paid = true;
          property.isPublished = true;
          property.planType = payment.planType;

          // Set expiration date for monthly plans (30 days from now)
          if (payment.planType === "monthly") {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
            property.paymentExpiresAt = expirationDate;
          }

          await property.save();

          console.log("Property publishing payment successful:", {
            propertyId: payment.propertyId,
            planType: payment.planType,
            isPublished: true,
            expiresAt: property.paymentExpiresAt,
          });
        }
      }
    } else {
      // Failed payment
      payment.status = "failed";
      await payment.save();

      console.log("M-Pesa payment failed:", {
        merchantRequestId: MerchantRequestID,
        checkoutRequestId: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        userId: payment.userId,
        propertyId: payment.propertyId,
        planType: payment.planType,
      });
    }

    // Return empty response with 200 OK to acknowledge receipt
    return new NextResponse("", { status: 200 });
  } catch (error) {
    console.error("M-Pesa callback processing error:", error);

    // Still return 200 to M-Pesa to prevent retries
    return new NextResponse("", { status: 200 });
  }
}
