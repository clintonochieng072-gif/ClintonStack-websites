import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { usersRepo } from "@/repositories/usersRepo";

export async function getUserFromToken() {
  try {
    const headersList = await headers();
    let token = headersList.get("authorization")?.replace("Bearer ", "");

    // If no Bearer token, try auth_token cookie
    if (!token) {
      const cookies = headersList.get("cookie");
      if (cookies) {
        const authToken = cookies
          .split(";")
          .find((c) => c.trim().startsWith("auth_token="));
        if (authToken) {
          token = authToken.split("=")[1];
        }
      }
    }

    // If still no token, try NextAuth session token
    if (!token) {
      const cookies = headersList.get("cookie");
      if (cookies) {
        const nextAuthToken = cookies
          .split(";")
          .find(
            (c) =>
              c.trim().startsWith("next-auth.session-token=") ||
              c.trim().startsWith("__Secure-next-auth.session-token=")
          );
        if (nextAuthToken) {
          token = nextAuthToken.split("=")[1];
        }
      }
    }

    if (!token) return null;

    // Try custom JWT first
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!decoded.userId) throw new Error("No userId");
    } catch {
      // Try NextAuth JWT
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
      if (!decoded.id) return null;
    }

    const userId = decoded.userId || decoded.id;

    // Use PostgreSQL to find user
    const user = await usersRepo.findById(userId);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      onboarded: user.onboarded === true,
      username: user.username,
      niche: null, // Not in current schema, set to null
      role: user.role || "client",
    };
  } catch (e) {
    return null;
  }
}
