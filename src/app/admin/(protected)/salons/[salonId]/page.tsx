"use client";

import { useEffect, useState, use } from "react";
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
  ChevronLeft,
  Terminal,
  Activity,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react";

import { FEATURE_MANIFEST, isFeatureEnabled, FeatureKey } from "@/lib/features";

export default function DedicatedSalonWorkspacePage({
  params,
}: {
  params: Promise<{ salonId: string }>;
}) {
  const resolvedParams = use(params);
  const salonId = resolvedParams.salonId;
  const router = useRouter();

  const [salonData, setSalonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "basic" | "barbers" | "services" | "bookings" | "customers" | "whatsapp" | "ai" | "hours" | "subscription" | "features" | "danger"
  >("overview");

  const [editForm, setEditForm] = useState<any>({});
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Barbers & Services Modal States
  const [showAddBarberModal, setShowAddBarberModal] = useState(false);
  const [newBarber, setNewBarber] = useState({ name: "", phone_number: "", specialization: "Hair Stylist", experience_years: 3, rating: 4.9 });
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({ name: "", category: "Hair", description: "", duration_minutes: 30, price: 500, gender: "unisex" });

  // High Risk Action Confirmation Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmName, setResetConfirmName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [hardDeleteCheck, setHardDeleteCheck] = useState(false);

  useEffect(() => {
    fetchSalonDetails();
  }, [salonId]);

  async function fetchSalonDetails() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/salons/${salonId}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSalonData(data);
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
          feature_overrides: data.salon.feature_overrides || data.salon.featureOverrides || {},
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSalonDetails(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSaving(true);
    setToastMsg(null);

    try {
      const payload = {
        ...editForm,
        ...(resetPasswordInput ? { password: resetPasswordInput } : {}),
      };

      const res = await fetch(`/api/admin/salons/${salonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSaving(false);

      if (data.success) {
        setToastMsg("Salon configuration saved successfully!");
        setResetPasswordInput("");
        fetchSalonDetails();
      }
    } catch (err) {
      setIsSaving(false);
    }
  }

  async function handleAddBarber(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/salons/${salonId}/barbers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBarber),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddBarberModal(false);
        setNewBarber({ name: "", phone_number: "", specialization: "Hair Stylist", experience_years: 3, rating: 4.9 });
        fetchSalonDetails();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/salons/${salonId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddServiceModal(false);
        setNewService({ name: "", category: "Hair", description: "", duration_minutes: 30, price: 500, gender: "unisex" });
        fetchSalonDetails();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleImpersonate() {
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

  async function handleResetOperationalData(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/salons/${salonId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_salon_name: resetConfirmName }),
      });
      const data = await res.json();
      if (data.success) {
        setShowResetModal(false);
        setResetConfirmName("");
        setToastMsg("Operational data reset complete!");
        fetchSalonDetails();
      } else {
        alert(data.error || "Reset failed");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteSalon(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/salons/${salonId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_salon_name: deleteConfirmName, hard_delete: hardDeleteCheck }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/salons");
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (isLoading || !salonData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading salon control workspace...</span>
        </div>
      </div>
    );
  }

  const salon = salonData.salon;
  const stats = salonData.stats;

  return (
    <div className="space-y-6">
      {/* Back Link & Page Header Banner */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <Link
            href="/admin/salons"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-3"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Salons Directory
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                {salon.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {salon.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-mono">
                    {salon.login_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
                    {salon.subscription_plan || "pro"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Owner: <strong className="text-slate-900 dark:text-slate-200">{salon.owner_name || salon.name}</strong> • Phone: <strong className="text-slate-900 dark:text-slate-200 font-mono">{formatPhoneDisplay(salon.phone_number)}</strong> • City: <strong className="text-slate-900 dark:text-slate-200">{salon.city || "Mumbai"}</strong>
                </p>
              </div>
            </div>

            {/* Master Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={handleImpersonate}
                className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Impersonate Salon</span>
              </button>

              <button
                onClick={() => setActiveTab("danger")}
                className="h-11 px-4 rounded-[10px] bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold transition flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {toastMsg}
          </span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="space-y-3">
        {/* Mobile Selector */}
        <div className="sm:hidden p-3 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Select Management Section</label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
          >
            <option value="overview">Overview</option>
            <option value="basic">Details & Credentials</option>
            <option value="barbers">Barbers ({stats.totalBarbers})</option>
            <option value="services">Services ({stats.totalServices})</option>
            <option value="bookings">Bookings ({stats.totalBookings})</option>
            <option value="customers">Customer CRM ({stats.totalCustomers})</option>
            <option value="whatsapp">WhatsApp Gateway</option>
            <option value="ai">AI & RAG Engine</option>
            <option value="hours">Operating Hours</option>
            <option value="subscription">Subscription Plan</option>
            <option value="features">Feature Entitlements</option>
            <option value="danger">Danger Zone</option>
          </select>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 p-2 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "basic", label: "Details & Credentials", icon: Building2 },
            { id: "barbers", label: `Barbers (${stats.totalBarbers})`, icon: UserCheck },
            { id: "services", label: `Services (${stats.totalServices})`, icon: Scissors },
            { id: "bookings", label: `Bookings (${stats.totalBookings})`, icon: CalendarDays },
            { id: "customers", label: `Customer CRM (${stats.totalCustomers})`, icon: Users },
            { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
            { id: "ai", label: "AI & RAG", icon: Bot },
            { id: "hours", label: "Operating Hours", icon: Clock },
            { id: "subscription", label: "Subscription", icon: CreditCard },
            { id: "features", label: "Feature Entitlements", icon: SlidersHorizontal },
            { id: "danger", label: "Danger Zone", icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-[10px] text-xs font-semibold transition flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : tab.id === "danger"
                    ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT CONTAINER */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gross Revenue</span>
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">₹{stats.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="p-5 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Appointments</span>
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{stats.totalBookings}</div>
              </div>
              <div className="p-5 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CRM Customers</span>
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{stats.totalCustomers}</div>
              </div>
              <div className="p-5 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Barbers</span>
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{stats.totalBarbers}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Appointments</h3>
              {salonData.bookings?.length === 0 ? (
                <div className="p-8 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  No appointments recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {salonData.bookings?.map((b: any) => (
                    <div key={b.id} className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
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

        {/* TAB 2: BASIC DETAILS & CREDENTIALS */}
        {activeTab === "basic" && (
          <form onSubmit={handleSaveSalonDetails} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salon Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owner Name</label>
                <input
                  type="text"
                  value={editForm.owner_name}
                  onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Admin Login ID</label>
                <input
                  type="text"
                  value={editForm.login_id}
                  onChange={(e) => setEditForm({ ...editForm, login_id: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reset Admin Password</label>
                <input
                  type="password"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Set new password"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
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
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-6 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Details & Password"}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: BARBERS & STAFF MANAGEMENT */}
        {activeTab === "barbers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Barbers & Staff Directory</h3>
              <button
                onClick={() => setShowAddBarberModal(true)}
                className="h-9 px-3.5 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Barber</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {salonData.barbers?.map((b: any) => (
                <div key={b.id} className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{b.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{b.specialization || "Stylist"} • {b.experience_years} yrs exp</p>
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-1 block">+{b.phone_number || salon.phone_number}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    On Duty
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES CATALOG MANAGEMENT */}
        {activeTab === "services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Services Catalog</h3>
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="h-9 px-3.5 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {salonData.services?.map((s: any) => (
                <div key={s.id} className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.category} • {s.duration_minutes} mins</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{s.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AI & RAG */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Dedicated Salon RAG Engine</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">NLU Chatbot configured for {salon.name}. Scoped to salon_id: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{salon.id}</span></p>
            </div>
          </div>
        )}

        {/* TAB 10: FEATURE ENTITLEMENTS & GRANULAR OVERRIDES */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <div className="p-4 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs leading-relaxed flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Granular Feature Permissions for {salon.name}</p>
                <p className="text-xs mt-0.5 text-slate-600 dark:text-slate-300">
                  Current Plan: <strong className="uppercase font-mono text-blue-600 dark:text-blue-400">{editForm.subscription_plan || "PRO"}</strong>. Toggle features ON or OFF to grant or restrict specific tools for this salon tenant.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(FEATURE_MANIFEST) as FeatureKey[]).map((fKey) => {
                const meta = FEATURE_MANIFEST[fKey];
                const currentOverrides = editForm.feature_overrides || {};
                const hasCustomOverride = typeof currentOverrides[fKey] === "boolean";
                const isCurrentlyEnabled = isFeatureEnabled(
                  { subscription_plan: editForm.subscription_plan, feature_overrides: currentOverrides },
                  fKey
                );

                return (
                  <div
                    key={fKey}
                    className={`p-4 rounded-[14px] border transition flex items-start justify-between gap-3 ${
                      isCurrentlyEnabled
                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 opacity-75"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{meta.label}</span>
                        {hasCustomOverride ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 uppercase">
                            Admin Override
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                            Plan Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{meta.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...currentOverrides, [fKey]: !isCurrentlyEnabled };
                          setEditForm({ ...editForm, feature_overrides: updated });
                        }}
                        className={`h-8 px-3 rounded-[8px] text-xs font-bold transition shadow-sm ${
                          isCurrentlyEnabled
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {isCurrentlyEnabled ? "ENABLED" : "DISABLED"}
                      </button>

                      {hasCustomOverride && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...currentOverrides };
                            delete updated[fKey];
                            setEditForm({ ...editForm, feature_overrides: updated });
                          }}
                          className="text-[10px] text-slate-400 hover:text-rose-600 underline"
                        >
                          Reset to Plan Default
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleSaveSalonDetails()}
                disabled={isSaving}
                className="h-11 px-6 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Feature Permissions"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 11: DANGER ZONE */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <div className="p-5 rounded-[14px] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-3">
              <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Reset Operational Data
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Wipe test bookings, customer records, and chat logs for {salon.name} while preserving salon settings, staff, and services catalog.
              </p>
              <button
                onClick={() => setShowResetModal(true)}
                className="h-10 px-4 rounded-[8px] bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition"
              >
                Reset Operational Data
              </button>
            </div>

            <div className="p-5 rounded-[14px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 space-y-3">
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Soft / Hard Delete Salon Tenant
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Disable salon login access or permanently delete tenant records.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="h-10 px-4 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition"
              >
                Delete Salon Tenant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD BARBER MODAL */}
      {showAddBarberModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Add Barber for {salon.name}</span>
              </h3>
              <button onClick={() => setShowAddBarberModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddBarber} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Barber Name *</label>
                <input
                  type="text"
                  required
                  value={newBarber.name}
                  onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specialization</label>
                <input
                  type="text"
                  value={newBarber.specialization}
                  onChange={(e) => setNewBarber({ ...newBarber, specialization: e.target.value })}
                  placeholder="Hair Specialist & Beard Stylist"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBarberModal(false)}
                  className="w-1/2 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[10px] font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] font-semibold text-xs shadow-sm transition"
                >
                  Create Barber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Add Service for {salon.name}</span>
              </h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g. Premium Haircut & Styling"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({ ...newService, duration_minutes: Number(e.target.value) })}
                    className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="w-1/2 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[10px] font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] font-semibold text-xs shadow-sm transition"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET OPERATIONAL DATA MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Operational Data Reset</span>
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will wipe bookings, customers, notifications, and chat records for <strong className="text-slate-900 dark:text-white">{salon.name}</strong>. Staff and services will be preserved.
            </p>

            <form onSubmit={handleResetOperationalData} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Type <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">{salon.name}</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={resetConfirmName}
                  onChange={(e) => setResetConfirmName(e.target.value)}
                  placeholder={salon.name}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-1/2 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[10px] font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetConfirmName.trim().toLowerCase() !== salon.name.trim().toLowerCase()}
                  className="w-1/2 h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-[10px] text-xs disabled:opacity-40 shadow-sm transition"
                >
                  Reset Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SALON MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>Confirm Salon Deletion</span>
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action will disable or permanently remove <strong className="text-slate-900 dark:text-white">{salon.name}</strong>.
            </p>

            <form onSubmit={handleDeleteSalon} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hardDeleteCheck"
                  checked={hardDeleteCheck}
                  onChange={(e) => setHardDeleteCheck(e.target.checked)}
                  className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-0"
                />
                <label htmlFor="hardDeleteCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Permanent Hard Delete (Remove all database rows)
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Type <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">{salon.name}</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={salon.name}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[10px] font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmName.trim().toLowerCase() !== salon.name.trim().toLowerCase()}
                  className="w-1/2 h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-[10px] text-xs disabled:opacity-40 shadow-sm transition"
                >
                  Delete Salon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
