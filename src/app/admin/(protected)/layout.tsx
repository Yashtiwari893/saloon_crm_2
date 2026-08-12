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
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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
        relative flex flex-col min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transition-all duration-200 ease-in-out flex-shrink-0 z-30
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">Super Admin</span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">Master Console</span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"}
              `}
            >
              <Icon
                className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`}
                style={{ width: "20px", height: "20px" }}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link
          href="/"
          title={collapsed ? "Salon Portal" : undefined}
          className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
        >
          <Globe className="w-4 h-4 shrink-0 text-slate-400" />
          {!collapsed && <span className="truncate">Salon Dashboard</span>}
        </Link>
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
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

  if (!authChecked || !authorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Verifying admin credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <AdminSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Super Admin</span>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">Master Control Panel</span>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-semibold text-[10px] uppercase">
              Multi-Tenant Engine
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Platform Operational
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
