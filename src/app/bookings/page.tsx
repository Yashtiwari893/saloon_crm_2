"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  Filter,
  User,
  Scissors,
  CheckCircle2,
  XCircle,
  Play,
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import {
  getLiveBookings,
  getLiveBarbers,
  getLiveServices,
  updateLiveBookingStatus,
} from "@/lib/salonStore";
import { createSalonBooking } from "@/lib/salonBookingEngine";
import { Booking, BookingStatus, Barber, Service } from "@/types/salon";

export default function BookingsCalendarPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("day");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBarberFilter, setSelectedBarberFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // New Walk-in Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [bookingTime, setBookingTime] = useState("16:00");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    async function loadData() {
      const [bData, barbData, srvData] = await Promise.all([
        getLiveBookings(),
        getLiveBarbers(),
        getLiveServices(),
      ]);
      setBookings(bData);
      setBarbers(barbData);
      setServices(srvData);
      if (barbData.length > 0) setSelectedBarberId(barbData[0].id);
      if (srvData.length > 0) setSelectedServiceId(srvData[0].id);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    await updateLiveBookingStatus(bookingId, newStatus);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await createSalonBooking({
      customerName: newCustomerName || "Walk-in Customer",
      customerPhone: newCustomerPhone || "+919800000000",
      whatsappNumber: newCustomerPhone || "+919800000000",
      barberId: selectedBarberId,
      serviceId: selectedServiceId,
      bookingDate: bookingDate,
      startTime: bookingTime,
      source: "walk_in",
    });

    if (res.success) {
      const updatedBookings = await getLiveBookings();
      setBookings(updatedBookings);
      setIsModalOpen(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
    } else {
      alert(res.error || "Failed to create booking.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesBarber = selectedBarberFilter === "all" || b.barberId === selectedBarberFilter;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm);
    return matchesBarber && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading bookings from Supabase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-rose-500" />
            Bookings & Calendar Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time appointment schedule connected directly to Supabase Database
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "calendar"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Walk-In Booking
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by customer, phone or booking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Barber Filter */}
          <select
            value={selectedBarberFilter}
            onChange={(e) => setSelectedBarberFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
          >
            <option value="all">All Barbers</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* CALENDAR VIEW MODE */}
      {viewMode === "calendar" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">Today: {new Date().toDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarView("day")}
                className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  calendarView === "day" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                Day
              </button>
            </div>
          </div>

          {/* Barber Timetable Schedule Matrix */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px] divide-y divide-slate-800">
              {/* Header Barbers */}
              <div className="grid grid-cols-5 gap-4 pb-3 text-xs font-bold text-slate-400">
                <div className="text-slate-500">Time Slot</div>
                {barbers.map((barber) => (
                  <div key={barber.id} className="flex items-center gap-2">
                    <img src={barber.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-white">{barber.name}</span>
                  </div>
                ))}
              </div>

              {/* Time Rows */}
              {["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"].map((slotTime) => (
                <div key={slotTime} className="grid grid-cols-5 gap-4 py-4 items-start">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {slotTime}
                  </div>

                  {barbers.map((barber) => {
                    const matchBooking = filteredBookings.find(
                      (b) => b.barberId === barber.id
                    );

                    return (
                      <div key={barber.id} className="min-h-[70px]">
                        {matchBooking && slotTime.includes("04:00") ? (
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-950/60 to-slate-900 border border-rose-500/40 shadow-lg space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-white">
                              <span>{matchBooking.customerName}</span>
                              <span className="text-emerald-400">₹{matchBooking.totalPrice}</span>
                            </div>
                            <p className="text-[10px] text-slate-300 truncate">
                              {matchBooking.services[0]?.serviceName || "Haircut"}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[9px] font-bold text-amber-400 uppercase">
                                {matchBooking.status}
                              </span>
                              <span className="text-[9px] text-slate-400">{matchBooking.bookingCode}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full rounded-2xl border border-dashed border-slate-800 hover:border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-medium cursor-pointer hover:bg-slate-950/40">
                            + Available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIST VIEW MODE */}
      {viewMode === "list" && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="divide-y divide-slate-800">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-rose-400 flex items-center justify-center font-black text-sm shrink-0">
                    {b.startTime}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-white">{b.customerName}</h4>
                      <span className="text-xs text-slate-400">{b.customerPhone}</span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          b.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : b.status === "in_progress"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                            : b.status === "completed"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span>Barber: <strong className="text-slate-200">{b.barberName}</strong></span>
                      <span>•</span>
                      <span>Services: <strong className="text-slate-200">{b.services.map((s) => s.serviceName).join(", ") || "Haircut"}</strong></span>
                      <span>•</span>
                      <span>Code: <strong className="text-slate-200">{b.bookingCode}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="text-right pr-4">
                    <div className="text-base font-black text-emerald-400">₹{b.totalPrice}</div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">{b.source}</span>
                  </div>

                  {b.status === "confirmed" && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, "in_progress")}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" /> Start
                    </button>
                  )}

                  {b.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, "completed")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </button>
                  )}

                  {b.status !== "cancelled" && b.status !== "completed" && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, "cancelled")}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WALK-IN NEW BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" /> New Walk-In Appointment
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Varma"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="+919876543210"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Select Service</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Assign Barber</label>
                  <select
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Time Slot</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all mt-4"
              >
                Confirm Walk-in Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
