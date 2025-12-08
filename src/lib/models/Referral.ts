import mongoose, { Document, Model } from "mongoose";

export interface IReferral extends Document {
  clientId: string; // ID of the referred client
  referrerId: string; // ID of the affiliate who referred
  productId: string; // ID of the product being promoted
  signupDate: Date; // When the client signed up
  paymentStatus: "pending" | "paid"; // Payment status of the client
  credited: boolean; // Whether affiliate has been credited
  creditedAt?: Date; // When credit was applied
  commissionEarned: number; // Amount earned from this referral
  createdAt: Date;
}

const ReferralSchema = new mongoose.Schema<IReferral>({
  clientId: {
    type: String,
    required: true,
    index: true,
  },
  referrerId: {
    type: String,
    required: true,
    index: true,
  },
  productId: {
    type: String,
    required: true,
    index: true,
  },
  signupDate: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  credited: {
    type: Boolean,
    default: false,
  },
  creditedAt: {
    type: Date,
    default: null,
  },
  commissionEarned: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Referral: Model<IReferral> =
  (mongoose.models && mongoose.models.Referral) ||
  mongoose.model<IReferral>("Referral", ReferralSchema);

export default Referral;
