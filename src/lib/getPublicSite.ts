// src/lib/getPublicSite.ts
export async function getPublicSite(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/site/public/${slug}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes, then revalidate
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}
