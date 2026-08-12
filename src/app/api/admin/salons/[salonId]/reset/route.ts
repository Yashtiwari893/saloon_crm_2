import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { salonId } = await params;
    const { confirm_salon_name } = await req.json();

    const { data: salon } = await supabaseAdmin
      .from("salons")
      .select("name")
      .eq("id", salonId)
      .single();

    if (!salon || salon.name.trim().toLowerCase() !== confirm_salon_name.trim().toLowerCase()) {
      return NextResponse.json({ error: "Salon name confirmation mismatch" }, { status: 400 });
    }

    // Wipe operational data (bookings, whatsapp messages, notifications, chat conversations) for this salon only
    await Promise.all([
      supabaseAdmin.from("bookings").delete().eq("salon_id", salonId),
      supabaseAdmin.from("whatsapp_messages").delete().eq("salon_id", salonId),
      supabaseAdmin.from("notifications").delete().eq("salon_id", salonId),
      supabaseAdmin.from("user_conversation_data").delete().eq("salon_id", salonId),
    ]);

    return NextResponse.json({ success: true, message: `Operational data reset completed for ${salon.name}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
