import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const safeUser = {
    ...user,
    isImpersonating: user.role === "SUPER_ADMIN" && !!user.isImpersonating,
  };

  let salonData = null;
  if (safeUser.salonId) {
    const { data } = await supabaseAdmin
      .from("salons")
      .select("id, name, logo_url, status, subscription_plan")
      .eq("id", safeUser.salonId)
      .maybeSingle();

    salonData = data;
  }

  return NextResponse.json({
    authenticated: true,
    user: safeUser,
    salon: salonData,
  });
}
