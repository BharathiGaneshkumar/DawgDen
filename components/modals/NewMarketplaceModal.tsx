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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-gray-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-white">Sell an Item</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
                placeholder="Item name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Price ($)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
              >
                {["Furniture", "Electronics", "Appliances", "Books", "Clothing", "Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Contact Info</label>
              <input
                required
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
                placeholder="Phone or Instagram"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Image URL (Optional)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
              placeholder="Details about condition, pickup, etc."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Item"}
              <Tag size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
