"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import NewListingModal from "@/components/modals/NewListingModal";

const BEDROOM_FILTERS = ["All", "1 BR", "2 BR", "3+ BR"];

const affordabilityBadge = (rent: number) => {
  if (rent < 1200) return { label: "✅ Affordable", cls: "bg-emerald-100 border border-emerald-300 text-emerald-800" };
  if (rent < 2000) return { label: "⚠️ Moderate", cls: "bg-yellow-100 border border-yellow-300 text-yellow-800" };
  return { label: "❌ Expensive", cls: "bg-red-100 border border-red-300 text-red-800" };
};

export default function ListingsPage() {
  const { user } = useUser();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bedroomFilter, setBedroomFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"none" | "lowToHigh" | "highToLow">("none");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(h);
  }, [search]);

  const fetchListings = async () => {
    setLoading(true);
    let url = "/api/listings?";
    if (bedroomFilter === "1 BR") url += "bedrooms=1&";
    else if (bedroomFilter === "2 BR") url += "bedrooms=2&";
    else if (bedroomFilter === "3+ BR") url += "minBedrooms=3&";
    if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}&`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setListings(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [debouncedSearch, bedroomFilter]);

  const sorted = [...listings].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.rent - b.rent;
    if (sortOrder === "highToLow") return b.rent - a.rent;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 min-h-[calc(100vh-64px)]">
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">🏘️ Listings</h1>
          <p className="mt-2 text-gray-400">Student-verified housing near UW Bothell</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4 justify-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
          {user ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/40"
            >
              + Post a Listing
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto shrink-0 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/10 text-center"
            >
              Sign in to list
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {BEDROOM_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setBedroomFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                bedroomFilter === f
                  ? "border-violet-500 bg-violet-500/10 text-violet-400"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none focus:border-violet-500 cursor-pointer [&>option]:bg-gray-900"
          >
            <option value="none">Newest</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="py-20 text-center text-gray-500">No listings found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((listing) => {
            const badge = affordabilityBadge(listing.rent);
            return (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 transition-all hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/10 flex flex-col h-full"
              >
                <div className="mb-4 h-40 rounded-xl bg-gray-800 overflow-hidden shrink-0">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">🏠</div>
                  )}
                </div>
                <div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                </div>
                <h2 className="mt-3 text-lg font-bold text-white group-hover:text-violet-300 transition-colors">{listing.title}</h2>
                <p className="mt-1 text-sm text-gray-400 mb-4">📍 {listing.address}</p>
                <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-2xl font-bold text-white">${listing.rent.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></span>
                  <span className="text-sm font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">🛏 {listing.bedrooms} bed</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <NewListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { fetchListings(); setIsModalOpen(false); }}
      />
    </div>
  );
}
