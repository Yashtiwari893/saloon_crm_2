"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Award,
  Calendar,
  Phone,
  Heart,
  FileText,
  UserCheck,
  IndianRupee,
  Sparkles,
  ChevronRight,
  X
} from "lucide-react";
import { getLiveCustomers } from "@/lib/salonStore";
import { Customer } from "@/types/salon";

export default function CustomersCRMPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      const data = await getLiveCustomers();
      setCustomers(data);
      setLoading(false);
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber.includes(searchTerm) ||
    c.whatsappNumber.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading customer profiles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              CRM Directory
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Customer Profiles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time customer profiles, visit history & loyalty points from Supabase
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            {customers.length} Profiles
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer by name, mobile or WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 transition"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 pt-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Customer</th>
                <th className="pb-3 pt-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">WhatsApp Phone</th>
                <th className="pb-3 pt-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Visits & Spend</th>
                <th className="pb-3 pt-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Loyalty Points</th>
                <th className="pb-3 pt-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fav Stylist</th>
                <th className="pb-3 pt-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No customers found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">{c.name}</span>
                            {c.isVip && (
                              <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center gap-1 uppercase">
                                <Award className="w-3 h-3" /> VIP
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{c.gender} • Born {c.birthday || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 font-mono text-sm text-slate-900 dark:text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {c.whatsappNumber}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.totalVisits} Visits</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">₹{c.totalSpend.toLocaleString()} Spend</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-sm">
                        <Award className="w-4 h-4" />
                        <span>{c.loyaltyPoints} pts</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {c.favouriteBarberName || "—"}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 transition border border-slate-200 dark:border-slate-700"
                      >
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full max-w-md w-full p-6 space-y-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Customer Profile
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[14px] bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">{selectedCustomer.whatsappNumber}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Member since {selectedCustomer.createdAt.split("T")[0]}</span>
              </div>
            </div>

            {/* Loyalty Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loyalty Balance</span>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{selectedCustomer.loyaltyPoints} Points</div>
              </div>
              <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lifetime Spend</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{selectedCustomer.totalSpend}</div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Stylist Preferences & Notes
              </label>
              <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCustomer.notes || "No specific styling preferences noted yet."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
