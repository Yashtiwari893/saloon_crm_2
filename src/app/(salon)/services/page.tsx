"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors,
  Plus,
  Clock,
  IndianRupee,
  Sparkles,
  Tag,
  Users,
  Edit2,
  Trash2,
  X
} from "lucide-react";
import { getLiveServices, createLiveService } from "@/lib/salonStore";
import { Service } from "@/types/salon";

export default function ServiceCatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Add Service Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hair");
  const [price, setPrice] = useState("450");
  const [discountPrice, setDiscountPrice] = useState("399");
  const [duration, setDuration] = useState("30");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadServices() {
      const data = await getLiveServices();
      setServices(data);
      setLoading(false);
    }
    loadServices();
  }, []);

  const categories: string[] = ["All", "Hair", "Beard", "Facial", "Spa", "Massage", "Combo"];

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createLiveService({
      name,
      category,
      price: parseFloat(price) || 300,
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      durationMinutes: parseInt(duration, 10) || 30,
      description,
    });

    if (res.success) {
      const updated = await getLiveServices();
      setServices(updated);
      setIsModalOpen(false);
      setName("");
      setDescription("");
    } else {
      alert(res.error || "Failed to create service.");
    }
  };

  const filteredServices = services.filter(
    (s) => selectedCategory === "All" || s.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading service catalog...</span>
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
              Service Catalog
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Services & Pricing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time catalog with durations, prices & discounts
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Cards Grid or Empty State */}
      {filteredServices.length === 0 ? (
        <div className="py-12 px-4 rounded-[14px] bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <Scissors className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Services Added Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Add your salon's services & pricing so WhatsApp clients can browse and book appointments.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-4 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Service Image Banner */}
              <div className="relative h-36 overflow-hidden group">
                <img
                  src={service.imageUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&auto=format&fit=crop&q=80"}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {service.isPopular && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-[8px] bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 fill-white" /> Popular
                  </span>
                )}
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-[8px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700">
                  {service.durationMinutes} mins
                </span>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                {/* Title & Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/20">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{service.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{service.description}</p>
                </div>

                {/* Price */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">₹{service.discountPrice || service.price}</span>
                      {service.discountPrice && (
                        <span className="text-xs text-slate-400 line-through ml-2">₹{service.price}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Active</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Add New Service
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haircut & Wash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Beard">Beard</option>
                    <option value="Facial">Facial</option>
                    <option value="Spa">Spa</option>
                    <option value="Massage">Massage</option>
                    <option value="Combo">Combo</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Duration (Mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Standard Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Offer Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Service details and finish..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition mt-2"
              >
                Save Service
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
