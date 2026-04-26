"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, Wifi, Car, Wind, PawPrint, Sofa, WashingMachine,
  Star, ChevronLeft, Heart, ExternalLink, Users, Loader2, Send,
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
  wifi: Wifi, parking: Car, laundry: WashingMachine, ac: Wind, petFriendly: PawPrint, furnished: Sofa,
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

  // Calculator
  const [numPeople, setNumPeople] = useState("1");
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Review form
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newMaintenance, setNewMaintenance] = useState(3);
  const [newDepositReturned, setNewDepositReturned] = useState(true);
  const [newText, setNewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Review comments
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      Promise.all([
        fetch(`/api/listings/${p.id}`).then((r) => r.json()),
        fetch(`/api/reviews?listingId=${p.id}`).then((r) => r.json()),
      ]).then(([l, rv]) => {
        setListing(l);
        setReviews(Array.isArray(rv) ? rv : []);
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  if (!listing || listing.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Listing not found.</p>
          <Link href="/listings" className="text-sm text-violet-400 hover:underline">← Back to Listings</Link>
        </div>
      </div>
    );
  }

  const amenityList = Object.keys(AMENITY_ICONS).map((key) => ({
    label: key === "petFriendly" ? "Pet Friendly" : key.charAt(0).toUpperCase() + key.slice(1),
    icon: AMENITY_ICONS[key],
    on: Array.isArray(listing.amenities) && listing.amenities.includes(key),
  }));

  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Back to Listings
        </Link>

        {/* Photo */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} className="h-80 w-full object-cover" />
          ) : (
            <div className="flex h-72 items-center justify-center flex-col gap-2">
              <div className="text-7xl">🏠</div>
              <p className="text-gray-500 text-sm">No photos yet</p>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
              <p className="mt-1 text-4xl font-extrabold text-violet-400">
                ${listing.rent.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
              </p>
              <p className="mt-1 text-sm text-gray-400">🛏 {listing.bedrooms} bed · 🚿 {listing.bathrooms} bath</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setSaved((s) => !s)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  saved ? "border-pink-500 bg-pink-500/20 text-pink-300" : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                }`}
              >
                <Heart size={15} className={saved ? "fill-pink-400 text-pink-400" : ""} />
                {saved ? "Saved" : "Save"}
              </button>
              {listing.user?.email && (
                <a
                  href={`mailto:${listing.user.email}`}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20"
                >
                  Contact Landlord
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <MapPin size={13} className="text-violet-400" />{listing.address}
          </div>
          {listing.description && (
            <p className="text-sm text-gray-300 leading-relaxed">{listing.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 pt-1">
            {listing.leaseLength && <span>📅 {listing.leaseLength} month lease</span>}
            {listing.deposit && <span>💰 ${listing.deposit.toLocaleString()} deposit</span>}
            {listing.availableFrom && <span>🟢 Available {new Date(listing.availableFrom).toLocaleDateString()}</span>}
            {listing.utilitiesIncluded && <span className="text-emerald-400">⚡ Utilities included</span>}
          </div>
        </div>

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 font-semibold text-white">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenityList.map(({ label, icon: Icon, on }) => (
                <span
                  key={label}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    on
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/5 bg-white/3 text-gray-600 line-through"
                  }`}
                >
                  <Icon size={11} />{label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roommate Split Calculator */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">🏠 Roommate Cost Split</h2>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <Users size={15} className="text-violet-400" />
              <input
                type="number"
                min={1}
                max={10}
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="w-16 bg-transparent text-white text-sm font-medium focus:outline-none"
                placeholder="People"
              />
              <span className="text-xs text-gray-500">people sharing</span>
            </div>
            <button
              onClick={handleCalc}
              disabled={calcLoading}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition"
            >
              {calcLoading ? "Calculating…" : "Calculate Split"}
            </button>
          </div>
          {calcResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500 mb-1">Rent / person</p>
                  <p className="text-xl font-bold text-violet-400">${calcResult.perPersonRent}<span className="text-xs text-gray-500">/mo</span></p>
                </div>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 p-3">
                  <p className="text-[11px] text-violet-300 mb-1">Total / person</p>
                  <p className="text-xl font-bold text-white">${calcResult.perPerson}<span className="text-xs text-gray-400">/mo</span></p>
                </div>
              </div>
              {calcResult.tip && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm">
                  <p className="text-xs text-violet-400 font-medium mb-1">✨ AI Tip</p>
                  <p className="text-gray-300">{calcResult.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Listed by */}
        {listing.user && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 flex items-center gap-4">
            {listing.user.avatarUrl ? (
              <img src={listing.user.avatarUrl} className="h-12 w-12 rounded-full object-cover" alt={listing.user.name} />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 font-bold text-lg">
                {(listing.user.name || listing.user.email || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Listed by</p>
              <p className="font-semibold text-white">{listing.user.name || listing.user.email}</p>
            </div>
            <Link
              href={`/landlords/${listing.userId}`}
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition"
            >
              View profile <ExternalLink size={13} />
            </Link>
          </div>
        )}

        {/* Reviews */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Reviews</h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <Stars n={avgRating} />
                  <span className="text-sm text-gray-400">{avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
            {canReview ? (
              <button
                onClick={() => setShowForm((f) => !f)}
                className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/20 transition"
              >
                {showForm ? "Cancel" : "Write a Review"}
              </button>
            ) : !user ? (
              <Link
                href="/auth/login"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
              >
                Sign in to review
              </Link>
            ) : null}
          </div>

          {showForm && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-4">
              {reviewError && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">{reviewError}</div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Overall Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setNewRating(i)}>
                      <Star size={22} className={i <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Maintenance Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setNewMaintenance(i)}>
                      <Star size={18} className={i <= newMaintenance ? "text-blue-400 fill-blue-400" : "text-gray-600"} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newDepositReturned}
                  onChange={(e) => setNewDepositReturned(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-violet-500"
                />
                Deposit was returned
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Share your experience with this landlord/property…"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none resize-none"
              />
              <button
                onClick={submitReview}
                disabled={reviewLoading || !newText.trim()}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition"
              >
                {reviewLoading ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No reviews yet — be the first!</p>
          ) : (
            <div className="space-y-5">
              {reviews.map((review: any) => (
                <div key={review.id} className="space-y-2">
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">{review.user?.name || review.user?.email || "Anonymous"}</span>
                      <VerifiedBadge />
                      <Stars n={review.rating} size={13} />
                      <span className="ml-auto text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-300">{review.reviewText}</p>
                    <div className="flex gap-4 pt-2 border-t border-white/5 text-xs text-gray-400">
                      <span>Deposit returned: {review.depositReturned ? "Yes ✓" : "No ✗"}</span>
                      <span>Maintenance: {review.maintenanceRating}/5</span>
                    </div>
                  </div>
                  {(review.comments || []).map((c: any, ci: number) => (
                    <div key={ci} className="ml-6 rounded-lg border border-white/5 bg-white/2 px-4 py-2.5 text-sm">
                      <span className="font-medium text-gray-300">{c.user?.name || "Anonymous"}</span>
                      <span className="mx-2 text-gray-600">·</span>
                      <span className="text-gray-400">{c.content}</span>
                    </div>
                  ))}
                  {user && (
                    <div className="ml-6 flex gap-2">
                      <input
                        value={commentInputs[review.id] ?? ""}
                        onChange={(e) => setCommentInputs((p) => ({ ...p, [review.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && submitComment(review.id)}
                        placeholder="Add a comment…"
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
                      />
                      <button
                        onClick={() => submitComment(review.id)}
                        className="rounded-lg bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
