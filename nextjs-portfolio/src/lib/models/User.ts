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
  role: "user" | "admin"; // User role for authorization
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
    enum: ["user", "admin"],
    default: "user",
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
  (mongoose.models && mongoose.models.User) || mongoose.model<IUser>("User", UserSchema);

export default User;
