// src/lib/getPublicSite.ts
import { getBaseUrl } from "./utils";

export async function getPublicSite(slug: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/site/public/${slug}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes, then revalidate
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}
