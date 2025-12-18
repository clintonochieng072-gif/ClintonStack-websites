import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const ADMIN_EMAIL = "clintonochieng072@gmail.com";

export async function verifyAdmin(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { isValid: false, error: "No authorization token provided" };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return { isValid: false, error: "User not found" };
    }

    // Check if user is admin by email
    if (user.email !== ADMIN_EMAIL) {
      return {
        isValid: false,
        error: "Access denied. Admin privileges required.",
      };
    }

    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Admin verification error:", error);
    return { isValid: false, error: "Invalid or expired token" };
  }
}

export function isAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL;
}
