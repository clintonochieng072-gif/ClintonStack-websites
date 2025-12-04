import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function getUserFromToken() {
  try {
    const headersList = await headers();
    const token = headersList.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (e) {
    return null;
  }
}
