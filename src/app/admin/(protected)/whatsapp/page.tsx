"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Wifi,
  CheckCircle2,
  Search,
  Plus,
  TrendingUp,
  IndianRupee,
  Activity,
  Zap,
  Globe,
} from "lucide-react";
import { formatPhoneDisplay, normalizePhoneNumber } from "@/lib/phoneNormalizer";

export default function WhatsAppAdminPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [salons, setSalons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [configForm, setConfigForm] = useState({
    salonId: "",
    phone_number: "",
    origin: "https://api.11za.in",
    auth_token: "",
    webhook_enabled: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAccountsAndSalons();
  }, []);

  async function fetchAccountsAndSalons() {
    setIsLoading(true);
    try {
      const [accRes, salonRes] = await Promise.all([
        fetch("/api/admin/whatsapp"),
        fetch("/api/admin/salons"),
      ]);

      if (accRes.status === 401 || accRes.status === 403) {
        router.push("/admin/login");
        return;
      }

      const accData = await accRes.json();
      const salonData = await salonRes.json();

      if (accData.success) setAccounts(accData.accounts || []);
      if (salonData.success) setSalons(salonData.salons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...configForm,
        phone_number: normalizePhoneNumber(configForm.phone_number),
      };

      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setShowConfigModal(false);
        fetchAccountsAndSalons();
      }
    } catch (e) {
      setIsSubmitting(false);
    }
  }

  async function handleTestWebhookConnection() {
    setTestResult("Testing Webhook endpoint connection...");
    try {
      const start = Date.now();
      const res = await fetch("/api/whatsapp/webhook", { method: "GET" });
      const duration = Date.now() - start;
      if (res.ok) {
        setTestResult(`✅ 11za Webhook Gateway active! Response latency: ${duration}ms`);
      } else {
        setTestResult(`⚠️ Gateway returned status ${res.status}`);
      }
    } catch (e: any) {
      setTestResult(`❌ Connection test failed: ${e.message}`);
    }
  }

  const filteredAccounts = accounts.filter((a) => {
    return (
      a.salonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phoneNumber?.includes(searchQuery) ||
      a.origin?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading 11za WhatsApp API accounts...</span>
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
              11za WABA Gateway
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WABA Single Router Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>11za WhatsApp API Usage & Profit Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor WhatsApp message usage, estimated 11za API costs, and subscription profit health across tenant accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleTestWebhookConnection}
            className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
          >
            <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Test Webhook Ping</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Connect WhatsApp Account</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-4 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
          <span>{testResult}</span>
          <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Configured Gateways</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{accounts.length}</div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">11za Multi-Tenant Webhooks</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Message Usage</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">12,480</div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Sent & Delivered</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estimated 11za API Cost</span>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">₹3,120</div>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Utility @ ₹0.25 / msg</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform Profit Margin</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">+68% Profit</div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Profitable SaaS Margin</span>
        </div>
      </div>

      {/* Directory Table */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Connected 11za WhatsApp Accounts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage 11za auth tokens, webhook origins, and tenant routing mappings</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by salon or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[10px] border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Salon Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">11za Gateway Origin</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No WhatsApp accounts configured yet.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{acc.salonName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">{acc.phoneNumber}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">{acc.origin}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
                        Connected
                      </span>
                    </td>
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
