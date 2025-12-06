import mongoose, { Document, Model } from "mongoose";

export interface IPayment extends Document {
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  providerReference: string;
  ownerPortfolio?: mongoose.Types.ObjectId; // Optional for non-portfolio payments
  userId?: mongoose.Types.ObjectId; // For subscription payments
  planId?: mongoose.Types.ObjectId; // For subscription payments
  propertyId?: mongoose.Types.ObjectId; // For property publishing payments
  planType?: "monthly" | "one_time"; // For property publishing payments
  checkoutRequestId?: string; // M-Pesa specific
  merchantRequestId?: string; // M-Pesa specific
  phoneNumber?: string; // M-Pesa phone number
  transactionDate?: string; // M-Pesa transaction date
  createdAt: Date;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  amount: Number,
  currency: String,
  status: { type: String, enum: ["pending", "success", "failed"] },
  providerReference: String,
  ownerPortfolio: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  planType: { type: String, enum: ["monthly", "one_time"] },
  checkoutRequestId: String,
  merchantRequestId: String,
  phoneNumber: String,
  transactionDate: String,
  createdAt: { type: Date, default: Date.now },
});

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
