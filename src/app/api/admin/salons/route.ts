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

    const { data: salons, error } = await supabaseAdmin
      .from("salons")
      .select("*, customers(count), bookings(count), barbers(count)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedSalons = (salons || []).map((s: any) => ({
      ...s,
      customer_count: s.customers?.[0]?.count || 0,
      booking_count: s.bookings?.[0]?.count || 0,
      barber_count: s.barbers?.[0]?.count || 0,
    }));

    return NextResponse.json({ success: true, salons: formattedSalons });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch salons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { name, login_id, password, phone_number, owner_name, owner_phone, subscription_plan } = body;

    if (!name || !login_id || !password || !phone_number) {
      return NextResponse.json(
        { error: "Salon Name, Login ID, Password, and Phone Number are required" },
        { status: 400 }
      );
    }

    const cleanId = login_id.trim().toLowerCase();
    const cleanPhone = normalizePhoneNumber(phone_number);
    const cleanOwnerPhone = normalizePhoneNumber(owner_phone || phone_number);

    if (!cleanPhone) {
      return NextResponse.json({ error: "Invalid phone number provided" }, { status: 400 });
    }

    // 1. Strict Duplicate Phone Check across salons & phone_document_mapping
    const [existingSalon, existingMapping] = await Promise.all([
      supabaseAdmin.from("salons").select("id, name").eq("phone_number", cleanPhone).maybeSingle(),
      supabaseAdmin.from("phone_document_mapping").select("id, salon_id").eq("phone_number", cleanPhone).maybeSingle(),
    ]);

    if (existingSalon.data || existingMapping.data) {
      const existingName = existingSalon.data?.name ? ` (${existingSalon.data.name})` : "";
      return NextResponse.json(
        { error: `This WhatsApp/Phone number (+${cleanPhone}) is already registered with a salon${existingName}. Please use a different number or contact Super Admin.` },
        { status: 400 }
      );
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    let cleanSlug = `${baseSlug}-${cleanId}`;

    // 2. Create Salon Record
    let newSalon: any = null;

    const fullPayload = {
      name,
      slug: cleanSlug,
      login_id: cleanId,
      password_hash: password,
      phone_number: cleanPhone,
      owner_name: owner_name || name,
      owner_phone: cleanOwnerPhone,
      whatsapp_origin: "https://api.11za.in",
      status: "active",
      subscription_plan: subscription_plan || "pro",
    };

    let { data: resData, error: salonErr } = await supabaseAdmin
      .from("salons")
      .insert(fullPayload)
      .select("*")
      .single();

    if (salonErr && (salonErr.code === "23505" || salonErr.message.includes("salons_slug_key"))) {
      cleanSlug = `${baseSlug}-${cleanId}-${Date.now().toString(36)}`;
      fullPayload.slug = cleanSlug;
      const retry = await supabaseAdmin
        .from("salons")
        .insert(fullPayload)
        .select("*")
        .single();
      resData = retry.data;
      salonErr = retry.error;
    }

    if (!salonErr && resData) {
      newSalon = resData;
    } else {
      // Fallback: Insert using core columns only
      const corePayload = {
        name,
        slug: cleanSlug,
        phone_number: cleanPhone,
        whatsapp_origin: "https://api.11za.in",
      };

      const { data: coreData, error: coreErr } = await supabaseAdmin
        .from("salons")
        .insert(corePayload)
        .select("*")
        .single();

      if (coreErr || !coreData) {
        if (coreErr?.code === "23505" || salonErr?.code === "23505") {
          return NextResponse.json({ error: "A salon with this Login ID or Phone Number already exists. Please enter a unique Login ID or Phone Number." }, { status: 400 });
        }
        return NextResponse.json({ error: coreErr?.message || salonErr?.message || "Failed to create salon record" }, { status: 400 });
      }

      newSalon = coreData;
    }

    // 3. Create Salon Admin User Record
    await supabaseAdmin.from("users").insert({
      salon_id: newSalon.id,
      email: `${cleanId}@salon.internal`,
      login_id: cleanId,
      password_hash: password,
      name: owner_name || `${name} Admin`,
      role: "SALON_ADMIN",
      status: "active",
    });

    // 4. Initialize Phone Mapping Placeholder for WhatsApp Integration
    await supabaseAdmin.from("phone_document_mapping").upsert({
      salon_id: newSalon.id,
      phone_number: cleanPhone,
      origin: "https://api.11za.in",
      auth_token: "demo-token",
      webhook_enabled: true,
    }, { onConflict: "phone_number" });

    // 5. Initialize Default Services Catalog for New Salon
    await supabaseAdmin.from("services").insert([
      { salon_id: newSalon.id, name: "Haircut & Styling", category: "Hair", duration_minutes: 30, price: 250, is_popular: true },
      { salon_id: newSalon.id, name: "Beard Trim & Styling", category: "Beard", duration_minutes: 20, price: 150, is_popular: true },
      { salon_id: newSalon.id, name: "Royal Haircut + Beard Combo", category: "Combo", duration_minutes: 45, price: 350, is_popular: true },
      { salon_id: newSalon.id, name: "Facial & Head Spa Massage", category: "Spa", duration_minutes: 60, price: 499, is_popular: false },
    ]);

    // 6. Initialize Default Barbers
    await supabaseAdmin.from("barbers").insert([
      { salon_id: newSalon.id, name: "Rahul Sharma", experience_years: 4.5, rating: 4.9, status: "active" },
      { salon_id: newSalon.id, name: "Sameer Khan", experience_years: 3.0, rating: 4.8, status: "active" },
    ]);

    return NextResponse.json({ success: true, salon: newSalon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create salon" }, { status: 500 });
  }
}
