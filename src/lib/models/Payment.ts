import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: string;
  amount: number;
  status: "pending" | "success" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  planType: string;
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    planType: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
