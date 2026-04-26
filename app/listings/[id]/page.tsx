"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, Wifi, Car, Wind, PawPrint, Sofa, WashingMachine,
  Star, ChevronLeft, Heart, ExternalLink, Users, Loader2,
  Dumbbell, BatteryCharging, Mail, Calendar, Zap, Sparkles,
} from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(n) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
      ))}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
      ✓ Verified UW Student
    </span>
  );
}

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi, parking: Car, laundry: WashingMachine, ac: Wind,
  petFriendly: PawPrint, furnished: Sofa, gym: Dumbbell, evCharging: BatteryCharging,
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: "WiFi", parking: "Parking", laundry: "In-Unit Laundry", ac: "AC",
  petFriendly: "Pet Friendly", furnished: "Furnished", gym: "Gym", evCharging: "EV Charging",
};

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  const canReview = !!(
    user &&
    (user as { isVerified?: boolean }).isVerified &&
    (user as { role?: string }).role === "STUDENT"
  );

  const [id, setId] = useState("");
  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [numPeople, setNumPeople] = useState("1");
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newMaintenance, setNewMaintenance] = useState(3);
  const [newDepositReturned, setNewDepositReturned] = useState(true);
  const [newText, setNewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      Promise.all([
        fetch(`/api/listings/${p.id}`).then((r) => r.json()),
        fetch(`/api/reviews?listingId=${p.id}`).then((r) => r.json()),
      ]).then(([l, rv]) => {
        setListing(l);
        const reviewsData = Array.isArray(rv) ? rv : [];
        setReviews(reviewsData);
        setLoading(false);

        if (reviewsData.length > 0) {
          setSummaryLoading(true);
          fetch(`/api/listings/${p.id}/summary`)
            .then(res => res.json())
            .then(data => setSummary(data.summary))
            .catch(() => setSummary("Failed to load AI summary."))
            .finally(() => setSummaryLoading(false));
        }
      }).catch(() => setLoading(false));
    });
  }, [params]);

  async function handleCalc() {
    if (!listing) return;
    setCalcLoading(true);
    try {
      const res = await fetch("/api/affordability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rent: listing.rent, numPeople: Number(numPeople), utilitiesTotal: 0 }),
      });
      setCalcResult(await res.json());
    } finally {
      setCalcLoading(false);
    }
  }

  async function submitReview() {
    if (!newText.trim() || !listing) return;
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordName: listing.user?.name || listing.user?.email || "Unknown",
          landlordAddress: listing.address,
          rating: newRating,
          depositReturned: newDepositReturned,
          maintenanceRating: newMaintenance,
          reviewText: newText.trim(),
          listingId: id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
      const created = await res.json();
      setReviews((prev) => [{ ...created, user: { name: (user as any)?.name, avatarUrl: (user as any)?.picture } }, ...prev]);
      setNewText("");
      setShowForm(false);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  }

  function submitComment(rid: string) {
    const text = commentInputs[rid]?.trim();
    if (!text) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === rid
          ? { ...r, comments: [...(r.comments || []), { id: `c-${Date.now()}`, content: text, user: { name: (user as any)?.name } }] }
          : r
      )
    );
    setCommentInputs((p) => ({ ...p, [rid]: "" }));
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="animate-spin text-violet-500" size={32} />
    </div>
  );
  if (!listing || listing.error) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Listing not found.</p>
        <Link href="/listings" className="text-sm text-violet-400 hover:underline">← Back to Listings</Link>
      </div>
    </div>
  );

  const amenityList = Object.keys(AMENITY_ICONS).map((key) => ({
    label: AMENITY_LABELS[key] || key,
    icon: AMENITY_ICONS[key],
    on: Array.isArray(listing.amenities) && listing.amenities.includes(key),
  }));

  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : 0;

  const encodedAddress = encodeURIComponent(listing.address);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 min-h-screen space-y-8 relative z-10">
      <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary/60 hover:text-primary transition-colors">
        <ChevronLeft size={16} /> Back to Listings
      </Link>

      {/* Photo Header */}
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-white/40 backdrop-blur-md shadow-xl h-[450px] relative group">
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-primary/20">
            <div className="text-9xl">🏠</div>
            <p className="text-lg font-bold">No photos provided</p>
          </div>
        )}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={() => setSaved((s) => !s)}
            className={`flex items-center gap-2 rounded-2xl border px-6 py-3 font-bold transition-all shadow-lg ${
              saved 
                ? "border-pink-500 bg-pink-500 text-white shadow-pink-500/20" 
                : "border-primary/20 bg-white/80 text-primary hover:bg-white shadow-primary/10"
            }`}
          >
            <Heart size={18} className={saved ? "fill-white" : ""} />
            {saved ? "Saved to Favorites" : "Save Listing"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="rounded-3xl border border-primary/10 bg-white/60 backdrop-blur-md p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary/60">
                    {listing.bedrooms} Bedroom · {listing.bathrooms} Bath
                  </span>
                  {listing.isVerified && <VerifiedBadge />}
                </div>
                <h1 className="text-4xl font-extrabold text-primary leading-tight">{listing.title}</h1>
                <div className="flex items-center gap-2 text-primary/60 font-medium">
                  <MapPin size={16} className="text-primary/40" />
                  {listing.address}
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black text-primary">${listing.rent.toLocaleString()}</p>
                <p className="text-sm font-bold text-primary/40 uppercase tracking-widest mt-1">per month</p>
              </div>
            </div>

            <div className="h-px bg-primary/5" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Lease", value: `${listing.leaseLength} mo`, icon: Calendar },
                { label: "Deposit", value: listing.deposit ? `$${listing.deposit}` : "Free", icon: Zap },
                { label: "Laundry", value: listing.amenities?.includes("laundry") ? "In-Unit" : "Shared", icon: WashingMachine },
                { label: "Parking", value: listing.amenities?.includes("parking") ? "Available" : "No", icon: Car },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl bg-primary/5 p-4 border border-primary/5">
                  <div className="flex items-center gap-2 text-primary/40 mb-1">
                    <Icon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                  </div>
                  <p className="font-bold text-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-3xl border border-primary/10 bg-white/40 p-8 space-y-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📝</span>
              About this place
            </h2>
            <p className="text-primary/80 leading-relaxed font-medium">
              {listing.description || "No description provided."}
            </p>
            
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenityList.map(({ label, icon: Icon, on }) => (
                <div key={label} className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all ${
                  on ? "border-primary/20 bg-white/60 text-primary" : "border-primary/5 bg-primary/5 text-primary/20 opacity-50"
                }`}>
                  <Icon size={16} />
                  <span className="text-xs font-bold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="rounded-3xl border border-primary/10 bg-white/40 overflow-hidden shadow-sm">
            <div className="p-6 bg-white/20 border-b border-primary/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Location
              </h2>
              <a
                href={`https://www.google.com/maps/dir/University+of+Washington+Bothell,+Bothell+WA/${encodedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
              >
                Directions from Campus
              </a>
            </div>
            <div className="h-[350px] w-full">
              <iframe
                title="Location map"
                width="100%"
                height="100%"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
                className="grayscale-[0.5] contrast-[1.1]"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8 sticky top-24">
          {/* Landlord Profile Card */}
          <div className="rounded-3xl border border-primary/20 bg-white/80 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/20 overflow-hidden">
                {listing.user?.avatarUrl ? (
                  <img src={listing.user.avatarUrl} className="h-full w-full object-cover" />
                ) : (
                  (listing.user?.name || listing.user?.email || "?")[0].toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Posted by</p>
                <h3 className="text-lg font-black text-primary line-clamp-1">{listing.user?.name || listing.user?.email}</h3>
                {listing.user?.isVerified && <VerifiedBadge />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-primary/5 p-3 text-center border border-primary/5">
                <p className="text-2xl font-black text-primary">{listing.user?.karma || 0}</p>
                <p className="text-[10px] font-bold text-primary/40 uppercase">Karma Score</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/5 p-3 text-center border border-emerald-500/10">
                <p className="text-2xl font-black text-emerald-600">{listing.user?.responseRate || 100}%</p>
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Response</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href={`/profile/${listing.userId}`}
                className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-primary/10 bg-white px-5 py-3.5 text-sm font-bold text-primary hover:bg-primary/5 transition-all"
              >
                View Full Profile
              </Link>
              {listing.user?.email && (
                <a
                  href={`mailto:${listing.user.email}`}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                >
                  <Mail size={16} /> Send Message
                </a>
              )}
            </div>
          </div>

          {/* Roommate Calculator Sidebar */}
          <div className="rounded-3xl border border-primary/10 bg-white/40 p-6 space-y-6">
            <h2 className="text-lg font-bold text-primary">💰 Cost Split</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Number of people</p>
                <div className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-white/60 p-1">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumPeople(n.toString())}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                        numPeople === n.toString() ? "bg-primary text-white shadow-md" : "text-primary/40 hover:bg-white/40"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    value={numPeople}
                    onChange={(e) => setNumPeople(e.target.value)}
                    className="w-12 bg-transparent text-center text-sm font-bold text-primary focus:outline-none"
                    placeholder="+"
                  />
                </div>
              </div>
              
              <button
                onClick={handleCalc}
                disabled={calcLoading}
                className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-primary border border-primary/20 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                {calcLoading ? "Calculating..." : "Update Split"}
              </button>

              {calcResult && (
                <div className="space-y-3 pt-4 border-t border-primary/5">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-primary/60">Per Person</span>
                    <span className="text-3xl font-black text-primary">${calcResult.perPerson}</span>
                  </div>
                  {calcResult.tip && (
                    <div className="rounded-2xl bg-primary/5 p-4 border border-primary/5">
                      <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">💡 AI Insight</p>
                      <p className="text-xs text-primary/80 font-medium leading-relaxed">{calcResult.tip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="rounded-[40px] border border-primary/10 bg-white/60 backdrop-blur-md p-10 shadow-sm space-y-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-primary flex items-center gap-3">
              ⭐ Reviews
              <span className="text-lg font-bold text-primary/40">{reviews.length} total</span>
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <Stars n={avgRating} size={20} />
                <span className="text-lg font-black text-primary">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {canReview ? (
            <button
              onClick={() => setShowForm((f) => !f)}
              className="rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
            >
              {showForm ? "Close Form" : "Write a Review"}
            </button>
          ) : !user ? (
            <Link href="/auth/login" className="rounded-2xl border-2 border-primary/10 px-8 py-4 font-bold text-primary hover:bg-primary/5 transition-all">
              Sign in to Review
            </Link>
          ) : (
            <div className="rounded-2xl bg-primary/5 px-6 py-4 text-sm font-bold text-primary/40 border border-primary/5">
              Verified students only
            </div>
          )}
        </div>

        {showForm && (
          <div className="rounded-3xl border border-primary/10 bg-white p-8 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">Overall Experience</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setNewRating(i)} className="transition-transform active:scale-125">
                      <Star size={32} className={i <= newRating ? "text-yellow-400 fill-yellow-400" : "text-primary/10"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">Maintenance Speed</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setNewMaintenance(i)} className="transition-transform active:scale-125">
                      <Star size={24} className={i <= newMaintenance ? "text-blue-400 fill-blue-400" : "text-primary/10"} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
               <button
                type="button"
                onClick={() => setNewDepositReturned((v) => !v)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-6 py-3 text-sm font-bold transition-all ${
                  newDepositReturned ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-primary/5 bg-primary/5 text-primary/40"
                }`}
              >
                <div className={`h-5 w-5 rounded-lg flex items-center justify-center border-2 ${newDepositReturned ? "bg-emerald-500 border-emerald-500" : "border-primary/20"}`}>
                  {newDepositReturned && <span className="text-[10px] text-white font-black">✓</span>}
                </div>
                Deposit Returned
              </button>
            </div>

            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Tell other students what it's like living here..."
              rows={4}
              className="w-full rounded-2xl border-2 border-primary/5 bg-primary/5 p-6 text-primary placeholder:text-primary/30 focus:border-primary/20 focus:outline-none focus:ring-0 transition-all text-lg font-medium"
            />
            
            <div className="flex items-center justify-between">
              {reviewError && <p className="text-sm font-bold text-red-500">{reviewError}</p>}
              <button
                onClick={submitReview}
                disabled={!newText.trim() || reviewLoading}
                className="ml-auto flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 font-black text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 disabled:opacity-40"
              >
                {reviewLoading ? <Loader2 size={20} className="animate-spin" /> : "Publish Review"}
              </button>
            </div>
          </div>
        )}

        {summaryLoading ? (
          <div className="rounded-3xl border border-primary/10 bg-white/40 p-6 flex items-center justify-center gap-3 text-primary/60">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-bold">Generating AI Summary of Reviews...</span>
          </div>
        ) : summary && (
          <div className="rounded-3xl border border-pink-400/30 bg-gradient-to-r from-pink-500/10 to-violet-500/10 p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Zap size={64} className="text-pink-500" />
            </div>
            <h3 className="text-lg font-bold text-pink-600 mb-2 flex items-center gap-2 relative z-10">
              <Sparkles size={20} />
              AI Review Summary
            </h3>
            <p className="text-primary/80 font-medium leading-relaxed relative z-10 text-lg">
              {summary}
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {reviews.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-primary/10 bg-white/20">
              <p className="text-primary/40 font-bold text-xl">Be the first to review this place!</p>
            </div>
          ) : (
            reviews.map((review: any) => (
              <div key={review.id} className="group space-y-4">
                <div className="rounded-3xl border border-primary/5 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary overflow-hidden">
                      {review.user?.avatarUrl ? (
                        <img src={review.user.avatarUrl} className="h-full w-full object-cover" />
                      ) : (
                        (review.user?.name || "A")[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-primary">{review.user?.name || "Anonymous Student"}</span>
                        {review.user?.isVerified && <VerifiedBadge />}
                      </div>
                      <div className="flex items-center gap-3">
                        <Stars n={review.rating} size={14} />
                        <span className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-primary/80 text-lg font-medium leading-relaxed mb-6">{review.reviewText}</p>
                  
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-primary/5">
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2">
                      <span className="text-[10px] font-black text-primary/40 uppercase">Maintenance</span>
                      <Stars n={review.maintenanceRating} size={10} />
                    </div>
                    <div className={`flex items-center gap-2 rounded-xl px-4 py-2 ${review.depositReturned ? "bg-emerald-500/5 text-emerald-600" : "bg-red-500/5 text-red-600"}`}>
                      <span className="text-[10px] font-black uppercase">Deposit</span>
                      <span className="text-xs font-bold">{review.depositReturned ? "Returned" : "Withheld"}</span>
                    </div>
                  </div>
                </div>

                {/* Comments section */}
                <div className="pl-10 space-y-4">
                  {(review.comments || []).map((c: any, ci: number) => (
                    <div key={ci} className="rounded-2xl bg-white/40 p-5 border border-primary/5 flex gap-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-xs">
                        {c.user?.name?.[0].toUpperCase() || "A"}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-primary">{c.user?.name || "Student"}</p>
                        <p className="text-sm font-medium text-primary/70">{c.content}</p>
                      </div>
                    </div>
                  ))}

                  {user && (
                    <div className="flex gap-3">
                      <input
                        value={commentInputs[review.id] ?? ""}
                        onChange={(e) => setCommentInputs((p) => ({ ...p, [review.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && submitComment(review.id)}
                        placeholder="Add your thoughts..."
                        className="flex-1 rounded-2xl border border-primary/10 bg-white/60 px-6 py-3.5 text-sm font-medium text-primary placeholder:text-primary/30 focus:border-primary/20 focus:outline-none transition-all shadow-sm"
                      />
                      <button
                        onClick={() => submitComment(review.id)}
                        className="rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white hover:shadow-lg transition-all"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
