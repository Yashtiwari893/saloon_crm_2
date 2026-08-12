"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Bot,
  Wifi,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Plus,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Send,
  Zap,
} from "lucide-react";

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
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configForm),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>WhatsApp Accounts & Gateway Integration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor 11za WhatsApp API accounts, webhook endpoints, and automated chatbot integration status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestWebhookConnection}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-emerald-300 transition text-xs font-semibold flex items-center gap-1.5"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Test Webhook Ping</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Connect WhatsApp Account</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center justify-between">
          <span>{testResult}</span>
          <button onClick={() => setTestResult(null)} className="text-slate-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total Configured Accounts</span>
            <h3 className="text-2xl font-black text-white mt-1">{accounts.length}</h3>
            <span className="text-[11px] text-slate-500">Multi-Tenant Gateways</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Active Webhooks</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {accounts.filter((a) => a.webhookEnabled).length} / {accounts.length}
            </h3>
            <span className="text-[11px] text-slate-500">Listening to Webhooks</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wifi className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Gateway Provider</span>
            <h3 className="text-lg font-bold text-amber-400 mt-1">11za WhatsApp API</h3>
            <span className="text-[11px] text-slate-500">Official Partner Origin</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Bot className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <span>Configured Tenant WhatsApp Gateways</span>
          </h2>

          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search salon or phone number..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-500 mx-auto mb-2" />
            <span>Loading WhatsApp accounts...</span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No WhatsApp accounts configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Salon Tenant</th>
                  <th className="py-3 px-4">WhatsApp Phone</th>
                  <th className="py-3 px-4">Origin Gateway</th>
                  <th className="py-3 px-4">Auth Token</th>
                  <th className="py-3 px-4">Webhook Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 font-semibold text-white">
                      {acc.salonName}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-emerald-400">
                      +{acc.phoneNumber}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-600" />
                      <span>{acc.origin}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">
                      {acc.authToken}
                    </td>
                    <td className="py-4 px-4">
                      {acc.webhookEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                          <XCircle className="w-3 h-3" /> Paused
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(acc.lastWebhookAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Configure Salon WhatsApp Gateway</span>
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Salon *</label>
                <select
                  required
                  value={configForm.salonId}
                  onChange={(e) => setConfigForm({ ...configForm, salonId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Salon Tenant...</option>
                  {salons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.login_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">WhatsApp Phone Number *</label>
                <input
                  type="text"
                  required
                  value={configForm.phone_number}
                  onChange={(e) => setConfigForm({ ...configForm, phone_number: e.target.value })}
                  placeholder="919005300803"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">API Origin Gateway</label>
                <input
                  type="text"
                  value={configForm.origin}
                  onChange={(e) => setConfigForm({ ...configForm, origin: e.target.value })}
                  placeholder="https://api.11za.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Auth Bearer Token</label>
                <input
                  type="password"
                  value={configForm.auth_token}
                  onChange={(e) => setConfigForm({ ...configForm, auth_token: e.target.value })}
                  placeholder="11za bearer auth token"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Config"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
