"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Star,
  Clock,
  Calendar,
  Scissors,
  Plus,
  Coffee,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  CalendarOff,
  X
} from "lucide-react";
import { getLiveBarbers, updateLiveBarberStatus, createLiveBarber } from "@/lib/salonStore";
import { Barber, BarberStatus } from "@/types/salon";

export default function BarbersManagementPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Barber Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("3");
  const [skillsStr, setSkillsStr] = useState("Haircut, Beard Trim");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadBarbers() {
      const data = await getLiveBarbers();
      setBarbers(data);
      setLoading(false);
    }
    loadBarbers();
  }, []);

  const toggleBarberStatus = async (barberId: string, newStatus: BarberStatus) => {
    setBarbers((prev) =>
      prev.map((b) => (b.id === barberId ? { ...b, status: newStatus } : b))
    );
    await updateLiveBarberStatus(barberId, newStatus);
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);

    const res = await createLiveBarber({
      name,
      phoneNumber: phone,
      experienceYears: parseFloat(experience) || 3,
      skills,
      bio,
    });

    if (res.success) {
      const updated = await getLiveBarbers();
      setBarbers(updated);
      setIsModalOpen(false);
      setName("");
      setPhone("");
      setBio("");
    } else {
      alert(res.error || "Failed to create barber.");
    }
  };

  const getDayName = (dayNum: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum] || "Sunday";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading staff profiles...</span>
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
              Staff Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Barber & Staff Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage shifts, status toggles, working hours & onboard new staff
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {barbers.length === 0 ? (
        <div className="py-12 px-4 rounded-[14px] bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Staff Onboarded Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Add your salon's barber staff to enable real-time slot checking on WhatsApp.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Onboard First Staff
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-4"
            >
              {/* Top Barber Profile Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={barber.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={barber.name}
                    className="w-14 h-14 rounded-[10px] object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {barber.name}
                      <span className="text-amber-500 text-xs font-semibold flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {barber.rating}
                      </span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{barber.experienceYears} Years Experience</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{barber.bio}</p>
                  </div>
                </div>
              </div>

              {/* Status Control Buttons */}
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleBarberStatus(barber.id, "active")}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                      barber.status === "active"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    On Duty
                  </button>
                  <button
                    onClick={() => toggleBarberStatus(barber.id, "on_break")}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                      barber.status === "on_break"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    On Break
                  </button>
                  <button
                    onClick={() => toggleBarberStatus(barber.id, "off")}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                      barber.status === "off"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    Off Today
                  </button>
                </div>
              </div>

              {/* Shift & Weekly Off Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Working Hours
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{barber.startTime} - {barber.endTime}</p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 tracking-wider">
                    <CalendarOff className="w-3.5 h-3.5 text-amber-500" /> Weekly Off
                  </span>
                  <p className="font-bold text-amber-600 dark:text-amber-400">{getDayName(barber.weeklyOffDay)}s</p>
                </div>
              </div>

              {/* Skills Tag Cloud */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {barber.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-[8px] text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD BARBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Onboard Staff Member
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBarber} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Staff Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+919820011223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Haircut, Beard Trim, Facial"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Short Bio</label>
                <textarea
                  rows={2}
                  placeholder="Senior Hair Stylist with experience in modern fades..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition mt-2"
              >
                Save Staff Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
