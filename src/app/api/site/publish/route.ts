// src/app/api/site/publish/route.ts

import { Site } from "@/lib/models/Site";
import { auth } from "../../auth/[...nextauth]/route";
import { usersRepo } from "@/repositories/usersRepo";
import { connectDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDb();

    // Authenticate user using NextAuth
    const session = await auth();
    if (!session?.user?.email) {
      console.log("Publish: No session or email");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get user from PostgreSQL
    const user = await usersRepo.findByEmail(session.user.email);
    if (!user) {
      console.log("Publish: User not found in PostgreSQL", session.user.email);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    console.log("Publish: User authenticated", {
      userId: user.id,
      email: user.email,
      hasPaid: user.has_paid,
    });

    const { siteId } = await req.json();
    console.log("Publish: Requested siteId", siteId);

    const site = await Site.findById(siteId);

    if (!site) {
      console.log("Publish: Site not found", siteId);
      return new Response("Site not found", { status: 404 });
    }

    console.log("Publish: Site found", {
      siteOwnerId: site.ownerId,
      siteSlug: site.slug,
    });

    // Check ownership using PostgreSQL user ID (sites store PostgreSQL user IDs as ownerId)
    if (String(site.ownerId) !== String(user.id)) {
      console.log("Publish: Ownership check failed", {
        siteOwnerId: site.ownerId,
        pgUserId: user.id,
      });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    console.log("Publish: Ownership check passed");

    // Check if user has been approved by admin (has_paid = true)
    const isApproved = user.has_paid || user.role === "admin";

    if (!isApproved) {
      console.log("Publish: User has not been approved by admin", {
        has_paid: user.has_paid,
        role: user.role,
      });
      return new Response(
        JSON.stringify({
          error:
            "Account not approved. Please complete payment and wait for admin approval.",
        }),
        {
          status: 403,
        }
      );
    }

    console.log("Publish: Admin approval check passed");

    // Copy draft blocks, theme, layout and integrations to published
    site.publishedWebsite = {
      data: {
        blocks: JSON.parse(
          JSON.stringify(site.userWebsite?.draft?.blocks || [])
        ),
      },
      theme: JSON.parse(JSON.stringify(site.userWebsite?.draft?.theme || {})),
      layout: JSON.parse(JSON.stringify(site.userWebsite?.draft?.layout || {})),
      integrations: JSON.parse(JSON.stringify(site.integrations || {})),
    };

    // Force mongoose to save nested object
    site.markModified("publishedWebsite");

    await site.save();

    console.log("Publish: Site published successfully", siteId);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Publish: Error", error);
    return new Response("Server error", { status: 500 });
  }
}
