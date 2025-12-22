import "@/lib/logger";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚨 NEVER TOUCH AUTH.JS ROUTES
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/site") ||
    pathname.startsWith("/api/affiliate") ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/team") ||
    pathname.startsWith("/api/leads") ||
    pathname.startsWith("/api/properties") ||
    pathname.startsWith("/api/payments") ||
    pathname.startsWith("/api/billing") ||
    pathname.startsWith("/api/subscription") ||
    pathname.startsWith("/api/analytics") ||
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/category") ||
    pathname.startsWith("/api/property-types") ||
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
        // Allow all affiliate subroutes
        if (pathname.startsWith("/dashboard/affiliate")) {
          return NextResponse.next();
        }

        // Allow public + auth + api routes
        if (
          pathname.startsWith("/auth") ||
          pathname.startsWith("/api") ||
          pathname.startsWith("/_next") ||
          pathname === "/" ||
          pathname.startsWith("/affiliate-program") ||
          pathname.startsWith("/affiliate-signup")
        ) {
          return NextResponse.next();
        }

        // Redirect ONLY if not already on affiliate dashboard
        return NextResponse.redirect(new URL("/dashboard/affiliate", req.url));
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

        // For onboarded clients, get the site niche and redirect to niche dashboard
        if (user.onboarded) {
          try {
            await dbConnect();
            const site = (await Site.findOne(
              { ownerId: userId },
              { niche: 1 }
            ).lean()) as { niche?: string } | null;
            if (site?.niche) {
              const nicheDashboard = `/dashboard/${site.niche}`;
              if (
                !pathname.startsWith(nicheDashboard) &&
                !pathname.startsWith("/dashboard/niches")
              ) {
                return NextResponse.redirect(new URL(nicheDashboard, req.url));
              }
            } else {
              // No site, redirect to niches page
              if (!pathname.startsWith("/dashboard/niches")) {
                return NextResponse.redirect(
                  new URL("/dashboard/niches", req.url)
                );
              }
            }
          } catch (error) {
            console.error("Error fetching site for redirect:", error);
            // Fallback to /dashboard
            if (!pathname.startsWith("/dashboard")) {
              return NextResponse.redirect(new URL("/dashboard", req.url));
            }
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
