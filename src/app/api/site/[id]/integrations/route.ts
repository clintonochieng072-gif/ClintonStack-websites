// src/app/api/site/[id]/integrations/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Validation function for integrations
function validateIntegrations(integrations: any) {
  const allowedFields = [
    "phoneNumber",
    "whatsappNumber",
    "tawkToId",
    "crispId",
    "googleAnalyticsId",
    "googleTagManagerId",
    "metaPixelId",
    "mailchimpApiKey",
    "mailchimpListId",
    "brevoApiKey",
    "googleMapsApiKey",
    "customScript",
  ];

  for (const key in integrations) {
    if (!allowedFields.includes(key)) {
      throw new Error(`Invalid field: ${key}`);
    }

    // Validate phoneNumber - basic phone number format
    if (key === "phoneNumber" && integrations[key]) {
      const phoneRegex = /^[0-9+\-() ]+$/;
      if (!phoneRegex.test(integrations[key])) {
        throw new Error("Invalid phone number format");
      }
    }

    // Validate customScript - only allow script tags
    if (key === "customScript" && integrations[key]) {
      const scriptRegex = /^<script[^>]*>[\s\S]*<\/script>$/;
      if (!scriptRegex.test(integrations[key].trim())) {
        throw new Error(
          "Custom script must be wrapped in <script> tags and contain only JavaScript"
        );
      }
    }

    // Basic validation for IDs (alphanumeric, hyphens, underscores)
    if (
      [
        "googleAnalyticsId",
        "googleTagManagerId",
        "metaPixelId",
        "tawkToId",
        "crispId",
      ].includes(key) &&
      integrations[key]
    ) {
      const idRegex = /^[A-Za-z0-9_-]+$/;
      if (!idRegex.test(integrations[key])) {
        throw new Error(`Invalid ${key} format`);
      }
    }
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const { id } = await params;
  const user = await getUserFromToken();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await Site.findById(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(site.ownerId) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  console.log("Integrations GET - site.userWebsite:", site.userWebsite);
  console.log(
    "Integrations GET - integrations:",
    site.userWebsite?.integrations
  );

  return NextResponse.json({
    integrations: site.userWebsite?.integrations || {},
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();
  const { id } = await params;
  const user = await getUserFromToken();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await Site.findById(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(site.ownerId) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { integrations } = await req.json();
  console.log("Saving integrations:", integrations);

  // Validate integrations
  try {
    validateIntegrations(integrations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update integrations
  if (!site.userWebsite)
    site.userWebsite = { draft: {}, published: {}, integrations: {} };
  if (!site.userWebsite.integrations) site.userWebsite.integrations = {};

  Object.assign(site.userWebsite.integrations, integrations);
  await site.save();

  // Broadcast site update to preview
  await pusherServer.trigger(`site-${site.slug}`, "site-updated", {
    slug: site.slug,
  });

  return NextResponse.json({ integrations: site.userWebsite.integrations });
}
