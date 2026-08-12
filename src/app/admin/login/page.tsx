"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowRight } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: loginId, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || "Super Admin login failed. Please check your credentials.");
        return;
      }

      if (data.user?.role !== "SUPER_ADMIN") {
        setError("Access denied. Super Admin role required.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setIsLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-8 shadow-2xl shadow-amber-500/5 relative z-10">
        {/* Badge Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 mb-4 shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-8 h-8 text-slate-950 font-bold" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Centralized SaaS Management & Multi-Tenant Control</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Super Admin ID
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your admin ID"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Verifying Master Access...</span>
            ) : (
              <>
                <span>Access Super Admin Panel</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center border-t border-slate-800/80 pt-4">
          <button
            onClick={() => router.push("/login")}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            ← Back to Salon Login
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-slate-600 z-10">
        Authorized personnel only. All access is logged and monitored.
      </p>
    </div>
  );
}
