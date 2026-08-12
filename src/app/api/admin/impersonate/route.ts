import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, SessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const IMPERSONATE_COOKIE_NAME = "salon_saas_impersonate";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin role required." }, { status: 403 });
    }

    const { salon_id } = await req.json();

    const { data: targetSalon } = await supabaseAdmin
      .from("salons")
      .select("id, name, login_id")
      .eq("id", salon_id)
      .single();

    if (!targetSalon) {
      return NextResponse.json({ error: "Target salon not found" }, { status: 404 });
    }

    const impersonatedUser: SessionUser = {
      userId: targetSalon.id,
      email: `${targetSalon.login_id}@salon.internal`,
      loginId: targetSalon.login_id,
      name: targetSalon.name,
      role: "SALON_ADMIN",
      salonId: targetSalon.id,
      isImpersonating: true,
      originalAdminId: user.userId,
    };

    const cookieStore = await cookies();
    const token = Buffer.from(JSON.stringify(impersonatedUser), "utf-8").toString("base64");

    cookieStore.set(IMPERSONATE_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 Hours
    });

    return NextResponse.json({
      success: true,
      salonName: targetSalon.name,
      redirectUrl: "/",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE_NAME);
  return NextResponse.json({ success: true, redirectUrl: "/admin/dashboard" });
}
