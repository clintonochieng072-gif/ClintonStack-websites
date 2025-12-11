import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only source of truth for auth inside middleware
  const user = await getUserFromToken();

  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/redirect");

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  // 1. Prevent authenticated users from accessing /auth/*
  if (isAuthRoute && user?.id) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Block protected routes for unauthenticated users
  if (isProtected && !user?.id) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 3. Role-based routing
  if (user?.id) {
    // Affiliates ALWAYS go to affiliate dashboard
    if (user.role === "affiliate") {
      if (!pathname.startsWith("/dashboard/affiliate")) {
        return NextResponse.redirect(new URL("/dashboard/affiliate", req.url));
      }
    }

    // Clients who are not yet onboarded
    if (user.role !== "affiliate" && !user.onboarded) {
      if (!pathname.startsWith("/onboarding/niches")) {
        return NextResponse.redirect(new URL("/onboarding/niches", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
