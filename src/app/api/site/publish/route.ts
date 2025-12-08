// src/app/api/site/publish/route.ts

import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Authenticate user
    const user = await getUserFromToken();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { siteId } = await req.json();
    const site = await Site.findById(siteId);

    if (!site) {
      return new Response("Site not found", { status: 404 });
    }

    // Check ownership
    if (String(site.ownerId) !== String(user.id)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    // No subscription checks - publishing is now free

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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
}
