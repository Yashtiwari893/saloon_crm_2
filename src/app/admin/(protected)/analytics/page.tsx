"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  IndianRupee,
  Calendar,
  Users,
  Building2,
  TrendingUp,
  RefreshCw,
  Award,
} from "lucide-react";

export default function AnalyticsAdminPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading platform analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              Multi-Tenant Analytics
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Real-Time Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Platform-wide Revenue & Multi-Tenant Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time financial performance, booking volume, and tenant performance leaderboard.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gross Platform Revenue</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">₹{(data?.totalRevenue || 0).toLocaleString()}</div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Real Completed Bookings</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Appointments</span>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">{data?.totalBookingsCount || 0}</div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">WhatsApp & Walk-ins</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total CRM Clients</span>
          <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 tracking-tight">{data?.totalCustomersCount || 0}</div>
          <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Onboarded Profiles</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tenant Salons</span>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{data?.totalSalonsCount || 0}</div>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Active Multi-Tenants</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Top Performing Salons Leaderboard</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Ranked by Completed Revenue</span>
        </div>

        <div className="overflow-x-auto rounded-[10px] border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Rank & Salon</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4 text-center">Total Bookings</th>
                <th className="py-3 px-4 text-center">Total Clients</th>
                <th className="py-3 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {(!data?.salonPerformance || data.salonPerformance.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No salon performance data available yet.</td>
                </tr>
              ) : (
                data.salonPerformance.map((s: any, idx: number) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-slate-400 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}>
                        #{idx + 1}
                      </span>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase">
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-slate-100">{s.bookingsCount}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-slate-100">{s.customersCount}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">₹{s.revenue.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
