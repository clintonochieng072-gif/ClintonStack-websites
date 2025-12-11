import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliateEarnings extends Document {
  affiliateId: string;
  paymentId: string;
  commissionAmount: number;
  status: "pending" | "paid" | "failed";
  createdAt: Date;
  paidAt?: Date;
}

const AffiliateEarningsSchema: Schema = new Schema(
  {
    affiliateId: { type: String, required: true },
    paymentId: { type: String, required: true },
    commissionAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AffiliateEarnings ||
  mongoose.model<IAffiliateEarnings>(
    "AffiliateEarnings",
    AffiliateEarningsSchema
  );
