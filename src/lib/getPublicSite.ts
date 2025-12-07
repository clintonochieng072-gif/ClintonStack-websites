// src/lib/getPublicSite.ts
import { getBaseUrl } from "./utils";

export async function getPublicSite(slug: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/site/public/${slug}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}
