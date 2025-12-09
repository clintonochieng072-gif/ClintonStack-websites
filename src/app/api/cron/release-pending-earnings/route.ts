import { NextRequest, NextResponse } from "next/server";
import { placeholderCronJob } from "@/lib/cron";

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication for cron calls
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await placeholderCronJob();

    return NextResponse.json({
      success: true,
      message: "Pending earnings released successfully",
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Only allow GET requests for cron jobs
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
