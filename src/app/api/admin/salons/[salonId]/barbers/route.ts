import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { salonId } = await params;

    const { data: barbers, error } = await supabaseAdmin
      .from("barbers")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, barbers: barbers || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const body = await req.json();

    const { name, phone_number, specialization, experience_years, rating, is_on_duty, is_active } = body;

    if (!name) {
      return NextResponse.json({ error: "Barber name is required" }, { status: 400 });
    }

    const { data: newBarber, error } = await supabaseAdmin
      .from("barbers")
      .insert({
        salon_id: salonId,
        name,
        phone_number: phone_number || null,
        specialization: specialization || "Hair Stylist",
        experience_years: Number(experience_years || 2),
        rating: Number(rating || 4.8),
        is_on_duty: is_on_duty ?? true,
        is_active: is_active ?? true,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, barber: newBarber });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { salonId } = await params;
    const body = await req.json();
    const { barberId, ...updateFields } = body;

    if (!barberId) {
      return NextResponse.json({ error: "Barber ID is required" }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("barbers")
      .update({
        ...updateFields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", barberId)
      .eq("salon_id", salonId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, barber: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { salonId } = await params;
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get("barberId");

    if (!barberId) {
      return NextResponse.json({ error: "Barber ID required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("barbers")
      .delete()
      .eq("id", barberId)
      .eq("salon_id", salonId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
