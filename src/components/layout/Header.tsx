"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  Store,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  MessageSquare
} from "lucide-react";
import { getLiveNotifications } from "@/lib/salonStore";
import { DashboardNotification } from "@/types/salon";

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);

  useEffect(() => {
    async function loadNotifs() {
      const data = await getLiveNotifications();
      setNotifications(data);
    }
    loadNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking code, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Active Salon Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Store className="w-3.5 h-3.5 text-rose-500" />
          <span>Velvet Cut & Style</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>

        {/* Quick Add Walk-in Booking Button */}
        <a
          href="/bookings"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Booking</span>
        </a>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Modal Popup */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Activity Notifications</span>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No notifications yet. New bookings will alert here.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-3 flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          n.type === "booking"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : n.type === "cancellation"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {n.type === "booking" ? (
                          <Calendar className="w-4 h-4" />
                        ) : n.type === "cancellation" ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Manager Avatar"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-rose-500/20"
          />
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">Anand Sharma</span>
            <span className="text-[10px] text-slate-400 font-medium">Salon Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
