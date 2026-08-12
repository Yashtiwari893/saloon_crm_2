"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  IndianRupee,
  Users,
  Clock,
  UserCheck,
  TrendingUp,
  Scissors,
  ChevronRight,
  MessageSquare,
  Plus,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  getLiveBookings,
  getLiveBarbers,
  fetchSalonAnalytics,
} from "@/lib/salonStore";
import { SalonAnalytics, Booking, Barber } from "@/types/salon";

export default function SalonDashboardPage() {
  const [analytics, setAnalytics] = useState<SalonAnalytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveData() {
      const [analyticsData, bookingsData, barbersData] = await Promise.all([
        fetchSalonAnalytics(),
        getLiveBookings(),
        getLiveBarbers(),
      ]);
      setAnalytics(analyticsData);
      setBookings(bookingsData);
      setBarbers(barbersData);
      setLoading(false);
    }
    loadLiveData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading workspace analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header (Stripe / Linear Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              WhatsApp Automation Active
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xl">
            Overview of live bookings, today's revenue, active stylist stations, and customer CRM profiles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/whatsapp"
            className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>WhatsApp Inbox</span>
          </a>
          <a
            href="/bookings"
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            <span>New Booking</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid (Standardized 14px Radius & Semantic Color Hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Revenue</span>
            <div className="w-9 h-9 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">₹{analytics.todayRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real POS & WhatsApp Sales</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Bookings */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Bookings</span>
            <div className="w-9 h-9 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{analytics.todayBookingsCount} Appointments</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{analytics.todayBookingsCount} Scheduled</span>
              <span>•</span>
              <span>Live Queue</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Staff On Duty */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Staff On Duty</span>
            <div className="w-9 h-9 rounded-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{analytics.activeBarbersCount} / {barbers.length} Active</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span>Active Stylists Station</span>
            </div>
          </div>
        </div>

        {/* KPI 4: CRM Customers */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Customers CRM</span>
            <div className="w-9 h-9 rounded-[10px] bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{analytics.activeCustomersCount} Clients</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-sky-600 dark:text-sky-400">
              <span>WhatsApp Profile Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Staff Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Today's Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time appointments created via WhatsApp or manual walk-ins</p>
              </div>

              <a
                href="/bookings"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Bookings List or Clean Empty State */}
            {bookings.length === 0 ? (
              <div className="py-12 px-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Appointments Scheduled Today</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    When clients book on WhatsApp or walk-in, real appointments will appear here instantly.
                  </p>
                </div>
                <a
                  href="/bookings"
                  className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> New Booking
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-sm">
                        {b.startTime}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.customerName}</h4>
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md ${
                              b.status === "confirmed"
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                : b.status === "in_progress"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                                : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                            }`}
                          >
                            {b.status === "in_progress" ? "In Chair" : b.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Services:{" "}
                          <span className="font-semibold">
                            {(b.services ?? []).map((s) => s.serviceName).join(", ") || b.serviceName || "Haircut"}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>Stylist: <strong className="text-slate-700 dark:text-slate-200">{b.barberName}</strong></span>
                          <span>•</span>
                          <span>{b.totalDurationMinutes} mins</span>
                          <span>•</span>
                          <span className="font-mono">{b.bookingCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-200 dark:border-slate-700/60 pt-2 sm:pt-0">
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{b.totalPrice}</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">{b.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Staff Status */}
        <div className="space-y-4">
          <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                Staff Status
              </h3>
              <a href="/barbers" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700">
                Manage
              </a>
            </div>

            {barbers.length === 0 ? (
              <div className="py-8 px-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">No staff onboarded yet.</p>
                <a
                  href="/barbers"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  <Plus className="w-4 h-4" /> Onboard Staff
                </a>
              </div>
            ) : (
              <div className="space-y-2.5">
                {barbers.map((b) => (
                  <div key={b.id} className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={b.avatarUrl} alt="" className="w-9 h-9 rounded-[8px] object-cover border border-slate-200 dark:border-slate-700" />
                      <div>
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{b.name}</h5>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{b.experienceYears} yrs exp</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase ${
                        b.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                          : b.status === "on_break"
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {b.status === "active" ? "On Duty" : b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
