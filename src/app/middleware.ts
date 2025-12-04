import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = await getUserFromToken();

  const isAuthRoute =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  // 1. Prevent authenticated users from returning to login/register
  if (isAuthRoute && user?.id) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Block protected routes from unauthenticated users
  if (isProtected && !user?.id) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/register).*)",
  ],
};
