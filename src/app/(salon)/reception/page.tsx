"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  Plus,
  Phone,
  Scissors,
  CreditCard,
  UserCheck,
  Building2,
  IndianRupee,
  Sparkles,
  Play,
} from "lucide-react";

export default function ReceptionKanbanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    customer_name: "",
    customer_phone: "",
    barber_id: "",
    service_id: "",
    time: "12:00",
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              Reception Kanban
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Queue
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Reception Live Board</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track customer arrivals, stylist chair allocation, and record POS payments in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWalkinModal(true)}
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Walk-In Entry</span>
          </button>
        </div>
      </div>

      {/* Live Pipeline Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: Confirmed / On The Way */}
        <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Confirmed / En Route
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">1</span>
          </div>
          <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Priyansh Sharma</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">12:30 PM</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Haircut & Beard Styling • Stylist Sameer</p>
            <button
              onClick={() => alert("Marked Arrived")}
              className="w-full h-9 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 font-semibold rounded-[8px] border border-emerald-200 dark:border-emerald-500/20 transition text-xs flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" /> Mark Arrived
            </button>
          </div>
        </div>

        {/* Column 2: Waiting in Lounge */}
        <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Waiting in Lounge
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">1</span>
          </div>
          <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Rahul Verma</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">Arrived (5 mins ago)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Executive Facial • Stylist Imran</p>
            <button
              onClick={() => alert("Service Started")}
              className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[8px] transition text-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Start Service
            </button>
          </div>
        </div>

        {/* Column 3: In Chair (Service Active) */}
        <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scissors className="w-4 h-4" /> In Chair (Active)
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">1</span>
          </div>
          <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Amit Patel</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">Chair #2</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Royal Grooming Spa • Stylist Sameer</p>
            <button
              onClick={() => alert("Complete & Record Payment")}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-[8px] transition text-xs flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" /> Record POS Payment
            </button>
          </div>
        </div>

        {/* Column 4: Payment Done / Completed */}
        <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Completed & Paid
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">1</span>
          </div>
          <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Vikram Singh</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹750 Paid</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">UPI Payment • Rating Trigger Sent</p>
            <span className="block text-center text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Rating Requested on WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Walkin Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Walk-In Entry
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); setShowWalkinModal(false); }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyansh"
                  value={walkinForm.customer_name}
                  onChange={(e) => setWalkinForm({ ...walkinForm, customer_name: e.target.value })}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9819988776"
                  value={walkinForm.customer_phone}
                  onChange={(e) => setWalkinForm({ ...walkinForm, customer_phone: e.target.value })}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                >
                  Add to Reception Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
