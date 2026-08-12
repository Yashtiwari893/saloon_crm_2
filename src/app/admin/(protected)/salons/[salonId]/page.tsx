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
    "overview" | "basic" | "barbers" | "services" | "bookings" | "customers" | "whatsapp" | "ai" | "hours" | "subscription" | "danger"
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
      <div className="py-32 text-center text-slate-400 text-xs">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
        <span>Loading Master Salon Control Workspace...</span>
      </div>
    );
  }

  const salon = salonData.salon;
  const stats = salonData.stats;

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/salons"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Salons Directory
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
              {salon.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>{salon.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                  {salon.login_id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  {salon.subscription_plan || "pro"}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Owner: <span className="text-slate-200 font-semibold">{salon.owner_name || salon.name}</span> • Phone: <span className="text-slate-200 font-mono">{formatPhoneDisplay(salon.phone_number)}</span> • City: <span className="text-slate-200">{salon.city || "Mumbai"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleImpersonate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Impersonate Salon</span>
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Danger Zone</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {toastMsg}
          </span>
          <button onClick={() => setToastMsg(null)} className="text-slate-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-xl">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("basic")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "basic" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Details & Credentials
        </button>
        <button
          onClick={() => setActiveTab("barbers")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "barbers" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Barbers & Staff ({stats.totalBarbers})
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "services" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Scissors className="w-3.5 h-3.5" /> Services ({stats.totalServices})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "bookings" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" /> Bookings ({stats.totalBookings})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "customers" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Customer CRM ({stats.totalCustomers})
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "whatsapp" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "ai" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Bot className="w-3.5 h-3.5" /> AI & RAG
        </button>
        <button
          onClick={() => setActiveTab("hours")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "hours" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Operating Hours
        </button>
        <button
          onClick={() => setActiveTab("subscription")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "subscription" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Subscription
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "danger" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Gross Revenue</span>
                <h4 className="text-2xl font-black text-emerald-400 mt-1">₹{stats.totalRevenue.toLocaleString()}</h4>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Appointments</span>
                <h4 className="text-2xl font-black text-amber-400 mt-1">{stats.totalBookings}</h4>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">CRM Customers</span>
                <h4 className="text-2xl font-black text-cyan-400 mt-1">{stats.totalCustomers}</h4>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Active Barbers</span>
                <h4 className="text-2xl font-black text-purple-400 mt-1">{stats.totalBarbers}</h4>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Appointments</h3>
              <div className="space-y-2">
                {salonData.bookings?.map((b: any) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{b.customer_name}</span>
                      <span className="text-slate-500 ml-2 font-mono">{b.booking_date} {b.start_time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">₹{b.total_price}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BASIC DETAILS & CREDENTIALS */}
        {activeTab === "basic" && (
          <form onSubmit={handleSaveSalonDetails} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Salon Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Owner Name</label>
                <input
                  type="text"
                  value={editForm.owner_name}
                  onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Admin Login ID</label>
                <input
                  type="text"
                  value={editForm.login_id}
                  onChange={(e) => setEditForm({ ...editForm, login_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Reset Admin Password</label>
                <input
                  type="password"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Set new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition text-xs flex items-center gap-1.5 disabled:opacity-50"
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
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Barbers & Staff List</h3>
              <button
                onClick={() => setShowAddBarberModal(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl shadow-md transition text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Barber</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {salonData.barbers?.map((b: any) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{b.name}</h4>
                    <p className="text-xs text-slate-400">{b.specialization || "Stylist"} • {b.experience_years} yrs exp</p>
                    <span className="text-[10px] font-mono text-amber-400 mt-1 block">+{b.phone_number || salon.phone_number}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Services Catalog</h3>
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl shadow-md transition text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {salonData.services?.map((s: any) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <p className="text-xs text-slate-400">{s.category} • {s.duration_minutes} mins</p>
                  </div>
                  <span className="text-base font-black text-amber-400">
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
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase">Dedicated Salon RAG Engine</h4>
              <p className="text-xs text-slate-300">NLU Chatbot configured for {salon.name}. Scoped to salon_id: <span className="font-mono text-emerald-400">{salon.id}</span></p>
            </div>
          </div>
        )}

        {/* TAB 11: DANGER ZONE */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Reset Operational Data
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Wipe test bookings, customer records, and chat logs for {salon.name} while preserving salon settings, staff, and services catalog.
              </p>
              <button
                onClick={() => setShowResetModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
              >
                Reset Operational Data
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Soft / Hard Delete Salon Tenant
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Disable salon login access or permanently delete tenant records.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 hover:bg-red-400 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
              >
                Delete Salon Tenant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD BARBER MODAL */}
      {showAddBarberModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>Add Barber for {salon.name}</span>
              </h3>
              <button onClick={() => setShowAddBarberModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddBarber} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Barber Name *</label>
                <input
                  type="text"
                  required
                  value={newBarber.name}
                  onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Specialization</label>
                <input
                  type="text"
                  value={newBarber.specialization}
                  onChange={(e) => setNewBarber({ ...newBarber, specialization: e.target.value })}
                  placeholder="Hair Specialist & Beard Stylist"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBarberModal(false)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-400" />
                <span>Add Service for {salon.name}</span>
              </h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g. Premium Haircut & Styling"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({ ...newService, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Operational Data Reset</span>
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will wipe bookings, customers, notifications, and chat records for <span className="text-white font-bold">{salon.name}</span>. Staff and services will be preserved.
            </p>

            <form onSubmit={handleResetOperationalData} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Type <span className="text-amber-400 font-mono font-bold">{salon.name}</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={resetConfirmName}
                  onChange={(e) => setResetConfirmName(e.target.value)}
                  placeholder={salon.name}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetConfirmName.trim().toLowerCase() !== salon.name.trim().toLowerCase()}
                  className="w-1/2 bg-amber-500 text-slate-950 font-bold py-2 rounded-xl text-xs disabled:opacity-40"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>Confirm Salon Deletion</span>
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will disable or permanently remove <span className="text-white font-bold">{salon.name}</span>.
            </p>

            <form onSubmit={handleDeleteSalon} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hardDeleteCheck"
                  checked={hardDeleteCheck}
                  onChange={(e) => setHardDeleteCheck(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-red-500 focus:ring-0"
                />
                <label htmlFor="hardDeleteCheck" className="text-xs text-slate-300">
                  Permanent Hard Delete (Remove all database rows)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Type <span className="text-red-400 font-mono font-bold">{salon.name}</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={salon.name}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmName.trim().toLowerCase() !== salon.name.trim().toLowerCase()}
                  className="w-1/2 bg-red-500 text-white font-bold py-2 rounded-xl text-xs disabled:opacity-40"
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
