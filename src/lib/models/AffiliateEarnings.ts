import mongoose, { Document, Model } from "mongoose";

export interface IAffiliateEarnings extends Document {
  affiliateId: string; // ID of the affiliate
  productId: string; // ID of the product
  totalEarnings: number; // Total earnings from this product
  pendingEarnings: number; // Earnings from pending referrals
  paidEarnings: number; // Earnings from paid referrals
  referralCount: number; // Total number of referrals for this product
  paidReferralCount: number; // Number of paid referrals
  lastUpdated: Date;
  createdAt: Date;
}

const AffiliateEarningsSchema = new mongoose.Schema<IAffiliateEarnings>({
  affiliateId: {
    type: String,
    required: true,
    index: true,
  },
  productId: {
    type: String,
    required: true,
    index: true,
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0,
  },
  pendingEarnings: {
    type: Number,
    default: 0,
    min: 0,
  },
  paidEarnings: {
    type: Number,
    default: 0,
    min: 0,
  },
  referralCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  paidReferralCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for affiliate + product
AffiliateEarningsSchema.index(
  { affiliateId: 1, productId: 1 },
  { unique: true }
);

// Update lastUpdated before saving
AffiliateEarningsSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const AffiliateEarnings: Model<IAffiliateEarnings> =
  (mongoose.models && mongoose.models.AffiliateEarnings) ||
  mongoose.model<IAffiliateEarnings>(
    "AffiliateEarnings",
    AffiliateEarningsSchema
  );

export default AffiliateEarnings;
