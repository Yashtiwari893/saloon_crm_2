import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { data: salons, error } = await supabaseAdmin
      .from("salons")
      .select("id, name, slug, login_id, phone_number, owner_name, status, subscription_plan, subscription_expires_at, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const planPrices: Record<string, number> = {
      basic: 1999,
      pro: 3999,
      enterprise: 9999,
    };

    const formattedSubscriptions = (salons || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      loginId: s.login_id,
      phoneNumber: s.phone_number,
      ownerName: s.owner_name || s.name,
      status: s.status || "active",
      plan: s.subscription_plan || "pro",
      monthlyPrice: planPrices[s.subscription_plan || "pro"] || 3999,
      expiresAt: s.subscription_expires_at || new Date(Date.now() + 365 * 86400000).toISOString(),
      createdAt: s.created_at,
    }));

    const totalMRR = formattedSubscriptions.reduce(
      (acc, s) => acc + (s.status === "active" ? s.monthlyPrice : 0),
      0
    );

    const planCounts = {
      basic: formattedSubscriptions.filter((s) => s.plan === "basic").length,
      pro: formattedSubscriptions.filter((s) => s.plan === "pro").length,
      enterprise: formattedSubscriptions.filter((s) => s.plan === "enterprise").length,
    };

    return NextResponse.json({
      success: true,
      subscriptions: formattedSubscriptions,
      stats: {
        totalMRR,
        totalActive: formattedSubscriptions.filter((s) => s.status === "active").length,
        planCounts,
        arpu: formattedSubscriptions.length > 0 ? Math.round(totalMRR / formattedSubscriptions.length) : 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { salonId, subscription_plan, duration_months } = await req.json();

    if (!salonId || !subscription_plan) {
      return NextResponse.json({ error: "Salon ID and subscription plan are required" }, { status: 400 });
    }

    const months = Number(duration_months || 12);
    const newExpiresAt = new Date(Date.now() + months * 30 * 86400000).toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from("salons")
      .update({
        subscription_plan,
        subscription_expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", salonId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, salon: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update subscription" }, { status: 500 });
  }
}
