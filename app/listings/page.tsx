"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

const BEDROOM_FILTERS = ["All", "1 BR", "2 BR", "3+ BR", "Under $1500"];

export default function ListingsPage() {
  const { user } = useUser();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"none" | "lowToHigh" | "highToLow">("none");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchListings = async () => {
    setLoading(true);
    let url = "/api/listings?";
    if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}&`;
    if (activeFilter === "1 BR") url += "bedrooms=1&";
    else if (activeFilter === "2 BR") url += "bedrooms=2&";
    else if (activeFilter === "3+ BR") url += "minBedrooms=3&";
    else if (activeFilter === "Under $1500") url += "maxRent=1500&";
    try {
      const res = await fetch(url);
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeFilter]);

  const sortedListings = [...listings].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.rent - b.rent;
    if (sortOrder === "highToLow") return b.rent - a.rent;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 min-h-[calc(100vh-64px)]">
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-primary">🏘️ Listings</h1>
          <p className="mt-2 text-primary/70 font-medium">Student-verified housing near UW Bothell</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4 justify-center">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md py-3.5 pl-12 pr-4 text-sm text-primary placeholder:text-primary/40 focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
            />
          </div>
          {user ? (
            <Link
              href="/listings/new"
              className="w-full sm:w-auto shrink-0 rounded-2xl bg-primary px-8 py-3.5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 text-center"
            >
              + Post a Listing
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto shrink-0 rounded-2xl border border-primary/20 bg-white/40 backdrop-blur-md px-8 py-3.5 font-bold text-primary transition-all hover:bg-white/60 text-center"
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
              onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-5 py-2 text-sm font-bold transition-all ${
                activeFilter === f
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                  : "border-primary/10 bg-white/40 text-primary/60 hover:border-primary/30 hover:bg-white/60"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary/40">Sort by</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="rounded-xl border border-primary/10 bg-white/40 px-3 py-2 text-sm font-bold text-primary focus:outline-none cursor-pointer"
          >
            <option value="none">Newest</option>
            <option value="lowToHigh">Rent: Low to High</option>
            <option value="highToLow">Rent: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : sortedListings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/20 py-20 text-center">
          <p className="text-primary/40 font-medium text-lg">No listings found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:bg-white/60 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-primary/5 relative">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-primary/20 opacity-50">
                    🏠
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <div className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg">
                    ${listing.rent}/mo
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="rounded-full bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary/60">
                    {listing.bedrooms} Bedroom
                  </span>
                  {listing.isVerified && (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <h2 className="line-clamp-1 text-xl font-bold text-primary group-hover:text-primary transition-colors">
                  {listing.title}
                </h2>
                <p className="mt-1 line-clamp-1 text-sm text-primary/50 font-medium">
                  📍 {listing.address}
                </p>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-primary/5">
                  <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">View Details</span>
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
