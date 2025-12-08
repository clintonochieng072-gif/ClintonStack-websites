import mongoose, { Document, Model } from "mongoose";

export interface IBillingStats extends Document {
  lifetimeCount: number; // Number of lifetime plan purchases
  lifetimeLimit: number; // Maximum lifetime plans allowed (10)
  createdAt: Date;
  updatedAt: Date;
}

const BillingStatsSchema = new mongoose.Schema<IBillingStats>(
  {
    lifetimeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lifetimeLimit: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
BillingStatsSchema.pre("save", async function (next) {
  const count = await mongoose.models.BillingStats?.countDocuments() || 0;
  if (count > 0 && this.isNew) {
    const error = new Error("Only one BillingStats document is allowed");
    return next(error);
  }
  next();
});

const BillingStats: Model<IBillingStats> =
  (mongoose.models && mongoose.models.BillingStats) ||
  mongoose.model<IBillingStats>("BillingStats", BillingStatsSchema);

export default BillingStats;