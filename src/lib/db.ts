// src/lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clintonstack";

if (!MONGODB_URI) throw new Error("Add MONGODB_URI to env");

let cached: { conn: typeof mongoose | null } = { conn: null };

export async function connectDb() {
  if (cached.conn) return cached.conn;
  await mongoose.connect(MONGODB_URI);
  cached.conn = mongoose;
  return cached.conn;
}