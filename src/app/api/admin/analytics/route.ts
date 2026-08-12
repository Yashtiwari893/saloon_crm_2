import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const [salonsRes, bookingsRes, customersRes] = await Promise.all([
      supabaseAdmin.from("salons").select("id, name, slug, status, subscription_plan"),
      supabaseAdmin.from("bookings").select("id, salon_id, total_price, status, created_at"),
      supabaseAdmin.from("customers").select("id, salon_id, created_at"),
    ]);

    const salons = salonsRes.data || [];
    const bookings = bookingsRes.data || [];
    const customers = customersRes.data || [];

    const totalRevenue = bookings.reduce(
      (acc: number, b: any) => acc + (b.status === "completed" ? Number(b.total_price || 0) : 0),
      0
    );

    const totalBookingsCount = bookings.length;
    const totalCustomersCount = customers.length;

    // Per Salon Performance Ranking
    const salonPerformance = salons.map((s: any) => {
      const salonBookings = bookings.filter((b: any) => b.salon_id === s.id);
      const salonRevenue = salonBookings.reduce(
        (acc: number, b: any) => acc + (b.status === "completed" ? Number(b.total_price || 0) : 0),
        0
      );
      const salonCustomers = customers.filter((c: any) => c.salon_id === s.id).length;

      return {
        id: s.id,
        name: s.name,
        revenue: salonRevenue,
        bookingsCount: salonBookings.length,
        customersCount: salonCustomers,
        plan: s.subscription_plan || "pro",
      };
    });

    salonPerformance.sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalBookingsCount,
        totalCustomersCount,
        totalSalonsCount: salons.length,
        salonPerformance,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
