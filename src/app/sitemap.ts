import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import { Site } from "@/lib/models/Site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

  // Skip database queries during build time
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL;
  const isDummyUri = process.env.MONGODB_URI === 'mongodb://dummy';

  if (isBuildTime || isDummyUri) {
    // Return basic sitemap during build
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
    ];
  }

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
