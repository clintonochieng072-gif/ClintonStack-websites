import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

  await dbConnect();

  const sites = await Site.find({ published: true })
    .select("slug updatedAt")
    .lean();

  const siteUrls = sites.map((site) => ({
    url: `${baseUrl}/site/${site.slug}`,
    lastModified: site.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...siteUrls,
  ];
}
