// src/lib/getPreviewSite.ts
import { getBaseUrl } from "./utils";

export async function getPreviewSite(slug: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/site/preview/${slug}`, {
    cache: "no-store", // No cache for preview to show latest draft
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}
