import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import Payment from "@/lib/models/Payment";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { success: false, message: "Payment service is currently unavailable" },
    { status: 503 }
  );
}
