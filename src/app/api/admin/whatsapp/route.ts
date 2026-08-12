import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhoneNumber } from "@/lib/phoneNormalizer";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    // 1. Fetch phone mappings
    const { data: mappings, error: mapErr } = await supabaseAdmin
      .from("phone_document_mapping")
      .select("*")
      .order("created_at", { ascending: false });

    if (mapErr) throw mapErr;

    // 2. Fetch salons to safely map salon names without relying on database FK constraints
    const { data: salons } = await supabaseAdmin.from("salons").select("id, name, slug, is_active");
    const salonMap = new Map((salons || []).map((s: any) => [s.id, s]));

    const formattedMappings = (mappings || []).map((m: any) => {
      const salon = m.salon_id ? salonMap.get(m.salon_id) : null;
      return {
        id: m.id,
        salonId: m.salon_id,
        salonName: salon?.name || "Global Webhook Gateway",
        phoneNumber: m.phone_number,
        origin: m.origin || "https://api.11za.in",
        authToken: m.auth_token ? "••••••••" + (m.auth_token.length > 4 ? m.auth_token.slice(-4) : m.auth_token) : "Not Configured",
        webhook_enabled: m.webhook_enabled ?? true,
        lastWebhookAt: m.updated_at || m.created_at,
      };
    });

    return NextResponse.json({ success: true, accounts: formattedMappings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch WhatsApp accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { salonId, phone_number, origin, auth_token, webhook_enabled } = await req.json();

    if (!salonId || !phone_number) {
      return NextResponse.json({ error: "Salon ID and Phone Number are required" }, { status: 400 });
    }

    const cleanPhone = normalizePhoneNumber(phone_number);

    const { data: updated, error } = await supabaseAdmin
      .from("phone_document_mapping")
      .upsert(
        {
          salon_id: salonId,
          phone_number: cleanPhone,
          origin: origin || "https://api.11za.in",
          auth_token: auth_token || "11za-demo-token",
          webhook_enabled: webhook_enabled ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "phone_number" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save WhatsApp config" }, { status: 500 });
  }
}
