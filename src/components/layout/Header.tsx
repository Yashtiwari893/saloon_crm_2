"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Store,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  MessageSquare,
  LogOut,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { getLiveNotifications } from "@/lib/salonStore";
import { DashboardNotification } from "@/types/salon";

export function Header() {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [salonInfo, setSalonInfo] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getLiveNotifications();
      setNotifications(data);

      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userRes = await res.json();
          if (userRes.authenticated) {
            setSessionUser(userRes.user);
            setSalonInfo(userRes.salon);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleExitImpersonation() {
    await fetch("/api/admin/impersonate", { method: "DELETE" });
    router.push("/admin/dashboard");
    router.refresh();
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      {/* Impersonation Banner if active */}
      {sessionUser?.isImpersonating && (
        <div className="bg-amber-500 text-slate-950 px-6 py-1.5 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>SUPER ADMIN IMPERSONATION MODE: Viewing as <strong>{sessionUser.name}</strong></span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="bg-slate-950 text-white px-2.5 py-0.5 rounded-[6px] text-xs font-semibold hover:bg-slate-800 transition"
          >
            Exit Impersonation ➔
          </button>
        </div>
      )}

      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
        {/* Global Search Bar (Height 48px / h-12) */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search booking code, customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-12 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Active Salon Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{salonInfo?.name || sessionUser?.name || "Inwante CRM"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          {/* Super Admin Dashboard Quick Link */}
          {sessionUser?.role === "SUPER_ADMIN" && (
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin</span>
            </button>
          )}

          {/* Theme Toggle (Light / Dark Switcher) */}
          <ThemeToggle />

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition relative flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Live Activity Feed</h4>
                  </div>
                  <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                        {n.type === "booking" ? (
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        ) : n.type === "alert" ? (
                          <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.createdAt}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
}
