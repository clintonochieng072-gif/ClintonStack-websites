import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Payment webhook service is currently unavailable
  return NextResponse.json(
    { success: false, message: "Webhook service unavailable" },
    { status: 503 }
  );
}
