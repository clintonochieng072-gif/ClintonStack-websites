import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚨 NEVER TOUCH AUTH.JS ROUTES
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const userId = (token as any)?.id as string;

  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/redirect");

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  if (isAuthRoute && userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtected && !userId) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (userId) {
    try {
      // Query PostgreSQL directly for latest role and onboarded status
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          onboarded: true,
        },
      });

      if (!user) {
        // User not found in PostgreSQL, redirect to login
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      // Role-based access control
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (user.role === "affiliate") {
        // Affiliates can only access affiliate routes and public pages
        const allowedAffiliatePaths = [
          "/dashboard/affiliate",
          "/auth",
          "/api",
          "/_next",
          "/favicon.ico",
          "/", // landing page
          "/affiliate-program",
          "/affiliate-signup",
        ];

        const isAllowed = allowedAffiliatePaths.some((path) =>
          pathname.startsWith(path)
        );

        if (!isAllowed) {
          return NextResponse.redirect(
            new URL("/dashboard/affiliate", req.url)
          );
        }

        // Force redirect to affiliate dashboard if not already there
        if (
          !pathname.startsWith("/dashboard/affiliate") &&
          !pathname.startsWith("/auth") &&
          !pathname.startsWith("/api")
        ) {
          return NextResponse.redirect(
            new URL("/dashboard/affiliate", req.url)
          );
        }
      } else {
        // Clients cannot access affiliate routes
        if (
          pathname.startsWith("/dashboard/affiliate") ||
          pathname.startsWith("/affiliate-signup")
        ) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        if (!user.onboarded) {
          if (!pathname.startsWith("/onboarding/niches")) {
            return NextResponse.redirect(
              new URL("/onboarding/niches", req.url)
            );
          }
        }

        // For onboarded clients, redirect to /dashboard if not already there
        if (user.onboarded) {
          if (
            !pathname.startsWith("/dashboard") ||
            pathname.startsWith("/dashboard/affiliate")
          ) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
          }
        }
      }
    } catch (error) {
      console.error("Middleware PostgreSQL query failed:", error);
      // If PostgreSQL fails, allow access to prevent blocking, but log error
      // This ensures MongoDB failures don't block, and PostgreSQL failures are handled gracefully
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
