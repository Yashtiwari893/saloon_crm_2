import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("*, salons(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedUsers = (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      loginId: u.login_id,
      name: u.name,
      role: u.role,
      status: u.status || "active",
      salonId: u.salon_id,
      salonName: u.salons?.name || (u.role === "SUPER_ADMIN" ? "Platform Control" : "Unassigned"),
      lastLoginAt: u.last_login_at || u.created_at,
      createdAt: u.created_at,
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { name, email, login_id, password, role, salon_id } = await req.json();

    if (!name || !login_id || !password || !email) {
      return NextResponse.json({ error: "Name, Email, Login ID, and Password are required" }, { status: 400 });
    }

    const cleanId = login_id.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        email: cleanEmail,
        login_id: cleanId,
        password_hash: password,
        role: role || "SALON_ADMIN",
        salon_id: salon_id || null,
        status: "active",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { userId, status, password, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateFields: any = { updated_at: new Date().toISOString() };
    if (status) updateFields.status = status;
    if (role) updateFields.role = role;
    if (password) updateFields.password_hash = password;

    const { data: updated, error } = await supabaseAdmin
      .from("users")
      .update(updateFields)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
