"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPhoneDisplay, normalizePhoneNumber } from "@/lib/phoneNormalizer";
import {
  Building2,
  Users,
  Calendar,
  Plus,
  Search,
  LogIn,
  Power,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  ShieldCheck,
  CreditCard,
  UserCheck,
  Scissors,
  Edit3,
  SlidersHorizontal,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Bot,
  IndianRupee,
  Key,
  AlertTriangle,
  Save,
  Eye,
  Trash2,
  Globe,
  Sliders,
  CalendarDays,
  Tag,
  X,
} from "lucide-react";

export default function SuperAdminSalonsPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created");
  const [showAddModal, setShowAddModal] = useState(false);

  // Selected Salon for Deep Management Drawer/Modal
  const [managedSalon, setManagedSalon] = useState<any | null>(null);
  const [drawerData, setDrawerData] = useState<any | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "basic" | "account" | "subscription" | "hours" | "whatsapp" | "staff_services">("overview");

  // Form edit states for managed salon
  const [editForm, setEditForm] = useState<any>({});
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Permanent Delete Salon State
  const [deleteTargetSalon, setDeleteTargetSalon] = useState<any | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handlePermanentDeleteSalon(e: React.FormEvent) {
    e.preventDefault();
    if (!deleteTargetSalon) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/salons/${deleteTargetSalon.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_salon_name: deleteConfirmInput }),
      });

      const data = await res.json();
      setIsDeleting(false);

      if (data.success) {
        setDeleteTargetSalon(null);
        setDeleteConfirmInput("");
        fetchSalons();
      } else {
        alert(data.error || "Failed to delete salon");
      }
    } catch (err) {
      setIsDeleting(false);
      alert("Error processing permanent salon deletion");
    }
  }

  // Onboard New Salon form
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

  async function openManageDrawer(salon: any) {
    setManagedSalon(salon);
    setIsDrawerLoading(true);
    setActiveTab("overview");
    setSaveSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/salons/${salon.id}`);
      const data = await res.json();
      if (data.success) {
        setDrawerData(data);
        setEditForm({
          name: data.salon.name || "",
          owner_name: data.salon.owner_name || "",
          email: data.salon.email || "",
          phone_number: data.salon.phone_number || "",
          login_id: data.salon.login_id || "",
          address: data.salon.address || "",
          city: data.salon.city || "",
          state: data.salon.state || "",
          pincode: data.salon.pincode || "",
          opening_time: data.salon.opening_time || "09:00:00",
          closing_time: data.salon.closing_time || "21:00:00",
          slot_interval_minutes: data.salon.slot_interval_minutes || 15,
          subscription_plan: data.salon.subscription_plan || "pro",
          subscription_expires_at: data.salon.subscription_expires_at || new Date(Date.now() + 365 * 86400000).toISOString(),
          status: data.salon.status || (data.salon.is_active ? "active" : "inactive"),
          business_category: data.salon.business_category || "Unisex Hair & Beauty Salon",
          cancellation_policy: data.salon.cancellation_policy || "Free cancellation up to 2 hours before appointment.",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrawerLoading(false);
    }
  }

  async function handleSaveManagedSalon(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!managedSalon) return;

    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const payload = {
        ...editForm,
        ...(resetPasswordInput ? { password: resetPasswordInput } : {}),
      };

      const res = await fetch(`/api/admin/salons/${managedSalon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSaving(false);

      if (data.success) {
        setSaveSuccessMsg("Salon details updated successfully!");
        setResetPasswordInput("");
        fetchSalons();
        openManageDrawer(managedSalon);
      }
    } catch (err) {
      setIsSaving(false);
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
      if (managedSalon?.id === salonId) {
        setManagedSalon({ ...managedSalon, status: nextStatus });
      }
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

  const filteredSalons = salons
    .filter((s) => {
      const matchesSearch =
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.login_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone_number?.includes(searchQuery) ||
        s.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.status === "active") ||
        (statusFilter === "inactive" && s.status !== "active") ||
        (statusFilter === "suspended" && s.status === "suspended");

      const matchesPlan = planFilter === "all" || s.subscription_plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "bookings") return (b.booking_count || 0) - (a.booking_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              Multi-Tenant Salons
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Directory Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Salon Management & Multi-Tenant Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full administrative control over tenant accounts, credentials, subscriptions, operating hours, and WhatsApp integration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSalons}
            className="h-11 px-3.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/salons/onboard"
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start 9-Step Onboarding Wizard</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Onboard</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {/* Status Filters */}
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({salons.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === "active"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Active ({salons.filter((s) => s.status === "active").length})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === "inactive"
                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Inactive ({salons.filter((s) => s.status !== "active").length})
          </button>

          <span className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Plan Filters */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">All Subscription Plans</option>
            <option value="basic">Basic Plan</option>
            <option value="pro">Pro Plan</option>
            <option value="enterprise">Enterprise Plan</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
          >
            <option value="created">Sort: Newest First</option>
            <option value="name">Sort: Salon Name</option>
            <option value="bookings">Sort: Most Bookings</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search salon, owner, login ID, city..."
            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Salons List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] p-6 shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <span>Loading tenant salons from Supabase...</span>
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No salons found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Salon Tenant</th>
                  <th className="py-3 px-4">Login ID</th>
                  <th className="py-3 px-4">Phone / City</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Bookings</th>
                  <th className="py-3 px-4 text-center">Clients</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {filteredSalons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span>{salon.name}</span>
                        {salon.status === "active" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Owner: <span className="text-slate-700 dark:text-slate-300 font-medium">{salon.owner_name || salon.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-[6px] font-semibold">
                        {salon.login_id}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">{formatPhoneDisplay(salon.phone_number)}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{salon.city || "Mumbai"}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
                        {salon.subscription_plan || "pro"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {salon.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 uppercase">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-900 dark:text-white text-sm font-mono">
                      {salon.booking_count ?? 0}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-900 dark:text-white text-sm font-mono">
                      {salon.customer_count ?? 0}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/salons/${salon.id}`}
                          className="h-9 px-3 rounded-[8px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Workspace</span>
                        </Link>

                        <button
                          onClick={() => openManageDrawer(salon)}
                          className="h-9 px-3 rounded-[8px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleImpersonate(salon.id)}
                          title="Login as this Salon"
                          className="h-9 px-3 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-1.5"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Login</span>
                        </button>

                        <button
                          onClick={() => { setDeleteTargetSalon(salon); setDeleteConfirmInput(""); }}
                          title="Delete Salon Tenant"
                          className="h-9 px-3 rounded-[8px] bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold transition inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
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

      {/* PROPER LIGHT-FIRST CENTERED MODAL FOR SALON EDIT */}
      {managedSalon && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl lg:max-w-6xl h-[92vh] max-h-[850px] rounded-[16px] shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Header (Fixed) */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {managedSalon.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>{managedSalon.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-mono font-semibold">
                      {managedSalon.login_id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Owner: <strong className="text-slate-900 dark:text-slate-200">{managedSalon.owner_name || managedSalon.name}</strong> • Phone: <strong className="text-slate-900 dark:text-slate-200 font-mono">+{managedSalon.phone_number}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleImpersonate(managedSalon.id)}
                  className="h-10 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Impersonate Salon</span>
                </button>

                <button
                  onClick={() => setManagedSalon(null)}
                  className="p-2 rounded-[8px] text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-6 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: "overview", label: "Overview & Stats", icon: Eye },
                { id: "basic", label: "Basic Details", icon: Building2 },
                { id: "account", label: "Account & Security", icon: Key },
                { id: "subscription", label: "Subscription Plan", icon: CreditCard },
                { id: "hours", label: "Operating Hours", icon: Clock },
                { id: "whatsapp", label: "WhatsApp Settings", icon: MessageSquare },
                { id: "staff_services", label: "Staff & Services", icon: Scissors },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 font-bold"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Form Content Body */}
            <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden space-y-6">
              {isDrawerLoading ? (
                <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <span>Loading tenant record...</span>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW & STATS */}
                  {activeTab === "overview" && drawerData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</span>
                          <h4 className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">₹{(drawerData.stats?.totalRevenue || 0).toLocaleString()}</h4>
                        </div>
                        <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bookings</span>
                          <h4 className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{drawerData.stats?.totalBookings || 0}</h4>
                        </div>
                        <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CRM Customers</span>
                          <h4 className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{drawerData.stats?.totalCustomers || 0}</h4>
                        </div>
                        <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Staff Barbers</span>
                          <h4 className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{drawerData.stats?.totalBarbers || 0}</h4>
                        </div>
                      </div>

                      {/* Quick Status Control */}
                      <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Salon Status & Access Control</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable or disable login access for this salon tenant.</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(managedSalon.id, managedSalon.status)}
                          className={`h-10 px-4 rounded-[10px] text-xs font-semibold transition flex items-center gap-1.5 ${
                            managedSalon.status === "active"
                              ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100"
                              : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{managedSalon.status === "active" ? "Deactivate Salon" : "Activate Salon"}</span>
                        </button>
                      </div>

                      {/* Recent Bookings */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Salon Appointments</h4>
                        {drawerData.bookings?.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">No bookings recorded yet for this salon.</p>
                        ) : (
                          <div className="space-y-2">
                            {drawerData.bookings?.slice(0, 5).map((b: any) => (
                              <div key={b.id} className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white">{b.customer_name}</span>
                                  <span className="text-slate-500 dark:text-slate-400 ml-2 font-mono">{b.booking_date} {b.start_time}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{b.total_price}</span>
                                  <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                    {b.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BASIC DETAILS */}
                  {activeTab === "basic" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salon Name *</label>
                          <input
                            type="text"
                            required
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owner Name</label>
                          <input
                            type="text"
                            value={editForm.owner_name}
                            onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp *</label>
                          <input
                            type="text"
                            required
                            value={editForm.phone_number}
                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City</label>
                          <input
                            type="text"
                            value={editForm.city}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State</label>
                          <input
                            type="text"
                            value={editForm.state}
                            onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
                          <input
                            type="text"
                            value={editForm.pincode}
                            onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Address</label>
                        <textarea
                          rows={2}
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full p-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ACCOUNT & CREDENTIALS */}
                  {activeTab === "account" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Admin Login ID</label>
                          <input
                            type="text"
                            value={editForm.login_id}
                            onChange={(e) => setEditForm({ ...editForm, login_id: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reset Password</label>
                          <input
                            type="password"
                            value={resetPasswordInput}
                            onChange={(e) => setResetPasswordInput(e.target.value)}
                            placeholder="Enter new password to reset"
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SUBSCRIPTION */}
                  {activeTab === "subscription" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subscription Plan</label>
                          <select
                            value={editForm.subscription_plan}
                            onChange={(e) => setEditForm({ ...editForm, subscription_plan: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          >
                            <option value="basic">Basic Plan (₹1,999/mo)</option>
                            <option value="pro">Pro Plan (₹3,999/mo)</option>
                            <option value="enterprise">Enterprise Plan (Custom)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Plan Expiry Date</label>
                          <input
                            type="date"
                            value={editForm.subscription_expires_at ? editForm.subscription_expires_at.split("T")[0] : ""}
                            onChange={(e) => setEditForm({ ...editForm, subscription_expires_at: new Date(e.target.value).toISOString() })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: OPERATING HOURS */}
                  {activeTab === "hours" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Opening Time</label>
                          <input
                            type="time"
                            value={editForm.opening_time}
                            onChange={(e) => setEditForm({ ...editForm, opening_time: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Closing Time</label>
                          <input
                            type="time"
                            value={editForm.closing_time}
                            onChange={(e) => setEditForm({ ...editForm, closing_time: e.target.value })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Slot Interval (Mins)</label>
                          <select
                            value={editForm.slot_interval_minutes}
                            onChange={(e) => setEditForm({ ...editForm, slot_interval_minutes: Number(e.target.value) })}
                            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                          >
                            <option value={15}>15 Minutes</option>
                            <option value={30}>30 Minutes</option>
                            <option value={60}>60 Minutes</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: WHATSAPP */}
                  {activeTab === "whatsapp" && drawerData && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">11za WhatsApp API Status</span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
                            Active & Webhook Listening
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Configured Phone: <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">+{managedSalon.phone_number}</span></p>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: STAFF & SERVICES */}
                  {activeTab === "staff_services" && drawerData && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Barbers & Staff List</h4>
                        {drawerData.barbers?.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">No staff onboarded for this salon yet.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {drawerData.barbers?.map((b: any) => (
                              <div key={b.id} className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white">{b.name}</span>
                                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{b.specialization || "Stylist"}</span>
                                </div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                  On Duty
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Services Catalog</h4>
                        {drawerData.services?.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">No services catalog added yet.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {drawerData.services?.map((s: any) => (
                              <div key={s.id} className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{s.duration_minutes} mins</span>
                                </div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                  ₹{s.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sticky Footer Actions */}
            <div className="p-4 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {saveSuccessMsg ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {saveSuccessMsg}
                  </span>
                ) : (
                  <span>Tenant ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{managedSalon.id}</span></span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setManagedSalon(null)}
                  className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveManagedSalon()}
                  disabled={isSaving}
                  className="h-11 px-6 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Onboard New Salon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-lg shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Onboard New Salon Tenant</span>
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setActionError(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateSalon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salon Name *</label>
                <input
                  type="text"
                  required
                  value={newSalon.name}
                  onChange={(e) => setNewSalon({ ...newSalon, name: e.target.value })}
                  placeholder="e.g. ABC Hair Studio"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Login ID *</label>
                  <input
                    type="text"
                    required
                    value={newSalon.login_id}
                    onChange={(e) => setNewSalon({ ...newSalon, login_id: e.target.value })}
                    placeholder="e.g. abc_hair"
                    className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                  <input
                    type="password"
                    required
                    value={newSalon.password}
                    onChange={(e) => setNewSalon({ ...newSalon, password: e.target.value })}
                    placeholder="Set secure password"
                    className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newSalon.phone_number}
                    onChange={(e) => setNewSalon({ ...newSalon, phone_number: e.target.value })}
                    placeholder="919819988776"
                    className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owner Name</label>
                  <input
                    type="text"
                    value={newSalon.owner_name}
                    onChange={(e) => setNewSalon({ ...newSalon, owner_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subscription Plan</label>
                <select
                  value={newSalon.subscription_plan}
                  onChange={(e) => setNewSalon({ ...newSalon, subscription_plan: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition"
                >
                  <option value="basic">Basic (₹1,999/mo)</option>
                  <option value="pro">Pro (₹3,999/mo)</option>
                  <option value="enterprise">Enterprise (Custom)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setActionError(null); }}
                  className="w-1/2 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[10px] font-semibold text-xs hover:bg-slate-200 transition border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] font-semibold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Salon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE SALON MODAL */}
      {deleteTargetSalon && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>Permanently Delete Salon?</span>
              </h3>
              <button onClick={() => setDeleteTargetSalon(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <div className="p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs space-y-1">
              <p className="font-bold text-rose-600 dark:text-rose-400">⚠️ Warning: Irreversible Action</p>
              <p>This action will permanently delete <strong className="text-slate-900 dark:text-white">{deleteTargetSalon.name}</strong> and all associated tenant data. This action cannot be undone.</p>
            </div>

            <form onSubmit={handlePermanentDeleteSalon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Type <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">{deleteTargetSalon.name}</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={deleteTargetSalon.name}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-rose-600 focus:outline-none transition"
                />
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteTargetSalon(null)}
                  className="w-1/2 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[10px] font-semibold text-xs hover:bg-slate-200 transition border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmInput.trim().toLowerCase() !== deleteTargetSalon.name.trim().toLowerCase()}
                  className="w-1/2 h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-[10px] text-xs shadow-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
