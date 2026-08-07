"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  CheckCheck,
  Zap,
  Sparkles,
  RefreshCw,
  Phone
} from "lucide-react";
import { getLiveWhatsAppLogs } from "@/lib/salonStore";
import { WhatsAppConversationLog } from "@/types/salon";

export default function WhatsAppLogsPage() {
  const [messages, setMessages] = useState<WhatsAppConversationLog[]>([]);
  const [testInput, setTestInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      const logs = await getLiveWhatsAppLogs();
      setMessages(logs);
      setLoading(false);
    }
    loadLogs();
  }, []);

  const handleTestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    setIsSending(true);

    const userMsg: WhatsAppConversationLog = {
      id: `msg-${Date.now()}`,
      messageId: `wamid.${Date.now()}`,
      fromNumber: "+919819988776",
      toNumber: "+919876543210",
      senderName: "Vikramaditya Roy",
      contentType: "text",
      contentText: testInput,
      eventType: "MoMessage",
      isResponded: true,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      const botReply: WhatsAppConversationLog = {
        id: `auto-${Date.now()}`,
        messageId: `auto_${Date.now()}`,
        fromNumber: "+919876543210",
        toNumber: "+919819988776",
        senderName: "Salon AI Assistant",
        contentType: "text",
        contentText: testInput.toLowerCase().includes("haircut")
          ? "Booking Confirmed ✅\nService: Executive Haircut & Wash\nBarber: Rahul Sharma\nDate: Today\nTime: 5:30 PM\nThank You!"
          : "Welcome to Velvet Cut Salon! ✨ Please reply with 1️⃣ Book Appointment or 2️⃣ View Services.",
        eventType: "MtMessage",
        isResponded: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg, botReply]);
      setTestInput("");
      setIsSending(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading WhatsApp live logs from Supabase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            WhatsApp Business API Live Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time chat log between WhatsApp customers and 11za AI Chatbot Engine (Supabase Live)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Supabase Webhook Connected
        </div>
      </div>

      {/* Main Chat Box Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Active Threads */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" /> Active WhatsApp Conversations
          </h3>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
              V
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">Vikramaditya Roy</h4>
                <span className="text-[10px] text-slate-400">15:42</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Booking Confirmed ✅ Service: Haircut</p>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Window & Test Simulator */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between h-[520px] shadow-xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                +91
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Vikramaditya Roy (+91 98199 88776)</h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Bot className="w-3 h-3" /> Auto-Responder Managed
                </span>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 py-4 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.eventType === "MoMessage" ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                    m.eventType === "MoMessage"
                      ? "bg-slate-950 text-slate-200 border border-slate-800"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold gap-4">
                    <span>{m.senderName}</span>
                    <span>{m.createdAt}</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{m.contentText}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Simulator Input */}
          <form onSubmit={handleTestSend} className="flex items-center gap-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              placeholder="Simulate WhatsApp incoming message (e.g. 'Kal 5 baje Rahul se haircut book karo')..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Send Test
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
