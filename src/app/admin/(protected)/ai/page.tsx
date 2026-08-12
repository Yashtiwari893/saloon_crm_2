"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  Zap,
  RefreshCw,
  Search,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Sliders,
  Send,
  Terminal,
  Activity,
} from "lucide-react";

export default function AIAdminPage() {
  const router = useRouter();
  const [aiStats, setAiStats] = useState<any>({ totalDocuments: 0, totalChunks: 0 });
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchAiConfig();
  }, []);

  async function fetchAiConfig() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ai");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAiStats(data.stats || {});
        setModels(data.models || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTestRagSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_rag", query: testQuery }),
      });
      const data = await res.json();
      setIsSearching(false);

      if (data.success) {
        setTestResults(data.matches || []);
      }
    } catch (e) {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-400" />
            <span>AI & RAG Knowledge Engine Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Groq LLaMA 3.3 70B, Mistral Vector Embeddings, and pgvector Knowledge Chunks
          </p>
        </div>

        <button
          onClick={fetchAiConfig}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh AI Status</span>
        </button>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{m.type}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{m.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Avg Latency: <span className="text-slate-300 font-mono">{m.latency}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Vector Store Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total Index Documents</span>
            <h3 className="text-2xl font-black text-white mt-1">{aiStats.totalDocuments || 0}</h3>
            <span className="text-[11px] text-slate-500">Knowledge Base Files</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Vector Embeddings</span>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{aiStats.totalChunks || 0}</h3>
            <span className="text-[11px] text-slate-500">pgvector Chunks</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Vector Dimension</span>
            <h3 className="text-2xl font-black text-cyan-400 mt-1">{aiStats.vectorDimension || 1024}d</h3>
            <span className="text-[11px] text-slate-500">Mistral Embeddings</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Similarity Metric</span>
            <h3 className="text-base font-bold text-emerald-400 mt-1">Cosine (&lt;=&gt;)</h3>
            <span className="text-[11px] text-slate-500">Fast Vector Search</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RAG Search & NLU Intent Tester */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Terminal className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Interactive RAG Similarity Search Tester</h2>
        </div>

        <form onSubmit={handleTestRagSearch} className="flex gap-3">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type customer message to test RAG retrieval (e.g. I want to book haircut tomorrow at 4pm)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-mono"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSearching ? "Searching..." : "Test RAG"}</span>
          </button>
        </form>

        {testResults && (
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Retrieved Top Vector Matches:</h4>
            <div className="space-y-2">
              {testResults.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-amber-400 font-bold">Match #{i + 1} — Score: {r.score}</span>
                    <span className="text-slate-500">{JSON.stringify(r.metadata)}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
