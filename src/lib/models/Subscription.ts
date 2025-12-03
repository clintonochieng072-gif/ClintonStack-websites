import mongoose, { Document, Model } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId; // Reference to User
  planId: mongoose.Types.ObjectId; // Reference to Plan
  status: "active" | "cancelled" | "expired" | "trial"; // Subscription status
  currentPeriodStart: Date; // Start of current billing period
  currentPeriodEnd: Date; // End of current billing period
  trialEndsAt?: Date; // Trial period end date
  cancelledAt?: Date; // Cancellation date
  extraStorageGB: number; // Additional storage purchased (in GB)
  usage: {
    storageUsed: number; // Current storage used (in GB)
    imagesUsed: number; // Images uploaded this month
    propertiesCount: number; // Number of properties listed
    lastResetDate: Date; // Last monthly reset date
  };
  paymentMethod?: string; // Payment method reference
  autoRenew: boolean; // Whether subscription auto-renews
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One subscription per user
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "trial"],
      default: "trial",
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    extraStorageGB: {
      type: Number,
      default: 0,
      min: 0,
    },
    usage: {
      storageUsed: {
        type: Number,
        default: 0,
        min: 0,
      },
      imagesUsed: {
        type: Number,
        default: 0,
        min: 0,
      },
      propertiesCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

const Subscription: Model<ISubscription> =
  (mongoose.models && mongoose.models.Subscription) ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;
