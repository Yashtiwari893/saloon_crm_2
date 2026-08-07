"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  IndianRupee,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  TrendingUp,
  Scissors,
  Sparkles,
  ArrowUpRight,
  MessageSquare,
  ChevronRight,
  Filter,
  BarChart3,
  Plus
} from "lucide-react";
import {
  getLiveBookings,
  getLiveBarbers,
  getLiveCustomers,
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
          <div className="w-9 h-9 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Connecting to Supabase Database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
              WhatsApp-First Salon SaaS
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              100% Real Live Database
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Salon Overview <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Live database analytics. As real clients message on WhatsApp or walk-in, real bookings & slot checks update here instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <a
            href="/whatsapp"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp Logs
          </a>
          <a
            href="/bookings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all"
          >
            <CalendarDays className="w-4 h-4" />
            View Calendar
          </a>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">₹{analytics.todayRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real Live Supabase Revenue</span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Bookings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.todayBookings} Appointments</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium">
              <span className="text-emerald-400 font-bold">{analytics.upcomingBookings} Upcoming</span>
              <span>•</span>
              <span>{analytics.cancelledBookings} Cancelled</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Barbers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Barbers On Duty</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.activeBarbersCount} / {barbers.length} Active</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400 font-medium">
              <span>Real Staff Profiles</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total CRM Customers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">WhatsApp Clients</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.totalCustomersCount} Onboarded</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-400 font-medium">
              <span>Real Supabase CRM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Today Schedule & Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  Live Today Schedule Timeline
                </h3>
                <p className="text-xs text-slate-400">Real appointments created via WhatsApp Webhook or Walk-ins</p>
              </div>

              <a
                href="/bookings"
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                Full Schedule <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Bookings List or Clean Empty State */}
            {bookings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Live Appointments Booked Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  When a client sends a message on WhatsApp or you create a walk-in booking, real appointments will appear here instantly!
                </p>
                <a
                  href="/bookings"
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md hover:bg-rose-600 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create First Booking
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {b.startTime}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{b.customerName}</h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              b.status === "confirmed"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : b.status === "in_progress"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                                : "bg-blue-500/15 text-blue-400"
                            }`}
                          >
                            {b.status === "in_progress" ? "In Chair" : b.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Services:{" "}
                          <span className="text-slate-200 font-medium">
                            {b.services.map((s) => s.serviceName).join(", ") || "Haircut"}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>Barber: <strong className="text-slate-300">{b.barberName}</strong></span>
                          <span>•</span>
                          <span>Duration: {b.totalDurationMinutes} mins</span>
                          <span>•</span>
                          <span>Code: {b.bookingCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0">
                      <div className="text-sm font-black text-emerald-400">₹{b.totalPrice}</div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{b.source} booking</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Barbers & Quick Setup */}
        <div className="space-y-6">
          {/* Active Barbers Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Salon Staff Status
              </h3>
              <a href="/barbers" className="text-xs font-bold text-rose-400 hover:text-rose-300">
                Manage
              </a>
            </div>

            {barbers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">No barber staff onboarded in database yet.</p>
                <a
                  href="/barbers"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Onboard Barber
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {barbers.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={b.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <h5 className="text-xs font-bold text-white">{b.name}</h5>
                        <span className="text-[10px] text-slate-400">{b.experienceYears} yrs exp</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        b.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : b.status === "on_break"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/15 text-rose-400"
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
