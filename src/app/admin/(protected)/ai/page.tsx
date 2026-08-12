"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  Database,
  Layers,
  Cpu,
  Terminal,
  Send,
  CheckCircle2,
  Activity,
} from "lucide-react";

export default function AiPage() {
  const [testQuery, setTestQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);

  const [aiStats, setAiStats] = useState({
    totalDocuments: 14,
    totalChunks: 128,
    vectorDimension: 1024,
  });

  const models = [
    { name: "Groq LLaMA 3.3 70B", type: "LLM Generation", latency: "240ms", status: "Active" },
    { name: "Google Gemini 1.5 Flash", type: "LLM Fallback", latency: "380ms", status: "Active" },
    { name: "Mistral embed-instruct", type: "Vector Embeddings", latency: "120ms", status: "Active" },
  ];

  async function handleTestRagSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!testQuery) return;
    setIsSearching(true);

    setTimeout(() => {
      setTestResults([
        { score: 0.94, content: "Akriti Salon haircut prices start from ₹250 for Men Basic Trim.", metadata: { category: "pricing" } },
        { score: 0.88, content: "Available timing slots today are 2:00 PM, 3:30 PM and 5:00 PM with Stylist Sameer.", metadata: { category: "availability" } },
      ]);
      setIsSearching(false);
    }, 600);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              RAG & NLU Vector Engine
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Models Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>AI & RAG Knowledge Engine Control</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage Groq LLaMA 3.3 70B, Mistral Vector Embeddings, and pgvector Knowledge Chunks.
          </p>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m, idx) => (
          <div key={idx} className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{m.type}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg Latency: <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{m.latency}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Vector Store Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Index Documents</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{aiStats.totalDocuments}</div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Knowledge Base Files</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vector Embeddings</span>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{aiStats.totalChunks}</div>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">pgvector Chunks</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vector Dimension</span>
          <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 tracking-tight">{aiStats.vectorDimension}d</div>
          <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Mistral Embeddings</span>
        </div>

        <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Similarity Metric</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">Cosine</div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Fast Vector Search</span>
        </div>
      </div>

      {/* RAG Search & NLU Intent Tester */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Interactive RAG Similarity Search Tester</h2>
        </div>

        <form onSubmit={handleTestRagSearch} className="flex gap-3">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type customer message to test RAG retrieval (e.g. I want to book haircut tomorrow at 4pm)..."
            className="flex-1 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] py-2.5 px-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition font-mono"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="h-12 px-5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSearching ? "Searching..." : "Test RAG"}</span>
          </button>
        </form>

        {testResults && (
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Retrieved Top Vector Matches:</h4>
            <div className="space-y-2">
              {testResults.map((r, i) => (
                <div key={i} className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">Match #{i + 1} — Score: {r.score}</span>
                    <span className="text-slate-400 font-mono">{JSON.stringify(r.metadata)}</span>
                  </div>
                  <p className="text-xs text-slate-900 dark:text-slate-200 font-mono">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
