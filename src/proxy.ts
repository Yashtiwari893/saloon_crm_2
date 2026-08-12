import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "salon_saas_session";
const IMPERSONATE_COOKIE = "salon_saas_impersonate";

// Public routes that never need authentication
const PUBLIC_ROUTES = ["/login", "/admin/login"];

// Routes that require SUPER_ADMIN role
const ADMIN_PROTECTED_PREFIX = "/admin";

// Routes that require any authenticated salon user (SALON_ADMIN or SALON_STAFF)
const SALON_PROTECTED_PREFIXES = [
  "/bookings",
  "/customers",
  "/barbers",
  "/services",
  "/analytics",
  "/settings",
  "/whatsapp",
  "/chat",
  "/files",
  "/ocr",
  "/stt",
];

function decodeSession(token: string): { role?: string; salonId?: string } | null {
  try {
    let jsonStr = "";
    if (typeof atob !== "undefined") {
      jsonStr = atob(token);
    } else {
      jsonStr = Buffer.from(token, "base64").toString("utf-8");
    }
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API routes and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Read session cookies
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const impersonateToken = req.cookies.get(IMPERSONATE_COOKIE)?.value;

  const mainSession = sessionToken ? decodeSession(sessionToken) : null;
  const impSession =
    mainSession?.role === "SUPER_ADMIN" && impersonateToken
      ? decodeSession(impersonateToken)
      : null;

  const session = impSession || mainSession;
  const role = session?.role;

  // --- PUBLIC ROUTES: always allow ---
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If authenticated SUPER_ADMIN visits /admin/login → redirect to dashboard
    if (pathname === "/admin/login" && role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // If authenticated salon user visits /login → redirect to salon dashboard
    if (pathname === "/login" && (role === "SALON_ADMIN" || role === "SALON_STAFF")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // --- ADMIN PROTECTED ROUTES: /admin/* (except /admin/login) ---
  if (pathname.startsWith(ADMIN_PROTECTED_PREFIX)) {
    if (!session) {
      // Not authenticated → go to admin login
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "SUPER_ADMIN") {
      // Salon user trying to access admin → redirect to salon dashboard
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // --- SALON PROTECTED ROUTES ---
  const isSalonProtected = SALON_PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  // Also protect root salon dashboard
  const isRootDashboard = pathname === "/";

  if (isSalonProtected || isRootDashboard) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // SUPER_ADMIN impersonating a salon is allowed (impersonate cookie sets salonId)
    if (role === "SUPER_ADMIN" && !impersonateToken) {
      // Super admin visiting salon routes without impersonation → go to admin dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
