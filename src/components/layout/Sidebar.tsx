"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCheck,
  Scissors,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [salonName, setSalonName] = useState<string>("Velvet Cut");

  useEffect(() => {
    async function loadSalonInfo() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            const name = data.salon?.name || data.user?.name || "Velvet Cut";
            setSalonName(name);
          }
        }
      } catch (e) {
        console.error("Failed to load sidebar salon info:", e);
      }
    }
    loadSalonInfo();
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Bookings & Calendar", href: "/bookings", icon: CalendarDays, badge: "8" },
    { label: "Customers CRM", href: "/customers", icon: Users },
    { label: "Barbers & Staff", href: "/barbers", icon: UserCheck },
    { label: "Services Catalog", href: "/services", icon: Scissors },
    { label: "WhatsApp Inbox", href: "/whatsapp", icon: MessageSquare, badge: "Live" },
    { label: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
    { label: "Salon Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`relative border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 flex flex-col z-30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1 truncate">
                <span className="truncate">{salonName}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              </span>
              <span className="text-[10px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                WhatsApp Bot Active
              </span>
            </div>
          )}
        </Link>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-rose-500 dark:text-white shadow-md shadow-slate-900/10 dark:shadow-rose-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-amber-400 dark:text-white" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`} />
              
              {!collapsed && <span className="truncate">{item.label}</span>}

              {!collapsed && item.badge && (
                <span
                  className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    item.badge === "Live"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Banner */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:from-slate-900 dark:to-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-amber-400">11za WhatsApp API</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-3">
            Real-time NLU Chatbot active. 100% automated bookings enabled.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
            <span>Quota: 8,450 / 10k</span>
            <span className="text-emerald-400 font-semibold">99.8% Uptime</span>
          </div>
        </div>
      )}
    </aside>
  );
}
