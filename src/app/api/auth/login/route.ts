import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticateCredentials } from "@/lib/authSession";

export async function POST(req: Request) {
  try {
    const { login_id, password } = await req.json();

    if (!login_id || !password) {
      return NextResponse.json(
        { error: "Login ID and password are required" },
        { status: 400 }
      );
    }

    const result = await authenticateCredentials(login_id, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Authentication failed" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl: result.user.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/",
    });
  } catch (err: any) {
    console.error("[LOGIN ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Login error" },
      { status: 500 }
    );
  }
}
