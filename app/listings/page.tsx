"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with microphone APIs
const VoiceAssistant = dynamic(() => import("@/components/VoiceAssistant"), { ssr: false });

const INITIAL_LISTINGS = [
  { id: 1, title: "Cozy Studio near UWB", rent: 1200, bedrooms: 1, address: "Bothell, WA 98011", affordability: "green", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400" },
  { id: 2, title: "2BR Apartment - Shared", rent: 1800, bedrooms: 2, address: "Kenmore, WA 98028", affordability: "yellow", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400" },
  { id: 3, title: "Modern 1BR Mill Creek", rent: 2200, bedrooms: 1, address: "Mill Creek, WA 98012", affordability: "red", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" },
  { id: 4, title: "3BR House - Split 3 ways", rent: 2700, bedrooms: 3, address: "Bothell, WA 98021", affordability: "green", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400" },
  { id: 5, title: "Luxury 2BR Townhouse", rent: 2500, bedrooms: 2, address: "Woodinville, WA 98072", affordability: "yellow", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400" },
  { id: 6, title: "Shared Room for Student", rent: 750, bedrooms: 1, address: "Bothell, WA 98011", affordability: "green", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" },
];

interface VoiceFilter {
  maxRent?: number;
  minRent?: number;
  bedrooms?: number;
  keyword?: string;
}

export default function ListingsPage() {
  const [sortOrder, setSortOrder] = useState<"none" | "lowToHigh" | "highToLow">("none");
  const [voiceFilter, setVoiceFilter] = useState<VoiceFilter>({});
  const [activeVoiceDesc, setActiveVoiceDesc] = useState<string | null>(null);

  const handleVoiceFilter = (params: VoiceFilter) => {
    setVoiceFilter(params);
    const parts: string[] = [];
    if (params.maxRent) parts.push(`under $${params.maxRent.toLocaleString()}`);
    if (params.minRent) parts.push(`over $${params.minRent.toLocaleString()}`);
    if (params.bedrooms) parts.push(`${params.bedrooms} bed`);
    if (params.keyword) parts.push(`"${params.keyword}"`);
    setActiveVoiceDesc(parts.length ? parts.join(" · ") : null);
  };

  const handleClearFilters = () => {
    setVoiceFilter({});
    setActiveVoiceDesc(null);
  };

  const listings = useMemo(() => {
    let result = [...INITIAL_LISTINGS];

    // Apply voice filters
    if (voiceFilter.maxRent) result = result.filter(l => l.rent <= voiceFilter.maxRent!);
    if (voiceFilter.minRent) result = result.filter(l => l.rent >= voiceFilter.minRent!);
    if (voiceFilter.bedrooms) result = result.filter(l => l.bedrooms === voiceFilter.bedrooms);
    if (voiceFilter.keyword) {
      const kw = voiceFilter.keyword.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(kw) || l.address.toLowerCase().includes(kw)
      );
    }

    // Apply sort
    if (sortOrder === "lowToHigh") result.sort((a, b) => a.rent - b.rent);
    if (sortOrder === "highToLow") result.sort((a, b) => b.rent - a.rent);

    return result;
  }, [voiceFilter, sortOrder]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary">🏘️ Listings</h1>
          <p className="mt-2 text-primary/70">Student-verified housing near UW Bothell</p>
        </div>
        <a href="/listings/new" className="rounded-xl bg-primary text-[#c5b4e3] px-6 py-3 font-semibold shadow-md transition-transform hover:-translate-y-0.5">
          + Post a Listing
        </a>
      </div>

      {/* Voice filter active banner */}
      {activeVoiceDesc && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎙️</span>
            <span className="text-sm font-medium text-primary">
              Voice filter active: <span className="font-bold">{activeVoiceDesc}</span>
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {listings.length} result{listings.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={handleClearFilters}
            className="rounded-lg border border-primary/20 px-3 py-1 text-xs font-medium text-primary/70 hover:bg-primary/10 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {["All", "1 BR", "2 BR", "3+ BR", "Under $1500", "Pet Friendly"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                if (filter === "All") handleClearFilters();
                else if (filter === "Under $1500") handleVoiceFilter({ maxRent: 1500 });
                else if (filter === "1 BR") handleVoiceFilter({ bedrooms: 1 });
                else if (filter === "2 BR") handleVoiceFilter({ bedrooms: 2 });
                else if (filter === "3+ BR") handleVoiceFilter({ minRent: 0, bedrooms: 3 });
              }}
              className="rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-primary/80 transition hover:bg-primary/10 hover:text-primary"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-sm font-bold text-primary/70">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="rounded-xl border border-primary/20 bg-white/80 px-3 py-2 text-sm font-bold text-primary outline-none focus:border-primary/50 cursor-pointer shadow-sm"
          >
            <option value="none">Recommended</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-xl font-bold text-primary mb-2">No listings found</h3>
          <p className="text-primary/60 mb-4">Try adjusting your filters or ask the voice assistant for help.</p>
          <button onClick={handleClearFilters} className="rounded-xl border border-primary/20 px-5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <a key={listing.id} href={`/listings/${listing.id}`}
              className="group rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 transition-all hover:-translate-y-1 hover:border-primary/20 flex flex-col h-full">
              <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-purple-800/40 to-pink-200/40 text-5xl overflow-hidden shrink-0">
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${listing.affordability === "green" ? "bg-emerald-100 border border-emerald-300 text-emerald-800" :
                  listing.affordability === "yellow" ? "bg-yellow-100 border border-yellow-300 text-yellow-800" :
                    "bg-red-100 border border-red-300 text-red-800"
                  }`}>
                  {listing.affordability === "green" ? "✅ Affordable" : listing.affordability === "yellow" ? "⚠️ Moderate" : "❌ Expensive"}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-primary">{listing.title}</h2>
              <p className="mt-1 text-sm text-primary/70 mb-4">📍 {listing.address}</p>
              <div className="mt-auto flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="text-2xl font-bold text-primary">${listing.rent.toLocaleString()}<span className="text-sm font-normal text-primary/70">/mo</span></span>
                <span className="text-sm font-bold text-primary/70 bg-white/80 px-2 py-1 rounded-md border border-primary/10">🛏 {listing.bedrooms} bed</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Floating Voice Assistant */}
      <VoiceAssistant onFilter={handleVoiceFilter} onClear={handleClearFilters} />
    </div>
  );
}
