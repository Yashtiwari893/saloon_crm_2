"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Calendar,
  Users,
  Building2,
  RefreshCw,
  Award,
  Sparkles,
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
      const resData = await res.json();
      if (resData.success) {
        setData(resData.analytics || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Platform-wide Revenue & Multi-Tenant Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial performance, booking volume, and tenant performance leaderboard
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Gross Platform Revenue</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              ₹{(data?.totalRevenue || 0).toLocaleString()}
            </h3>
            <span className="text-[11px] text-slate-500">Real Completed Bookings</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total Appointments</span>
            <h3 className="text-2xl font-black text-white mt-1">{data?.totalBookingsCount || 0}</h3>
            <span className="text-[11px] text-slate-500">WhatsApp & Walk-ins</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total CRM Clients</span>
            <h3 className="text-2xl font-black text-cyan-400 mt-1">{data?.totalCustomersCount || 0}</h3>
            <span className="text-[11px] text-slate-500">Onboarded Profiles</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total Tenant Salons</span>
            <h3 className="text-2xl font-black text-purple-400 mt-1">{data?.totalSalonsCount || 0}</h3>
            <span className="text-[11px] text-slate-500">Active Multi-Tenants</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tenant Performance Leaderboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Top Performing Salons Leaderboard</span>
          </h2>
          <span className="text-xs text-slate-500">Ranked by Completed Revenue</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
            <span>Loading analytics leaderboard...</span>
          </div>
        ) : !data?.salonPerformance || data.salonPerformance.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No salon data available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rank & Salon</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4 text-center">Total Bookings</th>
                  <th className="py-3 px-4 text-center">Total Clients</th>
                  <th className="py-3 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.salonPerformance.map((s: any, idx: number) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 font-semibold text-white flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                        idx === 0 ? "bg-amber-500 text-slate-950" : idx === 1 ? "bg-slate-300 text-slate-950" : idx === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        #{idx + 1}
                      </span>
                      <span>{s.name}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                        {s.plan}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-white">
                      {s.bookingsCount}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-white">
                      {s.customersCount}
                    </td>

                    <td className="py-4 px-4 text-right font-black text-emerald-400 text-base">
                      ₹{s.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
