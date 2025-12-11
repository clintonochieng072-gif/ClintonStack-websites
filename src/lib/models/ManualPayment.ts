import mongoose, { Schema, Document } from "mongoose";

export interface IManualPayment extends Document {
  userId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

const ManualPaymentSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ManualPayment ||
  mongoose.model<IManualPayment>("ManualPayment", ManualPaymentSchema);
