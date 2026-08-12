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
  Building2,
  Lock,
} from "lucide-react";
import { isFeatureEnabled, FeatureKey } from "@/lib/features";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [salonName, setSalonName] = useState<string>("Inwante CRM");
  const [salonData, setSalonData] = useState<any>(null);

  useEffect(() => {
    async function loadSalonInfo() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            const name = data.salon?.name || data.user?.name || "Inwante CRM";
            setSalonName(name);
            setSalonData(data.salon || null);
          }
        }
      } catch (e) {
        console.error("Failed to load sidebar salon info:", e);
      }
    }
    loadSalonInfo();
  }, []);

  const navItems: { label: string; href: string; icon: any; badge?: string; feature?: FeatureKey }[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Reception", href: "/reception", icon: Building2, badge: "Live" },
    { label: "Bookings", href: "/bookings", icon: CalendarDays, feature: "appointment_booking" },
    { label: "Stylists", href: "/barber-workspace", icon: Scissors, feature: "selfie_upload" },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Staff", href: "/barbers", icon: UserCheck },
    { label: "Services", href: "/services", icon: Scissors, feature: "custom_services" },
    { label: "WhatsApp Inbox", href: "/whatsapp", icon: MessageSquare, badge: "Live", feature: "reminders" },
    { label: "Analytics", href: "/analytics", icon: BarChart3, feature: "analytics_insights" },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`
        relative border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900
        transition-all duration-200 flex flex-col z-30 shrink-0
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Scissors className="w-5 h-5 stroke-[2]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                {salonName}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SaaS Engine
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
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
          const isLocked = item.feature && salonData ? !isFeatureEnabled(salonData, item.feature) : false;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] font-medium text-sm transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`} />
              
              {!collapsed && <span className="truncate">{item.label}</span>}

              {!collapsed && isLocked && (
                <span className="ml-auto p-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20" title="Plan Upgrade Required">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}

              {!collapsed && !isLocked && item.badge && (
                <span
                  className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-slate-800 text-xs font-medium rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
