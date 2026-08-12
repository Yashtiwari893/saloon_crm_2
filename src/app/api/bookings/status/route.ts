import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveActiveSalonId } from "@/lib/salonStore";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { booking_id, status, barber_id, cancellation_reason } = body;

    if (!booking_id || !status) {
      return NextResponse.json({ error: "booking_id and status are required" }, { status: 400 });
    }

    const activeSalonId = await resolveActiveSalonId();

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "arrived") {
      updatePayload.arrival_time = new Date().toISOString();
    } else if (status === "service_started") {
      updatePayload.service_start_time = new Date().toISOString();
    } else if (status === "completed") {
      updatePayload.service_end_time = new Date().toISOString();
    } else if (status === "cancelled") {
      updatePayload.cancellation_reason = cancellation_reason || "Cancelled by customer/salon";
    }

    const { data: updatedBooking, error } = await supabaseAdmin
      .from("bookings")
      .update(updatePayload)
      .eq("id", booking_id)
      .eq("salon_id", activeSalonId)
      .select("*")
      .single();

    if (error) throw error;

    // Sync Barber Duty status
    const targetBarberId = barber_id || updatedBooking.barber_id;
    if (targetBarberId) {
      if (status === "service_started") {
        await supabaseAdmin
          .from("barbers")
          .update({ is_on_duty: true, is_busy: true })
          .eq("id", targetBarberId);
      } else if (status === "completed" || status === "cancelled") {
        await supabaseAdmin
          .from("barbers")
          .update({ is_busy: false })
          .eq("id", targetBarberId);
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update booking status" }, { status: 500 });
  }
}
