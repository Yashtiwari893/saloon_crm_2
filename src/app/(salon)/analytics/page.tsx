"use client";

import React, { useState, useEffect } from "react";
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
import { FeatureGate } from "@/lib/features";

export default function AnalyticsPage() {
  const [salonData, setSalonData] = useState<any>(null);

  useEffect(() => {
    async function loadSalonData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setSalonData(data.salon || null);
          }
        }
      } catch (e) {
        console.error("Failed to load salon info:", e);
      }
    }
    loadSalonData();
  }, []);

  return (
    <FeatureGate feature="analytics_insights" salon={salonData}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
                Business Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Salon Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Revenue growth, peak booking hours, staff efficiency & service performance
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <IndianRupee className="w-4 h-4" />
            Month Total: ₹84,500
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Bookings</span>
              <div className="w-9 h-9 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">148</div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+24% growth this month</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg. Ticket Size</span>
              <div className="w-9 h-9 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">₹570</div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Haircut + Beard combos lead</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">WhatsApp Conversion</span>
              <div className="w-9 h-9 rounded-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">92.4%</div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Automated AI NLU Booking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for future charts */}
        <div className="p-8 rounded-[14px] bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Detailed Charts Coming Soon</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              Revenue trends, peak hour heatmaps, stylist performance comparisons, and service popularity charts will appear here.
            </p>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
