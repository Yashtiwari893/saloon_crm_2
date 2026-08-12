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
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              Calendar & Queue
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Bookings & Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time appointment schedule connected to Supabase Database
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mode Switcher */}
          <div className="p-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                viewMode === "calendar"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Walk-In Booking
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by customer, phone or booking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Barber Filter */}
          <select
            value={selectedBarberFilter}
            onChange={(e) => setSelectedBarberFilter(e.target.value)}
            className="h-11 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Stylists</option>
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
            className="h-11 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
        <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Today: {new Date().toDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarView("day")}
                className={`px-3 py-1 text-xs font-semibold rounded-[8px] transition ${
                  calendarView === "day" ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                Day
              </button>
            </div>
          </div>

          {/* Barber Timetable Schedule Matrix */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px] divide-y divide-slate-200 dark:divide-slate-800">
              {/* Header Barbers */}
              <div className="grid grid-cols-5 gap-4 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <div>Time Slot</div>
                {barbers.map((barber) => (
                  <div key={barber.id} className="flex items-center gap-2">
                    <img src={barber.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                    <span className="text-slate-900 dark:text-white font-semibold">{barber.name}</span>
                  </div>
                ))}
              </div>

              {/* Time Rows */}
              {["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"].map((slotTime) => (
                <div key={slotTime} className="grid grid-cols-5 gap-4 py-4 items-start">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {slotTime}
                  </div>

                  {barbers.map((barber) => {
                    const matchBooking = filteredBookings.find(
                      (b) => b.barberId === barber.id
                    );

                    return (
                      <div key={barber.id} className="min-h-[70px]">
                        {matchBooking && slotTime.includes("04:00") ? (
                          <div className="p-3 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white">
                              <span>{matchBooking.customerName}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹{matchBooking.totalPrice}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate">
                              {matchBooking.services?.[0]?.serviceName || matchBooking.serviceName || "Haircut"}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                                matchBooking.status === "confirmed"
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : matchBooking.status === "in_progress"
                                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              }`}>
                                {matchBooking.status}
                              </span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">{matchBooking.bookingCode}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full rounded-[10px] border border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
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
        <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="py-12 px-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Bookings Found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  Adjust your filters or create a new walk-in booking.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Booking
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-sm">
                    {b.startTime}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.customerName}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{b.customerPhone}</span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider ${
                          b.status === "confirmed"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : b.status === "in_progress"
                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                            : b.status === "completed"
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                            : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>Stylist: <strong className="text-slate-700 dark:text-slate-200">{b.barberName}</strong></span>
                      <span>•</span>
                      <span>Services: <strong className="text-slate-700 dark:text-slate-200">{(b.services ?? []).map((s) => s.serviceName).join(", ") || b.serviceName || "Haircut"}</strong></span>
                      <span>•</span>
                      <span>Code: <strong className="text-slate-700 dark:text-slate-200 font-mono">{b.bookingCode}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="text-right pr-4">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{b.totalPrice}</div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">{b.source}</span>
                  </div>

                  {b.status === "confirmed" && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, "in_progress")}
                      className="px-3 py-1.5 rounded-[8px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 flex items-center gap-1 transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Start
                    </button>
                  )}

                  {b.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, "completed")}
                      className="px-3 py-1.5 rounded-[8px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </button>
                  )}

                  {b.status !== "cancelled" && b.status !== "completed" && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, "cancelled")}
                      className="px-3 py-1.5 rounded-[8px] bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* WALK-IN NEW BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> New Walk-In Appointment
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Varma"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="+919876543210"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Service</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign Stylist</label>
                  <select
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Slot</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition mt-2"
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
