"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Building2,
  Plus,
  Search,
  RefreshCw,
  Power,
  Key,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Sparkles,
} from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [salons, setSalons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    login_id: "",
    password: "",
    role: "SALON_ADMIN",
    salon_id: "",
  });

  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersAndSalons();
  }, []);

  async function fetchUsersAndSalons() {
    setIsLoading(true);
    try {
      const [userRes, salonRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/salons"),
      ]);

      if (userRes.status === 401 || userRes.status === 403) {
        router.push("/admin/login");
        return;
      }

      const userData = await userRes.json();
      const salonData = await salonRes.json();

      if (userData.success) setUsers(userData.users || []);
      if (salonData.success) setSalons(salonData.salons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setActionError(data.error || "Failed to create user");
        return;
      }

      setShowAddModal(false);
      setNewUser({ name: "", email: "", login_id: "", password: "", role: "SALON_ADMIN", salon_id: "" });
      fetchUsersAndSalons();
    } catch (err) {
      setIsSubmitting(false);
      setActionError("Network error");
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      fetchUsersAndSalons();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserForEdit || !resetPasswordInput) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserForEdit.id, password: resetPasswordInput }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setSelectedUserForEdit(null);
        setResetPasswordInput("");
        fetchUsersAndSalons();
      }
    } catch (e) {
      setIsSubmitting(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.loginId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.salonName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Users & Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage system administrators, salon owners, and staff access credentials across tenants
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsersAndSalons}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Users</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              roleFilter === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            All Roles ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter("SUPER_ADMIN")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              roleFilter === "SUPER_ADMIN"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Super Admins ({users.filter((u) => u.role === "SUPER_ADMIN").length})
          </button>
          <button
            onClick={() => setRoleFilter("SALON_ADMIN")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              roleFilter === "SALON_ADMIN"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Salon Admins ({users.filter((u) => u.role === "SALON_ADMIN").length})
          </button>
          <button
            onClick={() => setRoleFilter("SALON_STAFF")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              roleFilter === "SALON_STAFF"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Staff Members ({users.filter((u) => u.role === "SALON_STAFF").length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, login ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
            <span>Loading system users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Login ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Tenant Salon</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-600" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        {u.loginId}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {u.role === "SUPER_ADMIN" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                          <ShieldCheck className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : u.role === "SALON_ADMIN" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase">
                          <Building2 className="w-3 h-3" />
                          Salon Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                          <User className="w-3 h-3" />
                          Staff
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-slate-300">
                      {u.salonName}
                    </td>

                    <td className="py-4 px-4">
                      {u.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUserForEdit(u)}
                          title="Reset Password"
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          title={u.status === "active" ? "Deactivate User" : "Activate User"}
                          className={`p-1.5 rounded-xl border transition ${
                            u.status === "active"
                              ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Onboard New System User</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@salon.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Login ID *</label>
                  <input
                    type="text"
                    required
                    value={newUser.login_id}
                    onChange={(e) => setNewUser({ ...newUser, login_id: e.target.value })}
                    placeholder="john_admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="SALON_ADMIN">Salon Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SALON_STAFF">Salon Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Assign Salon</label>
                  <select
                    value={newUser.salon_id}
                    onChange={(e) => setNewUser({ ...newUser, salon_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">None (Super Admin)</option>
                    {salons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Reset Password: {selectedUserForEdit.name}</span>
              </h3>
              <button onClick={() => setSelectedUserForEdit(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="w-1/2 bg-slate-800 text-slate-300 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
