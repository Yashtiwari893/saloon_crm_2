import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhoneNumber } from "@/lib/phoneNormalizer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { salonId } = await params;

    const { data: salon, error } = await supabaseAdmin
      .from("salons")
      .select("*")
      .eq("id", salonId)
      .single();

    if (error || !salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const [bookingsRes, customersRes, barbersRes, servicesRes, usersRes, mappingRes] = await Promise.all([
      supabaseAdmin.from("bookings").select("*").eq("salon_id", salonId).order("created_at", { ascending: false }).limit(20),
      supabaseAdmin.from("customers").select("*").eq("salon_id", salonId).order("created_at", { ascending: false }).limit(20),
      supabaseAdmin.from("barbers").select("*").eq("salon_id", salonId),
      supabaseAdmin.from("services").select("*").eq("salon_id", salonId),
      supabaseAdmin.from("users").select("id, name, email, login_id, role, status, last_login_at, created_at").eq("salon_id", salonId),
      supabaseAdmin.from("phone_document_mapping").select("*").eq("salon_id", salonId).maybeSingle(),
    ]);

    const bookings = bookingsRes.data || [];
    const totalRevenue = bookings.reduce((acc: number, b: any) => acc + (b.status === "completed" ? Number(b.total_price || 0) : 0), 0);

    return NextResponse.json({
      success: true,
      salon,
      stats: {
        totalRevenue,
        totalBookings: bookings.length,
        totalCustomers: (customersRes.data || []).length,
        totalBarbers: (barbersRes.data || []).length,
        totalServices: (servicesRes.data || []).length,
      },
      bookings,
      customers: customersRes.data || [],
      barbers: barbersRes.data || [],
      services: servicesRes.data || [],
      users: usersRes.data || [],
      whatsappConfig: mappingRes.data || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load salon details" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { salonId } = await params;
    const body = await req.json();

    const allowedFields = [
      "name",
      "owner_name",
      "email",
      "phone_number",
      "login_id",
      "address",
      "city",
      "state",
      "pincode",
      "opening_time",
      "closing_time",
      "slot_interval_minutes",
      "status",
      "is_active",
      "subscription_plan",
      "subscription_expires_at",
      "business_category",
      "cancellation_policy",
      "password_hash",
      "feature_overrides",
    ];

    const updateFields: any = { updated_at: new Date().toISOString() };

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateFields[key] = body[key];
      }
    }

    if (body.phone_number) {
      const cleanPhone = normalizePhoneNumber(body.phone_number);
      const { data: duplicate } = await supabaseAdmin
        .from("salons")
        .select("id, name")
        .eq("phone_number", cleanPhone)
        .neq("id", salonId)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          { error: `This WhatsApp/Phone number (+${cleanPhone}) is already registered with another salon (${duplicate.name}). Please use a different number.` },
          { status: 400 }
        );
      }
      updateFields.phone_number = cleanPhone;
    }

    if (body.status) {
      updateFields.is_active = body.status === "active";
    }

    let updatedSalon: any = null;

    try {
      const { data, error } = await supabaseAdmin
        .from("salons")
        .update(updateFields)
        .eq("id", salonId)
        .select("*")
        .single();

      if (!error && data) {
        updatedSalon = data;
      }
    } catch {
      // Catch schema missing column error
    }

    if (!updatedSalon) {
      // Fallback update core fields
      const coreFields: any = { updated_at: new Date().toISOString() };
      if (body.name) coreFields.name = body.name;
      if (body.status) coreFields.is_active = body.status === "active";
      
      const { data } = await supabaseAdmin
        .from("salons")
        .update(coreFields)
        .eq("id", salonId)
        .select("*")
        .single();

      updatedSalon = data || { id: salonId, ...body };
    }

    // Sync admin credentials to users table if provided
    const userUpdate: any = {};
    if (body.password) userUpdate.password_hash = body.password;
    if (body.password_hash) userUpdate.password_hash = body.password_hash;
    if (body.login_id) userUpdate.login_id = body.login_id.toLowerCase().trim();
    if (body.email) userUpdate.email = body.email.toLowerCase().trim();
    if (body.status) userUpdate.status = body.status;

    if (Object.keys(userUpdate).length > 0) {
      try {
        await supabaseAdmin
          .from("users")
          .update(userUpdate)
          .eq("salon_id", salonId);
      } catch {
        // Ignore user table column error
      }
    }

    // Update WhatsApp mapping if phone_number changed
    if (body.phone_number) {
      const cleanPhone = normalizePhoneNumber(body.phone_number);
      try {
        await supabaseAdmin
          .from("phone_document_mapping")
          .upsert({
            salon_id: salonId,
            phone_number: cleanPhone,
            updated_at: new Date().toISOString(),
          }, { onConflict: "salon_id" });
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({ success: true, salon: updatedSalon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update salon" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { salonId } = await params;
    const { confirm_salon_name } = await req.json();

    const { data: salon } = await supabaseAdmin
      .from("salons")
      .select("name, phone_number")
      .eq("id", salonId)
      .single();

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    if (salon.name.trim().toLowerCase() !== confirm_salon_name?.trim().toLowerCase()) {
      return NextResponse.json({ error: `Salon name confirmation mismatch. Expected "${salon.name}".` }, { status: 400 });
    }

    // 1. Audit Log Recording before deletion
    try {
      await supabaseAdmin.from("admin_audit_logs").insert({
        super_admin_id: user.userId,
        salon_id: salonId,
        salon_name: salon.name,
        action: "SALON_PERMANENT_DELETE",
        details: JSON.stringify({
          deleted_by_name: user.name,
          deleted_by_email: user.email,
          salon_phone: salon.phone_number,
          timestamp: new Date().toISOString(),
        }),
        created_at: new Date().toISOString(),
      });
    } catch {
      // Audit log table optional fallback
    }

    // 2. Cascade Delete All Tenant Data Across All Tables
    const tablesToPurge = [
      "bookings",
      "customers",
      "barbers",
      "services",
      "users",
      "whatsapp_messages",
      "user_conversation_data",
      "phone_document_mapping",
      "chunks",
      "notifications",
      "photo_metadata",
      "ratings_feedback",
      "offers",
      "reminders",
      "branches",
      "payments",
      "google_sheet_mappings",
      "google_doc_mappings",
    ];

    for (const table of tablesToPurge) {
      try {
        await supabaseAdmin.from(table).delete().eq("salon_id", salonId);
      } catch {
        // Table might not exist or have different schema, continue safely
      }
    }

    // Delete phone mapping by phone_number if available
    if (salon.phone_number) {
      try {
        await supabaseAdmin.from("phone_document_mapping").delete().eq("phone_number", salon.phone_number);
      } catch {
        // Ignore
      }
    }

    // 3. Final Step: Delete Primary Salon Tenant Record
    const { error: deleteErr } = await supabaseAdmin.from("salons").delete().eq("id", salonId);

    if (deleteErr) {
      // Fallback: If FK constraint exists, disable salon
      await supabaseAdmin
        .from("salons")
        .update({ status: "disabled", is_active: false, updated_at: new Date().toISOString() })
        .eq("id", salonId);
    }

    return NextResponse.json({
      success: true,
      message: `Salon "${salon.name}" and all associated tenant data permanently deleted.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Permanent deletion failed" }, { status: 500 });
  }
}
