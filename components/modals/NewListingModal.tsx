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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-white">Create Listing</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-300">Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Rent ($/mo)</label>
              <input required type="number" name="rent" value={formData.rent} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Address</label>
              <input required name="address" value={formData.address} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Bedrooms</label>
              <input required type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Bathrooms</label>
              <input required type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Lease Length (mo)</label>
              <input required type="number" name="leaseLength" value={formData.leaseLength} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Security Deposit ($)</label>
              <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Available From</label>
              <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white [color-scheme:dark]" />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Image URL</label>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
              <textarea required name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white" />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-300">Amenities</label>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                {Object.keys(amenities).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={amenities[key as keyof typeof amenities]} 
                      onChange={() => handleAmenityChange(key as keyof typeof amenities)}
                      className="rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-300">
                <input 
                  type="checkbox" 
                  checked={utilitiesIncluded} 
                  onChange={(e) => setUtilitiesIncluded(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
                />
                Utilities Included in Rent
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Listing"}
              <Home size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
