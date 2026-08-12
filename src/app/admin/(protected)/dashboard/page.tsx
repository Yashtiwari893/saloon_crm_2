"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Calendar,
  MessageSquare,
  Bot,
  Plus,
  Search,
  Eye,
  LogIn,
  Power,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  Wifi,
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSalon, setNewSalon] = useState({
    name: "",
    login_id: "",
    password: "",
    phone_number: "",
    owner_name: "",
    subscription_plan: "pro",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalons();
  }, []);

  async function fetchSalons() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/salons");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSalons(data.salons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSalon(e: React.FormEvent) {
    e.preventDefault();
    if (!newSalon.password) {
      setActionError("Password is required");
      return;
    }
    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/salons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSalon),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setActionError(data.error || "Failed to create salon");
        return;
      }

      setShowAddModal(false);
      setNewSalon({ name: "", login_id: "", password: "", phone_number: "", owner_name: "", subscription_plan: "pro" });
      fetchSalons();
    } catch (err: any) {
      setIsSubmitting(false);
      setActionError("Failed to connect to server");
    }
  }

  async function handleToggleStatus(salonId: string, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await fetch(`/api/admin/salons/${salonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchSalons();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleImpersonate(salonId: string) {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salon_id: salonId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const filteredSalons = salons.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.login_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone_number?.includes(searchQuery)
  );

  const totalSalons = salons.length;
  const activeSalons = salons.filter((s) => s.status === "active").length;
  const inactiveSalons = totalSalons - activeSalons;
  const totalBookings = salons.reduce((acc, s) => acc + (s.booking_count || 0), 0);
  const totalCustomers = salons.reduce((acc, s) => acc + (s.customer_count || 0), 0);
  const whatsappConnected = salons.filter((s) => s.whatsapp_origin).length;

  const kpiCards = [
    { label: "Total Salons", value: totalSalons, icon: Building2, color: "purple", textColor: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
    { label: "Active Salons", value: activeSalons, icon: CheckCircle2, color: "emerald", textColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
    { label: "Inactive Salons", value: inactiveSalons, icon: XCircle, color: "red", textColor: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
    { label: "Total Clients", value: totalCustomers, icon: Users, color: "cyan", textColor: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20" },
    { label: "Total Bookings", value: totalBookings, icon: Calendar, color: "amber", textColor: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
    { label: "WhatsApp Connected", value: whatsappConnected, icon: Wifi, color: "green", textColor: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
    { label: "AI Chatbots Active", value: activeSalons, icon: Bot, color: "indigo", textColor: "text-indigo-400", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20" },
    { label: "Platform Health", value: "100%", icon: Activity, color: "teal", textColor: "text-teal-400", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time SaaS metrics across all tenants</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSalons}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Salon</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">{kpi.label}</p>
                <h3 className={`text-2xl font-extrabold mt-1 ${kpi.textColor}`}>{kpi.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${kpi.bgColor} ${kpi.borderColor} border`}>
                <Icon className={`w-5 h-5 ${kpi.textColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Salons Directory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Registered Salons Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
              {totalSalons} tenants
            </span>
          </h2>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search salon name or login ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading platform tenants...</span>
            </div>
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No salons found.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Create your first salon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Salon</th>
                  <th className="py-3 px-4">Login ID</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Bookings</th>
                  <th className="py-3 px-4 text-center">Clients</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSalons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-slate-800/30 transition group">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white text-sm">{salon.name}</div>
                      <div className="text-[11px] text-slate-500">{salon.owner_name || "—"}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg">
                        {salon.login_id}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300 text-xs">{salon.phone_number}</td>
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        {salon.subscription_plan || "pro"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {salon.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-white text-sm">{salon.booking_count ?? 0}</td>
                    <td className="py-4 px-4 text-center font-bold text-white text-sm">{salon.customer_count ?? 0}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleImpersonate(salon.id)}
                          title="Login as this Salon"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition inline-flex items-center gap-1"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Login as Salon</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(salon.id, salon.status)}
                          title={salon.status === "active" ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg border transition ${
                            salon.status === "active"
                              ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Salon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Onboard New Salon Tenant</span>
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setActionError(null); }}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateSalon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Salon Name *</label>
                <input
                  type="text"
                  required
                  value={newSalon.name}
                  onChange={(e) => setNewSalon({ ...newSalon, name: e.target.value })}
                  placeholder="e.g. ABC Hair Studio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Login ID *</label>
                  <input
                    type="text"
                    required
                    value={newSalon.login_id}
                    onChange={(e) => setNewSalon({ ...newSalon, login_id: e.target.value })}
                    placeholder="e.g. abc_hair"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none font-mono transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Password *</label>
                  <input
                    type="password"
                    required
                    value={newSalon.password}
                    onChange={(e) => setNewSalon({ ...newSalon, password: e.target.value })}
                    placeholder="Set a secure password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newSalon.phone_number}
                    onChange={(e) => setNewSalon({ ...newSalon, phone_number: e.target.value })}
                    placeholder="919819988776"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    value={newSalon.owner_name}
                    onChange={(e) => setNewSalon({ ...newSalon, owner_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Subscription Plan</label>
                <select
                  value={newSalon.subscription_plan}
                  onChange={(e) => setNewSalon({ ...newSalon, subscription_plan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none transition"
                >
                  <option value="basic">Basic (₹1,999/mo)</option>
                  <option value="pro">Pro (₹3,999/mo)</option>
                  <option value="enterprise">Enterprise (Custom)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setActionError(null); }}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Salon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
