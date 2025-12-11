import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  passwordHash?: string;
  role: "admin" | "affiliate" | "client";
  referralCode?: string;
  clientId: string;
  referredById?: string;
  emailVerified: boolean;
  onboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["admin", "affiliate", "client"],
      default: "client",
    },
    referralCode: { type: String, unique: true, sparse: true },
    clientId: { type: String, required: true, unique: true },
    referredById: { type: String },
    emailVerified: { type: Boolean, default: false },
    onboarded: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Add index for referralCode
UserSchema.index({ referralCode: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
