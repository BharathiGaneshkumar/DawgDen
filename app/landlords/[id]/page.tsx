"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Building2, MapPin, Search, Bot } from "lucide-react";

interface LandlordProfile {
  id: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
  stats: {
    trustScore: number;
    avgRating: number;
    depositReturnRate: number;
    avgMaintenance: number;
    totalReviews: number;
  };
  listings: any[];
  reviews: any[];
}

export default function LandlordProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [summary, setSummary] = useState<string>("Loading AI summary...");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      // Fetch profile
      fetch(`/api/landlords/${p.id}`)
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // Fetch AI summary
      fetch(`/api/landlords/${p.id}/summary`)
        .then((r) => r.json())
        .then((data) => {
          setSummary(data.summary || "No summary available.");
        });
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile || profile.error) {
    return <div className="text-center py-20 text-gray-400">Landlord not found.</div>;
  }

  const filteredReviews = profile.reviews.filter((r) => 
    r.reviewText.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-8">
        <div className="flex items-center gap-5">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/20 text-2xl font-bold text-blue-400 border border-blue-500/30">
              {profile.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              {profile.name}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-sm font-medium text-blue-400">
                <Building2 size={16} /> Landlord
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Trust Score */}
        <div className="flex gap-6 rounded-xl border border-white/5 bg-white/5 p-5">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-indigo-400">
              {profile.stats.trustScore}
            </div>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Trust Score</div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex flex-col justify-center space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-24">Avg Rating</span>
              <span className="font-semibold text-white flex items-center gap-1">
                {profile.stats.avgRating} <Star size={12} className="text-yellow-400 fill-yellow-400" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-24">Deposit Return</span>
              <span className="font-semibold text-emerald-400">{profile.stats.depositReturnRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-indigo-500/5 p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-violet-500/10">
          <Bot size={150} />
        </div>
        <div className="relative z-10">
          <h2 className="text-lg font-semibold text-violet-300 flex items-center gap-2 mb-3">
            <Bot size={20} /> AI Summary
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">
            {summary}
          </p>
        </div>
      </div>

      {/* Two columns: Listings & Reviews */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Active Listings Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Active Listings ({profile.listings.length})</h2>
          <div className="space-y-4">
            {profile.listings.map((listing: any) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="group block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <div className="aspect-video w-full rounded-lg bg-gray-800 mb-3 overflow-hidden">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600"><MapPin size={24} /></div>
                  )}
                </div>
                <div className="font-medium text-white truncate">{listing.title}</div>
                <div className="text-violet-400 font-semibold mt-1">${listing.rent}/mo</div>
                <div className="text-xs text-gray-500 mt-1 truncate">{listing.address}</div>
              </Link>
            ))}
            {profile.listings.length === 0 && (
              <p className="text-sm text-gray-500">No active listings.</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Tenant Reviews ({profile.stats.totalReviews})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full border border-white/10 bg-white/5 pl-9 pr-4 py-1.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {filteredReviews.map((review: any) => (
              <div key={review.id} className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white">
                      {review.user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm flex items-center gap-2">
                        {review.user?.name || review.user?.email}
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">✓ Verified UW Student</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg">
                    <span className="text-sm font-bold text-white">{review.rating}</span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 leading-relaxed">
                  {review.reviewText}
                </p>

                <div className="flex gap-4 pt-3 border-t border-white/5 mt-3">
                  <div className="text-xs text-gray-400">
                    <span className="text-gray-500">Deposit Returned:</span> {review.depositReturned ? "Yes" : "No"}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="text-gray-500">Maintenance:</span> {review.maintenanceRating}/5
                  </div>
                </div>
              </div>
            ))}
            
            {filteredReviews.length === 0 && (
              <div className="text-center py-10 border border-white/5 rounded-xl border-dashed">
                <p className="text-gray-500 text-sm">No reviews found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
