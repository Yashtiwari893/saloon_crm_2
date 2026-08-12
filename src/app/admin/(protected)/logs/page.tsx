"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  RefreshCw,
  MessageSquare,
  Bot,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  Info,
  SlidersHorizontal,
} from "lucide-react";

export default function LogsAdminPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/logs");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.salonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phoneNumber?.includes(searchQuery) ||
      l.messageText?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === "all" || l.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>System & WhatsApp Webhook Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-tenant log inspector for WhatsApp inbound, AI NLU responses, and webhook events
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setLevelFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              levelFilter === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setLevelFilter("USER_INBOUND")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              levelFilter === "USER_INBOUND"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Inbound Messages
          </button>
          <button
            onClick={() => setLevelFilter("AI_RESPONSE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              levelFilter === "AI_RESPONSE"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            AI Responses
          </button>
          <button
            onClick={() => setLevelFilter("WEBHOOK")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              levelFilter === "WEBHOOK"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Webhook Events
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by text, phone, salon..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <span>Live Audit Log Inspector</span>
          </h2>
          <span className="text-xs text-slate-500">{filteredLogs.length} events logged</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
            <span>Loading system audit logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No audit logs found.</div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {log.level === "AI_RESPONSE" ? (
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  ) : log.level === "WEBHOOK" ? (
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                      <Wifi className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  )}

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{log.salonName}</span>
                      <span className="font-mono text-[11px] text-amber-400">+{log.phoneNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                        {log.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono truncate">{log.messageText || "Webhook ping received"}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono whitespace-nowrap self-end md:self-auto">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
