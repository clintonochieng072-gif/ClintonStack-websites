import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User interface defining the structure of a user document in MongoDB.
 * Includes authentication fields, profile information, and business logic fields.
 */
export interface IUser extends Document {
  name: string; // Display name
  username: string; // Unique username (lowercased)
  email: string; // Unique email address (lowercased)
  passwordHash: string; // Hashed password using bcrypt
  role: "client" | "affiliate" | "admin"; // User role for authorization
  category: string | null; // User's professional category
  niche: string | null; // User's specific niche
  template: string | null; // Selected portfolio template
  onboarded: boolean; // Whether user has completed onboarding
  avatarUrl: string | null; // Profile avatar URL
  plan?: string; // Subscription plan (free, premium, etc.)
  status?: string; // Account status (active, suspended, etc.)
  customDomain?: string; // Custom domain for portfolio
  has_paid?: boolean; // Payment status
  is_first_login?: boolean; // Tracks first login
  isLocked?: boolean; // Account lock status (trial expired)
  lastLogin?: Date; // Last login timestamp
  trialEndsAt?: Date; // Trial period end date
  emailVerified: boolean; // Email verification status
  // Billing fields
  subscriptionStatus: "active" | "inactive"; // Subscription status
  subscriptionType: "monthly" | "lifetime" | null; // Type of subscription
  subscriptionExpiresAt?: Date | null; // Expiration date for monthly subscriptions
  // Affiliate fields
  referralCode?: string; // Unique referral code for affiliates
  availableBalance?: number; // Amount available for withdrawal (real money only)
  totalEarned?: number; // Total earnings from referrals
  withdrawalHistory?: {
    withdrawalId: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    requestedAt: Date;
    processedAt?: Date;
    phoneNumber?: string;
  }[]; // History of withdrawal requests
  // Client fields
  referrerId?: string; // ID of affiliate who referred this client
  createdAt: Date; // Account creation timestamp
  comparePassword(candidatePassword: string): Promise<boolean>; // Password comparison method
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["client", "affiliate", "admin"],
    default: "client",
  },
  category: {
    type: String,
    default: null,
  },
  niche: {
    type: String,
    default: null,
  },
  template: {
    type: String,
    default: null,
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  plan: {
    type: String,
    default: "free",
  },
  status: {
    type: String,
    default: "active",
  },
  customDomain: {
    type: String,
    default: null,
  },
  has_paid: {
    type: Boolean,
    default: false,
  },
  is_first_login: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  trialEndsAt: {
    type: Date,
    default: null,
  },
  emailVerified: {
    type: Boolean,
    default: true,
  },
  // Billing fields
  subscriptionStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  subscriptionType: {
    type: String,
    enum: ["monthly", "lifetime", null],
    default: null,
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null,
  },
  // Affiliate fields
  referralCode: {
    type: String,
    default: null,
    unique: true,
    sparse: true,
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  withdrawalHistory: [
    {
      withdrawalId: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        required: true,
      },
      requestedAt: {
        type: Date,
        required: true,
      },
      processedAt: {
        type: Date,
        default: null,
      },
      phoneNumber: {
        type: String,
        default: null,
      },
    },
  ],
  // Client fields
  referrerId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password hashing is handled manually in API routes for consistency

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  // Compare against the stored hash
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User: Model<IUser> =
  (mongoose.models && mongoose.models.User) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
