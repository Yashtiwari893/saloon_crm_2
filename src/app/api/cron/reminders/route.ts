import { NextResponse } from "next/server";
import { processUpcomingReminders } from "@/lib/reminders";

export async function GET(req: Request) {
  try {
    const result = await processUpcomingReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger reminders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
