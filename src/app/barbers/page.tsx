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
          <div className="w-9 h-9 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading barber staff profiles from Supabase...</span>
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
            <UserCheck className="w-6 h-6 text-rose-500" />
            Barber & Staff Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage real barber shifts, status toggles, working hours & onboard new staff to Supabase
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Barber
        </button>
      </div>

      {barbers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Barbers Onboarded Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Add your salon's real barber staff to enable real-time slot checking on WhatsApp!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Onboard First Barber
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4 relative overflow-hidden"
            >
              {/* Top Barber Profile Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={barber.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={barber.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-rose-500/20"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {barber.name}
                      <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {barber.rating}
                      </span>
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">{barber.experienceYears} Years Experience</span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{barber.bio}</p>
                  </div>
                </div>
              </div>

              {/* Status Control Buttons */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400">Current Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleBarberStatus(barber.id, "active")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      barber.status === "active"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    On Duty
                  </button>
                  <button
                    onClick={() => toggleBarberStatus(barber.id, "on_break")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      barber.status === "on_break"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    On Break
                  </button>
                  <button
                    onClick={() => toggleBarberStatus(barber.id, "off")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      barber.status === "off"
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Off Today
                  </button>
                </div>
              </div>

              {/* Shift & Weekly Off Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" /> Working Hours
                  </span>
                  <p className="font-bold text-white">{barber.startTime} - {barber.endTime}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <CalendarOff className="w-3.5 h-3.5 text-amber-500" /> Weekly Off
                  </span>
                  <p className="font-bold text-amber-400">{getDayName(barber.weeklyOffDay)}s</p>
                </div>
              </div>

              {/* Skills Tag Cloud */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400">Specialist Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {barber.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" /> Onboard Real Barber Staff
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBarber} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Barber Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+919820011223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Haircut, Beard Trim, Facial"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Short Bio</label>
                <textarea
                  rows={2}
                  placeholder="Senior Hair Stylist with experience in modern fades..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all mt-2"
              >
                Save Barber to Supabase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
