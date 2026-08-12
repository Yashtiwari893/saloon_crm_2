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
          <div className="w-9 h-9 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading service catalog from Supabase...</span>
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
            <Scissors className="w-6 h-6 text-rose-500" />
            Salon Services & Pricing Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time catalog, durations, prices & discounts from Supabase Database
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Cards Grid or Empty State */}
      {filteredServices.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Scissors className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Services Added Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Add your salon's real services & pricing so WhatsApp clients can browse and book appointments!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Service Image Banner */}
                <div className="relative h-36 rounded-2xl overflow-hidden group">
                  <img
                    src={service.imageUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&auto=format&fit=crop&q=80"}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {service.isPopular && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-rose-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 fill-white" /> Popular Choice
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 font-extrabold text-xs">
                    {service.durationMinutes} mins
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{service.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{service.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-white">₹{service.discountPrice || service.price}</span>
                    {service.discountPrice && (
                      <span className="text-xs text-slate-500 line-through ml-2">₹{service.price}</span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">Active Service</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" /> Add Real Service to Supabase
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haircut & Wash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Beard">Beard</option>
                    <option value="Facial">Facial</option>
                    <option value="Spa">Spa</option>
                    <option value="Massage">Massage</option>
                    <option value="Combo">Combo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Duration (Mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Standard Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Offer Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Service details and finish..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all mt-2"
              >
                Save Service to Supabase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
