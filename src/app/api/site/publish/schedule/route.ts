// src/app/api/site/publish/schedule/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { Site } from "@/lib/models/Site";

export async function GET(req: Request) {
  await connectDb();
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: site.publishSchedule || {
        enabled: false,
        frequency: "daily",
        time: "09:00",
      },
    });
  } catch (error) {
    console.error("Publish schedule fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch publish schedule" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  await connectDb();
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const scheduleData = await req.json();

    // Find user's site
    const site = await Site.findOne({ ownerId: user.id });
    if (!site) {
      return NextResponse.json(
        { success: false, message: "Site not found" },
        { status: 404 }
      );
    }

    // Calculate next publish date
    const nextPublish = calculateNextPublishDate(scheduleData);

    // Update publish schedule
    site.publishSchedule = {
      ...scheduleData,
      nextPublish,
      lastPublished: site.publishSchedule?.lastPublished,
    };

    await site.save();

    return NextResponse.json({
      success: true,
      data: site.publishSchedule,
      message: "Publish schedule updated successfully",
    });
  } catch (error) {
    console.error("Publish schedule update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update publish schedule" },
      { status: 500 }
    );
  }
}

function calculateNextPublishDate(schedule: any): Date {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(":").map(Number);

  let nextDate = new Date(now);
  nextDate.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for next occurrence
  if (nextDate <= now) {
    switch (schedule.frequency) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        const daysUntilNext = (schedule.dayOfWeek - nextDate.getDay() + 7) % 7;
        nextDate.setDate(nextDate.getDate() + (daysUntilNext || 7));
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(schedule.dayOfMonth);
        break;
    }
  } else {
    // Time hasn't passed yet today
    switch (schedule.frequency) {
      case "weekly":
        const daysUntilTarget =
          (schedule.dayOfWeek - nextDate.getDay() + 7) % 7;
        if (daysUntilTarget > 0) {
          nextDate.setDate(nextDate.getDate() + daysUntilTarget);
        }
        break;
      case "monthly":
        if (nextDate.getDate() !== schedule.dayOfMonth) {
          nextDate.setDate(schedule.dayOfMonth);
          if (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }
        }
        break;
    }
  }

  return nextDate;
}
