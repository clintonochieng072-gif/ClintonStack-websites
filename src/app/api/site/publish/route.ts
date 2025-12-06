// src/app/api/site/publish/route.ts

import { Site } from "@/lib/models/Site";

export async function POST(req: Request) {
  try {
    const { siteId } = await req.json();
    const site = await Site.findById(siteId);

    if (!site) {
      return new Response("Site not found", { status: 404 });
    }

    // Copy the ENTIRE draft into publishedWebsite.data
    site.publishedWebsite = {
      data: {
        ...site.userWebsite?.draft,
      },
      integrations: {
        ...site.userWebsite?.integrations,
      },
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
