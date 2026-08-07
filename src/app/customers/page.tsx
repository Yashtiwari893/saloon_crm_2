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
          <div className="w-9 h-9 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading customer profiles from Supabase...</span>
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
            <Users className="w-6 h-6 text-rose-500" />
            Customer Relationship Management (CRM)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time customer profiles, visit history & loyalty points from Supabase
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Total {customers.length} Profiles
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer by name, mobile or WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3">WhatsApp Phone</th>
                <th className="pb-3 px-3">Visits & Spend</th>
                <th className="pb-3 px-3">Loyalty Points</th>
                <th className="pb-3 px-3">Fav Barber</th>
                <th className="pb-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{c.name}</span>
                          {c.isVip && (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Award className="w-3 h-3" /> VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{c.gender} • Born {c.birthday || "N/A"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2 font-mono text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {c.whatsappNumber}
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <div className="font-bold text-white">{c.totalVisits} Visits</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">₹{c.totalSpend.toLocaleString()} Total Spend</div>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 font-extrabold text-amber-400">
                      <Award className="w-4 h-4" />
                      <span>{c.loyaltyPoints} pts</span>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-slate-300 font-medium">
                    {c.favouriteBarberName || "Rahul Sharma"}
                  </td>

                  <td className="py-4 px-3">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      View Profile <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-slate-900 border-l border-slate-800 h-full max-w-md w-full p-6 space-y-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-500" /> Customer Profile
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{selectedCustomer.name}</h4>
                <p className="text-xs text-emerald-400 font-semibold">{selectedCustomer.whatsappNumber}</p>
                <span className="text-[11px] text-slate-400">Member since {selectedCustomer.createdAt.split("T")[0]}</span>
              </div>
            </div>

            {/* Loyalty Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Loyalty Balance</span>
                <div className="text-xl font-black text-amber-400">{selectedCustomer.loyaltyPoints} Points</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lifetime Spend</span>
                <div className="text-xl font-black text-emerald-400">₹{selectedCustomer.totalSpend}</div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" /> Barber Preferences & Notes
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {selectedCustomer.notes || "No specific styling preferences noted yet."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
