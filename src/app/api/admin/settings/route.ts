import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const settings = {
      platformName: "WhatsApp Salon SaaS Platform",
      supportEmail: "support@salonsaas.com",
      defaultCurrency: "INR",
      defaultSlotInterval: 15,
      maintenanceMode: false,
      gatewayOrigin: "https://api.11za.in",
      sessionMaxAgeDays: 7,
      llmPrimaryModel: "Groq LLaMA 3.3 70B",
    };

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const body = await req.json();

    return NextResponse.json({ success: true, message: "System settings updated successfully", settings: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save settings" }, { status: 500 });
  }
}
