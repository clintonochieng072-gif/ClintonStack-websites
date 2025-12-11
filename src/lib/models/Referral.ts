import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
  affiliateId: string;
  referredUserId: string;
  clickTimestamp: Date;
  conversionTimestamp?: Date;
  status: "active" | "inactive" | "converted";
  createdAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    affiliateId: { type: String, required: true },
    referredUserId: { type: String, required: true },
    clickTimestamp: { type: Date, default: Date.now },
    conversionTimestamp: { type: Date },
    status: {
      type: String,
      enum: ["active", "inactive", "converted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Referral ||
  mongoose.model<IReferral>("Referral", ReferralSchema);
