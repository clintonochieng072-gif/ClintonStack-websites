import mongoose, { Document, Model } from "mongoose";

export interface IWithdrawal extends Document {
  affiliateId: string; // ID of the affiliate requesting withdrawal
  amount: number; // Amount to withdraw
  status: "pending" | "completed" | "rejected"; // Withdrawal status
  paymentMethod: "bank"; // Payment method
  paymentDetails?: string; // Additional payment details (phone number, account info)
  processedAt?: Date; // When withdrawal was processed
  createdAt: Date;
}

const WithdrawalSchema = new mongoose.Schema<IWithdrawal>({
  affiliateId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "rejected"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["bank"],
    required: true,
  },
  paymentDetails: {
    type: String,
    default: null,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Withdrawal: Model<IWithdrawal> =
  (mongoose.models && mongoose.models.Withdrawal) ||
  mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);

export default Withdrawal;
