"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  MessageSquare,
  Bot,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Loader2,
} from "lucide-react";

const adminNavItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Salons", href: "/admin/salons", icon: Building2 },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Users & Access", href: "/admin/users", icon: Users },
  { label: "WhatsApp Accounts", href: "/admin/whatsapp", icon: MessageSquare },
  { label: "AI / RAG", href: "/admin/ai", icon: Bot },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "System Logs", href: "/admin/logs", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col min-h-screen bg-slate-900 border-r border-amber-500/10
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? "w-[68px]" : "w-[230px]"}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-amber-500/10 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xs font-black text-white leading-tight tracking-tight truncate">Super Admin</p>
            <p className="text-[10px] text-amber-400/80 font-semibold truncate">SaaS Control Center</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 relative z-10">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/10 text-amber-300 border border-amber-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"}
              `}
            >
              <Icon
                className={`flex-shrink-0 transition-colors ${isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"}`}
                style={{ width: "18px", height: "18px" }}
              />
              {!collapsed && <span className="truncate text-[13px]">{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-amber-500/10 space-y-1 relative z-10">
        <Link
          href="/login"
          title={collapsed ? "Salon Portal" : undefined}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all group"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">Salon Portal</span>}
        </Link>
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[72px] z-20 w-6 h-6 rounded-full bg-slate-800 border border-amber-500/30 text-amber-400 hover:bg-slate-700 transition-all flex items-center justify-center shadow-md"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        if (!data.authenticated || data.user?.role !== "SUPER_ADMIN") {
          router.replace("/admin/login");
          return;
        }
        setAuthorized(true);
      } catch {
        router.replace("/admin/login");
      } finally {
        setAuthChecked(true);
      }
    }
    verifySession();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  // Show blank screen while auth is being verified (no flash of protected content)
  if (!authChecked || !authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs text-slate-500">Verifying admin session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-slate-200">Super Admin Master Control</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">
              SaaS Central
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5" />
            <span>Multi-Tenant Platform</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950/70 p-6">{children}</main>
      </div>
    </div>
  );
}
