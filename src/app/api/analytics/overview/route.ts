import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveActiveSalonId } from "@/lib/salonStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const salonId = await resolveActiveSalonId();

        const [
            bookingsResult,
            customersResult,
            barbersResult,
            servicesResult,
            waMessagesResult,
        ] = await Promise.all([
            supabaseAdmin.from("bookings").select("total_price, status").eq("salon_id", salonId),
            supabaseAdmin.from("customers").select("id", { count: "exact", head: true }).eq("salon_id", salonId),
            supabaseAdmin.from("barbers").select("id", { count: "exact", head: true }).eq("salon_id", salonId),
            supabaseAdmin.from("services").select("id", { count: "exact", head: true }).eq("salon_id", salonId),
            supabaseAdmin.from("whatsapp_messages").select("id", { count: "exact", head: true }).eq("salon_id", salonId),
        ]);

        const bookings = bookingsResult.data || [];
        const todayRevenue = bookings.reduce(
            (acc, b) => acc + (b.status === "completed" ? Number(b.total_price || 0) : 0),
            0
        );

        return NextResponse.json({
            success: true,
            metrics: {
                today_revenue: todayRevenue,
                total_bookings: bookings.length,
                total_customers: customersResult.count || 0,
                active_barbers: barbersResult.count || 0,
                active_services: servicesResult.count || 0,
                whatsapp_messages: waMessagesResult.count || 0,
            },
        });
    } catch (error) {
        console.error("ANALYTICS_OVERVIEW_ERROR", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to load analytics",
            },
            { status: 500 }
        );
    }
}
