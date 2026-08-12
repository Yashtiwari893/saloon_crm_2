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

    const { data: services, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, services: services || [] });
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

    const { name, category, description, duration_minutes, price, gender, is_active } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Service name and price are required" }, { status: 400 });
    }

    const { data: newService, error } = await supabaseAdmin
      .from("services")
      .insert({
        salon_id: salonId,
        name,
        category: category || "Hair",
        description: description || "",
        duration_minutes: Number(duration_minutes || 30),
        price: Number(price),
        gender: gender || "unisex",
        is_active: is_active ?? true,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, service: newService });
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
    const { serviceId, ...updateFields } = body;

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("services")
      .update({
        ...updateFields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId)
      .eq("salon_id", salonId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, service: updated });
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
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("salon_id", salonId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
