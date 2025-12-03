// src/lib/getPreviewSite.ts
export async function getPreviewSite(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/site/preview/${slug}`, {
    cache: "no-store", // No cache for preview to show latest draft
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}
