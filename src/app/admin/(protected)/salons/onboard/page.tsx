"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Phone,
  Key,
  MapPin,
  Calendar,
  AlertCircle,
  Scissors,
  Check,
} from "lucide-react";
import { formatPhoneDisplay, normalizePhoneNumber } from "@/lib/phoneNormalizer";

export default function MasterSalonOnboardingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 9-Step Onboarding Form Payload
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    salon_name: "",
    owner_name: "",
    business_category: "Unisex Hair & Beauty Salon",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
    // Step 2: Account & Credentials
    login_id: "",
    password: "",
    email: "",
    phone_number: "",
    // Step 3: Branches
    branch_name: "Main Branch",
    branch_address: "",
    // Step 4: Common Subscription
    subscription_fee: 2999,
    billing_cycle: "monthly",
    subscription_start_date: new Date().toISOString().split("T")[0],
    // Step 5: WhatsApp API Config
    whatsapp_account_id: "11ZA-ACC-893",
    whatsapp_phone_id: "11ZA-PHONE-893",
    whatsapp_auth_token: "11za_token_demo_sec",
    // Step 6: Templates
    templates: ["Appointment Confirmation", "Arrival Reminder", "Rating Request", "Birthday Surprise"],
    // Step 7: Initial Payment
    payment_method: "upi",
    transaction_id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
  });

  const steps = [
    { num: 1, title: "Salon Details" },
    { num: 2, title: "Admin Account" },
    { num: 3, title: "Branches" },
    { num: 4, title: "Common Subscription" },
    { num: 5, title: "WhatsApp API" },
    { num: 6, title: "Templates" },
    { num: 7, title: "Payment Check" },
    { num: 8, title: "Review" },
    { num: 9, title: "Activation" },
  ];

  function handleNext() {
    setErrorMessage(null);

    // Validation checks per step
    if (currentStep === 1 && !formData.salon_name) {
      setErrorMessage("Salon Name is required");
      return;
    }
    if (currentStep === 2) {
      if (!formData.login_id || !formData.password || !formData.phone_number) {
        setErrorMessage("Login ID, Password, and Phone Number are required");
        return;
      }
    }

    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handlePrev() {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  async function handleCompleteActivation(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/salons/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Onboarding activation failed");
        return;
      }

      setCurrentStep(9); // Move to final activation confirmation screen
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage("Connection error to server");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/salons" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-1">
            <ChevronLeft className="w-4 h-4" /> Back to Salons Directory
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Salon Onboarding Wizard</span>
          </h1>
        </div>

        <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          Step {currentStep} of 9
        </span>
      </div>

      {/* Wizard Step Progress Tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition ${
                  currentStep === s.num
                    ? "bg-blue-600 text-white shadow-sm"
                    : currentStep > s.num
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${currentStep === s.num ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
                {s.title}
              </span>
              {s.num < 9 && <span className="w-4 h-px bg-slate-200 dark:bg-slate-800 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-[10px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* STEP CONTENT BODY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] p-6 sm:p-8 shadow-sm space-y-6">
        {/* STEP 1: SALON DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Step 1: Salon Basic Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salon Name *</label>
                <input
                  type="text"
                  required
                  value={formData.salon_name}
                  onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
                  placeholder="e.g. Royal Cut Lounge"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owner Full Name</label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Shop 12, Main Market, Vesu, Surat"
                className="w-full p-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>
          </div>
        )}

        {/* STEP 2: ADMIN CREDENTIALS */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Step 2: Salon Admin Account & Phone Normalization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salon Admin Login ID *</label>
                <input
                  type="text"
                  required
                  value={formData.login_id}
                  onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
                  placeholder="e.g. royal_cut"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Set admin password"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="e.g. 919819988776 or 9819988776"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
                {formData.phone_number && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono font-semibold">
                    Normalized: {formatPhoneDisplay(formData.phone_number)}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Admin Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@royalcut.com"
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: COMMON SUBSCRIPTION */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Step 4: Assign Single Common Subscription Plan
            </h3>

            <div className="p-4 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
              <p className="font-bold">Unified Platform Subscription</p>
              <p>All salons receive full features under the single common subscription model.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Subscription Fee (₹)</label>
                <input
                  type="number"
                  value={formData.subscription_fee}
                  onChange={(e) => setFormData({ ...formData, subscription_fee: Number(e.target.value) })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Billing Cycle</label>
                <select
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                >
                  <option value="monthly">Monthly Billing (₹2,999/mo)</option>
                  <option value="annual">Annual Billing (₹29,999/yr)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: FINAL REVIEW */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Step 8: Final Review & Validation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-semibold">Salon Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{formData.salon_name}</p>
                <p className="text-slate-500 dark:text-slate-400">{formData.city}, {formData.state}</p>
              </div>

              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-semibold">Admin Login & Phone</span>
                <p className="font-mono text-blue-600 dark:text-blue-400 font-bold">{formData.login_id}</p>
                <p className="font-mono text-slate-700 dark:text-slate-300">{formatPhoneDisplay(formData.phone_number)}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleCompleteActivation}
                disabled={isSubmitting}
                className="h-11 px-6 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? "Activating Tenant..." : "Confirm & Activate Salon"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 9: ACTIVATION SUCCESS */}
        {currentStep === 9 && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Salon Successfully Activated!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Salon <strong className="text-slate-900 dark:text-white">{formData.salon_name}</strong> has been onboarded and auto-provisioned with default barbers, services catalog, and WhatsApp integration.
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/admin/salons"
                className="h-11 px-6 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center"
              >
                Back to Salons Directory
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Actions Footer */}
        {currentStep < 9 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="h-11 px-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>

            {currentStep < 8 && (
              <button
                type="button"
                onClick={handleNext}
                className="h-11 px-6 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
