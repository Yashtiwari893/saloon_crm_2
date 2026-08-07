"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Calendar,
  Users,
  Scissors,
  Clock,
  Sparkles
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-500" />
            Salon Analytics & Business Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Revenue growth, peak booking hours, staff efficiency & service performance
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Month Total: ₹84,500
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400">Total Bookings Executed</span>
          <div className="text-3xl font-black text-white">148</div>
          <p className="text-[11px] text-emerald-400 font-semibold">+24% growth this month</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400">Average Ticket Size</span>
          <div className="text-3xl font-black text-emerald-400">₹570</div>
          <p className="text-[11px] text-slate-400 font-semibold">Haircut + Beard combos lead</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400">WhatsApp Conversion Rate</span>
          <div className="text-3xl font-black text-amber-400">92.4%</div>
          <p className="text-[11px] text-emerald-400 font-semibold">Automated AI NLU Booking</p>
        </div>
      </div>
    </div>
  );
}
