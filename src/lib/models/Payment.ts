import mongoose, { Document, Model } from "mongoose";

export interface IPayment extends Document {
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  providerReference: string; // Payment provider transaction ID
  checkoutRequestId?: string; // Checkout request ID for payment processing
  userId: mongoose.Types.ObjectId; // Required for subscription payments
  planType: "monthly" | "lifetime"; // Required for subscription payments
  propertyId?: mongoose.Types.ObjectId; // Optional for property publishing payments
  phoneNumber?: string; // Phone number used for payment
  paymentMethod: string; // Payment provider
  callbackMetadata?: any; // Additional data from payment provider
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new mongoose.Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: "KES" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      required: true,
    },
    providerReference: { type: String, required: true }, // Payment provider transaction ID
    checkoutRequestId: { type: String }, // Checkout request ID for payment processing
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: { type: String, enum: ["monthly", "lifetime"], required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    phoneNumber: { type: String }, // Phone number used for payment
    paymentMethod: { type: String, default: "mpesa" },
    callbackMetadata: { type: mongoose.Schema.Types.Mixed }, // Additional payment provider data
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
