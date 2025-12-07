// src/app/api/site/publish/route.ts

import { Site } from "@/lib/models/Site";

export async function POST(req: Request) {
  try {
    const { siteId } = await req.json();
    const site = await Site.findById(siteId);

    if (!site) {
      return new Response("Site not found", { status: 404 });
    }

    // Copy draft blocks, theme, layout to published
    site.publishedWebsite = {
      data: {
        blocks: JSON.parse(
          JSON.stringify(site.userWebsite?.draft?.blocks || [])
        ),
      },
      theme: JSON.parse(JSON.stringify(site.userWebsite?.draft?.theme || {})),
      layout: JSON.parse(JSON.stringify(site.userWebsite?.draft?.layout || {})),
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
