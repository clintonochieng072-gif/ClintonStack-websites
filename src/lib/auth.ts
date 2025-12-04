import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import dbConnect from "./mongodb";
import User from "./models/User";

export async function getUserFromToken() {
  try {
    const headersList = await headers();
    const token = headersList.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded.userId) return null;

    await dbConnect();
    const user = await User.findById(decoded.userId)
      .select("email onboarded username niche role")
      .lean();

    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      onboarded: user.onboarded === true,
      username: user.username,
      niche: user.niche || null,
      role: user.role || "user",
    };
  } catch (e) {
    return null;
  }
}
