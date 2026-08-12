"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors,
  UserCheck,
  Upload,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Image as ImageIcon,
} from "lucide-react";
import { FeatureGate } from "@/lib/features";

export default function BarberStationPage() {
  const [salonData, setSalonData] = useState<any>(null);

  const [selectedTask, setSelectedTask] = useState<any>({
    id: "bk-1",
    customer_name: "Priyansh Sharma",
    phone_number: "+919819988776",
    service_name: "Executive Haircut & Beard Trim",
    scheduled_time: "12:30 PM",
    barber_name: "Stylist Sameer",
    status: "in_chair",
    past_looks: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80",
    ],
  });

  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadSalonData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setSalonData(data.salon || null);
          }
        }
      } catch (e) {
        console.error("Failed to load salon info:", e);
      }
    }
    loadSalonData();
  }, []);

  const handleSimulatePhotoUpload = () => {
    const sampleUrl = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&auto=format&fit=crop&q=80";
    setUploadedPhoto(sampleUrl);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wider">
              Stylist Station Workspace
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Chair Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Stylist Workspace & Finished Look Upload</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View customer's past look photos, perform service, and upload finished look photo with consent.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  P
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTask.customer_name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedTask.phone_number}</span>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                In Chair (Active)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Service Booked</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedTask.service_name}</p>
              </div>
              <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned Stylist</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedTask.barber_name}</p>
              </div>
            </div>

            {/* Finished Look Upload Box wrapped in FeatureGate */}
            <FeatureGate feature="selfie_upload" salon={salonData}>
              <div className="p-5 rounded-[14px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-3 text-center">
                <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload Finished-Look Photo</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-0.5">
                    Save customer's completed hairstyle photo to their profile. A WhatsApp approval trigger will be sent to the customer.
                  </p>
                </div>

                {uploadedPhoto ? (
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <img src={uploadedPhoto} alt="Finished Look" className="w-36 h-36 rounded-[10px] object-cover border-2 border-blue-600 shadow-md" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Photo Uploaded & Saved to Customer Profile
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulatePhotoUpload}
                    className="h-11 px-5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Customer Haircut Photo</span>
                  </button>
                )}
              </div>
            </FeatureGate>
          </div>
        </div>

        {/* Previous Looks Reference wrapped in FeatureGate */}
        <div className="space-y-4">
          <FeatureGate feature="previous_looks" salon={salonData}>
            <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Customer Previous Looks
              </h3>

              {selectedTask.past_looks.map((url: string, idx: number) => (
                <div key={idx} className="space-y-2">
                  <img src={url} alt="Past Look" className="w-full h-48 rounded-[10px] object-cover border border-slate-200 dark:border-slate-700" />
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block text-center">Last Visit: 15 July 2026</span>
                </div>
              ))}
            </div>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
}
