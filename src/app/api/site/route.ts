// src/app/api/site/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  await connectDb();
  const user = await getUserFromToken(req as any);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { niche } = body;

  if (!niche)
    return NextResponse.json({ error: "niche is required" }, { status: 400 });

  // Generate a unique slug
  const safeUsername = user.username || user.email?.split("@")[0] || "user";
  const random = Math.floor(1000 + Math.random() * 9000);
  let slug = `${safeUsername}-${random}`;

  // Ensure uniqueness
  while (await Site.findOne({ slug })) {
    slug = `${safeUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const site = await Site.create({
    ownerId: user.id,
    niche,
    slug,
    title: `${niche.charAt(0).toUpperCase() + niche.slice(1)} Website`,
    blocks: [],
    published: true,
  });

  return NextResponse.json({ data: site });
}
