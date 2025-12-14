import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/auth";

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

  const user = await getUserFromToken();

  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/redirect");

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  if (isAuthRoute && user?.id) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtected && !user?.id) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (user?.id) {
    if (user.role === "affiliate") {
      if (!pathname.startsWith("/dashboard/affiliate")) {
        return NextResponse.redirect(new URL("/dashboard/affiliate", req.url));
      }
    }

    if (user.role !== "affiliate" && !user.onboarded) {
      if (!pathname.startsWith("/onboarding/niches")) {
        return NextResponse.redirect(new URL("/onboarding/niches", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
