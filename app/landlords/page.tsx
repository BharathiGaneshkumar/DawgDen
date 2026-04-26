"use client";

import { useState, useEffect } from "react";
import { Search, Star, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function LandlordsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [landlords, setLandlords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchLandlords = async () => {
      setLoading(true);
      try {
        const url = debouncedSearch ? `/api/landlords?search=${encodeURIComponent(debouncedSearch)}` : "/api/landlords";
        const res = await fetch(url);
        const data = await res.json();
        setLandlords(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLandlords();
  }, [debouncedSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">⭐ Landlord Reviews</h1>
          <p className="mt-2 text-gray-400">Real reviews from UW Bothell students</p>
        </div>
        
        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4 justify-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search landlords..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Landlord Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : landlords.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No landlords found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {landlords.map((landlord) => (
            <Link 
              key={landlord.id}
              href={`/landlords/${landlord.id}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {landlord.avatarUrl ? (
                    <img src={landlord.avatarUrl} alt={landlord.name} className="h-12 w-12 rounded-full object-cover border-2 border-white/10 shadow-lg" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 font-bold border-2 border-white/10">
                      {landlord.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                      {landlord.name || landlord.email}
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">Joined {new Date(landlord.createdAt).getFullYear()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 relative">
                <MessageSquare className="absolute -left-1 -top-1 h-5 w-5 text-violet-400/20 rotate-180" />
                <p className="pl-6 text-sm text-gray-300 italic leading-relaxed">
                  Click to view full profile, trust score, and AI-generated summary based on verified student reviews.
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
