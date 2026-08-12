"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  Building2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Edit3,
  SlidersHorizontal,
} from "lucide-react";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalMRR: 0, totalActive: 0, arpu: 0, planCounts: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("all");
  const [selectedSalonForChange, setSelectedSalonForChange] = useState<any | null>(null);
  const [newPlan, setNewPlan] = useState("pro");
  const [durationMonths, setDurationMonths] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateSubscription(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSalonForChange) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: selectedSalonForChange.id,
          subscription_plan: newPlan,
          duration_months: durationMonths,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setSelectedSalonForChange(null);
        fetchSubscriptions();
      }
    } catch (e) {
      setIsSubmitting(false);
    }
  }

  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.loginId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = selectedPlanFilter === "all" || s.plan === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>Subscriptions & Revenue Billing</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor Monthly Recurring Revenue (MRR), subscription plans, and tenant billing renewals
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Financials</span>
        </button>
      </div>

      {/* Financial Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Platform MRR</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{(stats.totalMRR || 0).toLocaleString()}</h3>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Active Monthly Revenue</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Subscribers</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.totalActive || 0} Salons</h3>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Paying Tenants</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ARPU (Avg / Salon)</p>
            <h3 className="text-2xl font-black text-purple-400 mt-1">₹{(stats.arpu || 0).toLocaleString()}</h3>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Per Salon Yield</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pro Tier Ratio</p>
            <h3 className="text-2xl font-black text-cyan-400 mt-1">
              {stats.planCounts?.pro || 0} / {subscriptions.length}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">High Yield Tenants</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Subscription Tier Packages Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Starter Tier</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Basic Salon</h3>
            </div>
            <span className="text-xl font-extrabold text-amber-400">₹1,999<span className="text-xs text-slate-500 font-normal">/mo</span></span>
          </div>
          <p className="text-xs text-slate-400">Essential WhatsApp booking & schedule management for boutique salons.</p>
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Up to 2 Barbers</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>500 WhatsApp Messages / Mo</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Basic CRM & Calendar</span></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4 shadow-xl relative">
          <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
            Most Popular
          </span>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Growth Tier</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Pro Salon</h3>
            </div>
            <span className="text-xl font-extrabold text-amber-400">₹3,999<span className="text-xs text-slate-500 font-normal">/mo</span></span>
          </div>
          <p className="text-xs text-slate-400">Complete AI NLU chatbot, automated WhatsApp reminders & staff management.</p>
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /><span>Unlimited Barbers & Staff</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /><span>Unlimited WhatsApp Automation</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /><span>Real-time AI NLU Chatbot</span></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Custom Tier</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Enterprise</h3>
            </div>
            <span className="text-xl font-extrabold text-purple-400">Custom</span>
          </div>
          <p className="text-xs text-slate-400">Multi-location salon chains with custom WhatsApp gateway & dedicated SLA.</p>
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /><span>Multi-Location Chain Support</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /><span>Dedicated Database Node</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /><span>Custom API & SLA Guarantee</span></div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <span>Salon Subscription Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
              {filteredSubscriptions.length} entries
            </span>
          </h2>

          <div className="flex items-center gap-3">
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic Plan</option>
              <option value="pro">Pro Plan</option>
              <option value="enterprise">Enterprise Plan</option>
            </select>

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant name or ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Loading subscription records...</span>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No subscriptions found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Salon Tenant</th>
                  <th className="py-3 px-4">Login ID</th>
                  <th className="py-3 px-4">Current Plan</th>
                  <th className="py-3 px-4">Monthly Rate</th>
                  <th className="py-3 px-4">Renews / Expires At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div>{s.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{s.ownerName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        {s.loginId}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold uppercase text-amber-400">
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      ₹{s.monthlyPrice.toLocaleString()}/mo
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {new Date(s.expiresAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4">
                      {s.status === "active" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSalonForChange(s);
                          setNewPlan(s.plan);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Manage Plan</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Plan Modal */}
      {selectedSalonForChange && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Update Plan: {selectedSalonForChange.name}</span>
              </h3>
              <button
                onClick={() => setSelectedSalonForChange(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Select Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="basic">Basic Plan (₹1,999/mo)</option>
                  <option value="pro">Pro Plan (₹3,999/mo)</option>
                  <option value="enterprise">Enterprise Plan (Custom)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Duration</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value={1}>1 Month Extension</option>
                  <option value={6}>6 Months Extension</option>
                  <option value={12}>12 Months (1 Year) Extension</option>
                  <option value={24}>24 Months (2 Years) Extension</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSalonForChange(null)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
