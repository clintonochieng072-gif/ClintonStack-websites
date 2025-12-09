import mongoose, { Document, Model } from "mongoose";

export interface IWithdrawalRequest extends Document {
  userId: string; // ID of the affiliate requesting withdrawal
  phoneNumber: string; // Safaricom M-Pesa phone number
  amount: number; // Amount to withdraw
  status: "pending" | "completed" | "failed"; // Withdrawal status
  transactionId?: string; // IntaSend transaction ID
  failureReason?: string; // Reason for failure if any
  processedAt?: Date; // When withdrawal was processed
  createdAt: Date;
}

const WithdrawalRequestSchema = new mongoose.Schema<IWithdrawalRequest>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        // Kenyan phone number validation (07XXXXXXXX or +2547XXXXXXXX)
        return /^(\+254|0)7[0-9]{8}$/.test(v);
      },
      message: "Phone number must be a valid Kenyan Safaricom number",
    },
  },
  amount: {
    type: Number,
    required: true,
    min: 200, // Minimum withdrawal amount
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  transactionId: {
    type: String,
    default: null,
  },
  failureReason: {
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

// Index for efficient queries
WithdrawalRequestSchema.index({ userId: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ status: 1, createdAt: -1 });

const WithdrawalRequest: Model<IWithdrawalRequest> =
  (mongoose.models && mongoose.models.WithdrawalRequest) ||
  mongoose.model<IWithdrawalRequest>(
    "WithdrawalRequest",
    WithdrawalRequestSchema
  );

export default WithdrawalRequest;
