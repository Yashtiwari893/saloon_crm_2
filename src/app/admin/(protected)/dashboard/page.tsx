"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Calendar,
  MessageSquare,
  Plus,
  Search,
  Eye,
  LogIn,
  TrendingUp,
  Activity,
  Zap,
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
      if (data.success) {
        setShowAddModal(false);
        setNewSalon({
          name: "",
          login_id: "",
          password: "",
          phone_number: "",
          owner_name: "",
          subscription_plan: "pro",
        });
        fetchSalons();
      } else {
        setActionError(data.message || "Failed to create salon");
      }
    } catch {
      setActionError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImpersonate(salonId: string) {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        alert(data.message || "Failed to impersonate salon");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to impersonate salon");
    }
  }

  const filteredSalons = salons.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.login_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone_number?.includes(searchQuery)
  );

  const totalSalons = salons.length;
  const totalCustomers = salons.reduce((sum, s) => sum + (s.total_customers || 0), 0);
  const totalBookings = salons.reduce((sum, s) => sum + (s.total_bookings || 0), 0);

  if (isLoading) {
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
      {/* Top Banner (Light / Dark B2B SaaS Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              Multi-Tenant Operations
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {salons.length} Active Salons
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xl">
            Centralized control center for salon provisioning, subscriptions, 11za WhatsApp API profit tracking, and tenant impersonation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Quick Salon</span>
          </button>
          <a
            href="/admin/salons/onboard"
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>9-Step Onboarding Wizard</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Salons */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Salons</span>
            <div className="w-9 h-9 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{totalSalons}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Tenant Accounts</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Customers */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Customers</span>
            <div className="w-9 h-9 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{totalCustomers.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Registered CRM Profiles</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Bookings */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Bookings</span>
            <div className="w-9 h-9 rounded-[10px] bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{totalBookings.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-sky-600 dark:text-sky-400">
              <span>Processed Appointments</span>
            </div>
          </div>
        </div>

        {/* KPI 4: 11za Profit Health */}
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">11za Profit Health</span>
            <div className="w-9 h-9 rounded-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">+68% Profit</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span>Single WABA Router Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salons Table Directory */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Registered Salons Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage onboarded tenant accounts and launch one-click admin impersonation</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, ID or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-[10px] border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Salon Info</th>
                <th className="py-3 px-4">Owner & Phone</th>
                <th className="py-3 px-4">Plan & Status</th>
                <th className="py-3 px-4">CRM Stats</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredSalons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No salons found matching your filter query.
                  </td>
                </tr>
              ) : (
                filteredSalons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{salon.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ID: {salon.login_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{salon.owner_name || "N/A"}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{salon.phone_number || "No Phone"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase">
                          {salon.subscription_plan || "pro"}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase ${
                            salon.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                              : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                          }`}
                        >
                          {salon.status || "active"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{salon.total_customers || 0} Clients</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{salon.total_bookings || 0} Bookings</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleImpersonate(salon.id)}
                          className="px-3 py-1.5 rounded-[8px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Login As</span>
                        </button>
                        <a
                          href={`/admin/salons/${salon.id}`}
                          className="px-3 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Quick Salon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Quick Add Salon
            </h3>

            {actionError && (
              <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateSalon} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Salon Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Akriti Saloon"
                  value={newSalon.name}
                  onChange={(e) => setNewSalon({ ...newSalon, name: e.target.value })}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Login ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. akriti_admin"
                    value={newSalon.login_id}
                    onChange={(e) => setNewSalon({ ...newSalon, login_id: e.target.value })}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newSalon.password}
                    onChange={(e) => setNewSalon({ ...newSalon, password: e.target.value })}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Yash Sharma"
                    value={newSalon.owner_name}
                    onChange={(e) => setNewSalon({ ...newSalon, owner_name: e.target.value })}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 919876543210"
                    value={newSalon.phone_number}
                    onChange={(e) => setNewSalon({ ...newSalon, phone_number: e.target.value })}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50"
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
