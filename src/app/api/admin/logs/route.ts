import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("*, salons(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const formattedLogs = (messages || []).map((m: any) => ({
      id: m.id,
      salonName: m.salons?.name || "System Gateway",
      phoneNumber: m.phone_number,
      senderType: m.sender_type,
      messageText: m.message_text,
      status: m.status || "delivered",
      level: m.sender_type === "bot" ? "AI_RESPONSE" : m.sender_type === "system" ? "WEBHOOK" : "USER_INBOUND",
      createdAt: m.created_at,
    }));

    return NextResponse.json({ success: true, logs: formattedLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch logs" }, { status: 500 });
  }
}
