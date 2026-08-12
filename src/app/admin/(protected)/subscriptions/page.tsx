"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Building2,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  IndianRupee,
  Activity,
  Edit3,
  X,
  Calendar,
  Check
} from "lucide-react";
import { FEATURE_MANIFEST, DEFAULT_PLAN_FEATURES, FeatureKey } from "@/lib/features";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState<any | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState("pro");
  const [durationMonths, setDurationMonths] = useState("12");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  async function handleUpdatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSalon) return;
    setIsUpdating(true);
    setToastMsg(null);

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: selectedSalon.id,
          subscription_plan: newPlan,
          duration_months: parseInt(durationMonths, 10) || 12,
        }),
      });
      const data = await res.json();
      setIsUpdating(false);

      if (data.success) {
        setShowPlanModal(false);
        setToastMsg(`Plan updated to ${newPlan.toUpperCase()} for ${selectedSalon.name}!`);
        fetchSubscriptions();
      } else {
        alert(data.error || "Failed to update subscription plan.");
      }
    } catch (e) {
      setIsUpdating(false);
      alert("Error connecting to server.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading subscription financials...</span>
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
              Financial Billing
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MRR Engine Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Subscriptions & Revenue Billing</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor Monthly Recurring Revenue (MRR), subscription plans, and tenant billing renewals.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Financials</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {toastMsg}
          </span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Platform MRR</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">₹{(stats.totalMRR || 0).toLocaleString()}</div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Monthly Revenue</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Subscribers</span>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight font-mono">{stats.totalActive || 0} Salons</div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Paying Tenants</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">ARPU (Avg / Salon)</span>
          <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 tracking-tight font-mono">₹{(stats.arpu || 0).toLocaleString()}</div>
          <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Per Salon Yield</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pro Tier Ratio</span>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight font-mono">
            {stats.planCounts?.pro || 0} / {subscriptions.length}
          </div>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">High Yield Tenants</span>
        </div>
      </div>

      {/* Subscription Directory Table */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Salon Subscription Directory
        </h3>

        <div className="overflow-x-auto rounded-[10px] border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Salon Tenant</th>
                <th className="py-3 px-4">Login ID</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No subscriptions registered.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const currentPlan = sub.plan || sub.subscription_plan || "pro";
                  const loginId = sub.loginId || sub.login_id || "N/A";
                  const monthlyRate = sub.monthlyPrice || (currentPlan === "basic" ? 1999 : currentPlan === "enterprise" ? 9999 : 3999);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{sub.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 font-semibold">{loginId}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          currentPlan === "basic"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            : currentPlan === "enterprise"
                            ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                        }`}>
                          {currentPlan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{monthlyRate.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSalon(sub);
                            setNewPlan(currentPlan);
                            setDurationMonths("12");
                            setShowPlanModal(true);
                          }}
                          className="px-3 py-1.5 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 ml-auto shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Change Plan</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHANGE PLAN MODAL */}
      {showPlanModal && selectedSalon && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Change Subscription Plan</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tenant: <strong className="text-slate-900 dark:text-white">{selectedSalon.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Plan Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "basic", label: "BASIC", price: "₹1,999/mo" },
                    { id: "pro", label: "PRO", price: "₹3,999/mo" },
                    { id: "enterprise", label: "ENTERPRISE", price: "₹9,999/mo" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNewPlan(p.id)}
                      className={`p-3 rounded-[10px] text-center border transition flex flex-col items-center justify-center ${
                        newPlan === p.id
                          ? "bg-blue-50 dark:bg-blue-500/10 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <span className="text-xs">{p.label}</span>
                      <span className="text-[10px] font-mono mt-0.5 text-slate-500 dark:text-slate-400">{p.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Matrix Preview for Selected Plan */}
              <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Included Plan Features ({newPlan.toUpperCase()})
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {(Object.keys(FEATURE_MANIFEST) as FeatureKey[]).map((fKey) => {
                    const planFeatures = DEFAULT_PLAN_FEATURES[newPlan] || DEFAULT_PLAN_FEATURES.pro;
                    const isIncluded = planFeatures.includes(fKey);
                    const meta = FEATURE_MANIFEST[fKey];
                    return (
                      <div
                        key={fKey}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-[6px] ${
                          isIncluded
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-semibold"
                            : "text-slate-400 dark:text-slate-500 line-through opacity-60"
                        }`}
                      >
                        <span className="text-[10px]">{isIncluded ? "✓" : "✕"}</span>
                        <span className="truncate">{meta.label.split("&")[0].split("Photo")[0].trim()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Validity Duration</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                >
                  <option value="1">1 Month Extension</option>
                  <option value="3">3 Months Extension</option>
                  <option value="6">6 Months Extension</option>
                  <option value="12">12 Months (1 Year Full Access)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="h-11 px-5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <span>Updating Plan...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Plan Change</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
