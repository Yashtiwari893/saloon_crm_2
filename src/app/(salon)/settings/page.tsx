"use client";

import React, { useState } from "react";
import { Settings, Store, Key, Bot, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [salonName, setSalonName] = useState("Velvet Cut & Style Lounge");
  const [phone, setPhone] = useState("+919876543210");
  const [authToken, setAuthToken] = useState("11za_token_live_984128");
  const [origin, setOrigin] = useState("https://velvetcut.com");
  const [customPrompt, setCustomPrompt] = useState("Always offer tea/coffee on appointments over ₹500.");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-500" />
            Salon Settings & WhatsApp Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure business details, 11za WhatsApp credentials & AI Chatbot instructions
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Salon Details */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-rose-500" /> General Salon Profile
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Salon Name</label>
              <input
                type="text"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Business WhatsApp Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* 11za Credentials */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" /> 11za WhatsApp API Credentials
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">11za Auth Token</label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">11za Origin Website</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* AI System Prompt */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400" /> AI Chatbot Custom Guidelines
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Additional Bot Instructions</label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all flex items-center gap-2"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          {saved ? "Settings Saved Successfully!" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
