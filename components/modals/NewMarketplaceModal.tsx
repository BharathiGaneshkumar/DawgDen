"use client";

import { useState } from "react";
import { X, Tag } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewMarketplaceModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Furniture");
  const [contactInfo, setContactInfo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !price || !contactInfo) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          category,
          contactInfo,
          imageUrl: imageUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post item");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-2xl p-2 text-primary/40 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary leading-tight">Sell an Item</h2>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Student Marketplace</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Item name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Price ($)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
              >
                {["Furniture", "Electronics", "Appliances", "Books", "Clothing", "Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Contact Info</label>
              <input
                required
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Phone or Instagram"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Image URL (Optional)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="Details about condition, pickup, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              {loading ? "Posting..." : "Post Item"}
              {!loading && <Tag size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
