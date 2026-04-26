"use client";

import { useState } from "react";
import { X, Home } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewListingModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    rent: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    description: "",
    imageUrl: "",
    leaseLength: "12",
    deposit: "",
    availableFrom: "",
  });

  const [amenities, setAmenities] = useState({
    wifi: false,
    parking: false,
    laundry: false,
    ac: false,
    petFriendly: false,
    furnished: false,
  });

  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          rent: parseFloat(formData.rent),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          address: formData.address,
          description: formData.description,
          imageUrl: formData.imageUrl || null,
          amenities: Object.keys(amenities).filter((k) => amenities[k as keyof typeof amenities]),
          utilitiesIncluded,
          leaseLength: parseInt(formData.leaseLength),
          deposit: formData.deposit ? parseFloat(formData.deposit) : null,
          availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post listing");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (key: keyof typeof amenities) => {
    setAmenities({ ...amenities, [key]: !amenities[key] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-2xl p-2 text-primary/40 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary leading-tight">Create Listing</h2>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Housing Marketplace</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="E.g. Cozy Studio near UW Bothell" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Rent ($/mo)</label>
              <input required type="number" name="rent" value={formData.rent} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="1200" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Address</label>
              <input required name="address" value={formData.address} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Street address" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Bedrooms</label>
              <input required type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="1" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Bathrooms</label>
              <input required type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="1" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Lease Length (mo)</label>
              <input required type="number" name="leaseLength" value={formData.leaseLength} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Security Deposit ($)</label>
              <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Optional" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Available From</label>
              <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Image URL</label>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="https://..." />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Description</label>
              <textarea required name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full resize-none rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Tell us about the space..." />
            </div>

            <div className="sm:col-span-2 space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Amenities & Utilities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.keys(amenities).map((key) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={amenities[key as keyof typeof amenities]} 
                        onChange={() => handleAmenityChange(key as keyof typeof amenities)}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-primary/10 bg-white/40 transition-all checked:bg-primary checked:border-primary"
                      />
                      <div className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary/60 group-hover:text-primary transition-colors">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={utilitiesIncluded} 
                      onChange={(e) => setUtilitiesIncluded(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-primary/10 bg-white/40 transition-all checked:bg-primary checked:border-primary"
                    />
                    <div className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary/60 group-hover:text-primary transition-colors">
                    Utilities Included
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-white/40 px-6 py-4 font-black text-primary/60 transition-all hover:bg-white/60 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Listing"}
              {!loading && <Home size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
