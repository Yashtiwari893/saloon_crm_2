import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveActiveSalonId } from "@/lib/salonStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booking_id, amount, payment_method, discount, extra_charges, staff_user_id } = body;

    if (!booking_id || amount === undefined) {
      return NextResponse.json({ error: "booking_id and amount are required" }, { status: 400 });
    }

    const activeSalonId = await resolveActiveSalonId();

    const finalAmount = Number(amount) + Number(extra_charges || 0) - Number(discount || 0);

    // 1. Fetch booking record
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .eq("salon_id", activeSalonId)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. Record Payment Entry
    try {
      await supabaseAdmin.from("payments").insert({
        salon_id: activeSalonId,
        booking_id: booking_id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        service_amount: Number(amount),
        extra_charges: Number(extra_charges || 0),
        discount: Number(discount || 0),
        final_amount: finalAmount,
        payment_method: payment_method || "cash",
        status: "completed",
        staff_user_id: staff_user_id || null,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Payment table insert optional fallback
    }

    // 3. Update Booking Payment Status
    await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "completed",
        total_price: finalAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    // 4. Update Customer Total Spend & Visit History
    if (booking.customer_phone) {
      const { data: cust } = await supabaseAdmin
        .from("customers")
        .select("id, total_spend, total_visits")
        .eq("salon_id", activeSalonId)
        .eq("phone_number", booking.customer_phone)
        .maybeSingle();

      if (cust) {
        await supabaseAdmin
          .from("customers")
          .update({
            total_spend: Number(cust.total_spend || 0) + finalAmount,
            total_visits: Number(cust.total_visits || 0) + 1,
            last_visit_at: new Date().toISOString(),
          })
          .eq("id", cust.id);
      }
    }

    // 5. Trigger Rating Request Queue Item
    try {
      await supabaseAdmin.from("notifications").insert({
        salon_id: activeSalonId,
        type: "RATING_TRIGGER_REQUEST",
        title: `Rating Request Pending for ${booking.customer_name}`,
        message: `Send 5-star WhatsApp rating prompt to ${booking.customer_phone}`,
        metadata: JSON.stringify({
          booking_id: booking_id,
          customer_phone: booking.customer_phone,
          customer_name: booking.customer_name,
        }),
        status: "pending",
        created_at: new Date().toISOString(),
      });
    } catch {
      // Notification insert fallback
    }

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${finalAmount} recorded successfully for ${booking.customer_name}. Rating request queued.`,
      final_amount: finalAmount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record payment" }, { status: 500 });
  }
}
