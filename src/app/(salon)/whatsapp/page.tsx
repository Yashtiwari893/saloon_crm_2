"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Download,
  Copy,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { getLiveWhatsAppLogs } from "@/lib/salonStore";
import { WhatsAppConversationLog } from "@/types/salon";

export default function WhatsAppLogsPage() {
  const [messages, setMessages] = useState<WhatsAppConversationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Dynamic QR Code Data for Salon
  const wabaNumber = "919819988776";
  const salonSlug = "akriti-salon";
  const whatsappDeepLink = `https://wa.me/${wabaNumber}?text=Book%20${encodeURIComponent(salonSlug)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(whatsappDeepLink)}`;

  useEffect(() => {
    async function loadLogs() {
      const logs = await getLiveWhatsAppLogs();
      setMessages(logs);
      setLoading(false);
    }
    loadLogs();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(whatsappDeepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading WhatsApp logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              11za WABA Gateway
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected & Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>WhatsApp Business API Center & QR Standee</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Option D 4-layer resolution engine, 11za gateway credentials, and salon reception QR Standee.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          11za Gateway Connected
        </div>
      </div>

      {/* SALON COUNTER QR STANDEE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* QR Code Image Container */}
          <div className="flex flex-col items-center text-center p-5 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              Scan to Book Instant Appointment
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">WhatsApp Reception QR</h3>
            
            <div className="p-3 bg-white border border-slate-200 rounded-[10px] mb-3 shadow-inner">
              <img
                src={qrImageUrl}
                alt="Salon WhatsApp QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>

            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-800 px-3 py-1 rounded-[6px] border border-slate-200 dark:border-slate-700">
              WhatsApp: +{wabaNumber}
            </div>
          </div>

          {/* QR Link & Instructions */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Option D Auto-Routing Active
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Counter Table Standee & Online Booking Link</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                Print this QR code to place on your salon counter reception. When clients scan this QR or click your link, the 11za AI Bot automatically identifies your salon and starts instant booking!
              </p>
            </div>

            {/* Link Box */}
            <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Your Direct Salon Booking Link</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={whatsappDeepLink}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 text-xs text-blue-600 dark:text-blue-400 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="h-11 px-4 rounded-[10px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={qrImageUrl}
                target="_blank"
                rel="noreferrer"
                download="Salon_WhatsApp_QR.png"
                className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Printable Standee QR</span>
              </a>

              <a
                href={whatsappDeepLink}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Link Live</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
