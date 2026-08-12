import { NextResponse } from "next/server";
import { clearAuthSessionCookie } from "@/lib/authSession";

export async function POST() {
  await clearAuthSessionCookie();
  return NextResponse.json({ success: true, redirectUrl: "/login" });
}

export async function GET(req: Request) {
  await clearAuthSessionCookie();
  const url = new URL("/login", req.url);
  return NextResponse.redirect(url);
}
