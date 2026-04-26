"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, Wifi, Car, Wind, PawPrint, Sofa, WashingMachine,
  Star, ChevronLeft, Heart, ExternalLink, Users, Loader2,
  Dumbbell, BatteryCharging, Mail,
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
    <div className="mx-auto max-w-5xl px-4 py-8 min-h-screen space-y-8">
      <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
        <ChevronLeft size={16} /> Back to Listings
      </Link>

      {/* Photo */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900 h-80 flex items-center justify-center">
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <div className="text-7xl">🏠</div>
            <p className="text-sm">No photos yet</p>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
            <p className="mt-1 text-4xl font-extrabold text-white">
              ${listing.rent.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
            </p>
            <p className="mt-1 text-sm text-gray-400">🛏 {listing.bedrooms} bed · 🚿 {listing.bathrooms} bath</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSaved((s) => !s)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                saved ? "border-pink-500 bg-pink-500/20 text-pink-400" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"
              }`}
            >
              <Heart size={15} className={saved ? "fill-pink-400 text-pink-400" : ""} />
              {saved ? "Saved" : "Save"}
            </button>
            {listing.user?.email && (
              <a
                href={`mailto:${listing.user.email}`}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-500/20"
              >
                <Mail size={14} /> Contact Landlord
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <MapPin size={13} className="text-violet-400" />
          {listing.address}
        </div>
        {listing.user && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Posted by</span>
            <span className="font-medium text-gray-200">{listing.user.name || listing.user.email}</span>
            {listing.user.isVerified && <VerifiedBadge />}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Amenities */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <h2 className="mb-3 font-semibold text-white">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenityList.map(({ label, icon: Icon, on }) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  on
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                    : "border-white/10 bg-white/3 text-gray-500 line-through"
                }`}
              >
                <Icon size={11} />{label}
              </span>
            ))}
          </div>
        </div>

        {/* Lease Details */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <h2 className="mb-3 font-semibold text-white">Lease Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Lease", value: `${listing.leaseLength} months` },
              { label: "Deposit", value: listing.deposit ? `$${listing.deposit.toLocaleString()}` : "None" },
              {
                label: "Available",
                value: listing.availableFrom
                  ? new Date(listing.availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Now",
              },
              {
                label: "Utilities",
                value: listing.utilitiesIncluded ? "Included" : "Not included",
              },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-semibold text-white text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold text-white mb-2">About this place</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">📍 Location</h2>
          <a
            href={`https://www.google.com/maps/dir/University+of+Washington+Bothell,+Bothell+WA/${encodedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition"
          >
            Directions from UWB <ExternalLink size={11} />
          </a>
        </div>
        <iframe
          title="Location map"
          width="100%"
          height="300"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
          className="border-0"
        />
      </div>

      {/* Roommate Calculator */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">🏠 Roommate Cost Split</h2>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
            <Users size={15} className="text-gray-400" />
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
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition shadow-md shadow-violet-500/20"
          >
            {calcLoading ? <Loader2 size={14} className="animate-spin inline" /> : "Calculate Split"}
          </button>
        </div>
        {calcResult && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-xs text-gray-500 mb-1">Rent / person</p>
              <p className="text-xl font-bold text-white">${calcResult.perPersonRent}<span className="text-xs text-gray-500">/mo</span></p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-xs text-gray-500 mb-1">Total / person</p>
              <p className="text-xl font-bold text-violet-300">${calcResult.perPerson}<span className="text-xs text-gray-500">/mo</span></p>
            </div>
            {calcResult.tip && (
              <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-3 sm:col-span-1 col-span-2 text-left">
                <p className="text-[10px] text-violet-400 font-medium mb-1">AI Tip</p>
                <p className="text-xs text-gray-300">{calcResult.tip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">⭐ Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Stars n={avgRating} />
                <span className="text-sm text-gray-400">{avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          {canReview && (
            <button
              onClick={() => setShowForm((f) => !f)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          )}
          {user && !canReview && (
            <span className="text-xs text-gray-500">Verified students only</span>
          )}
          {!user && (
            <Link href="/auth/login" className="text-sm text-violet-400 hover:underline">Sign in to review</Link>
          )}
        </div>

        {showForm && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Overall rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setNewRating(i)}>
                    <Star size={22} className={i <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Maintenance rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setNewMaintenance(i)}>
                    <Star size={18} className={i <= newMaintenance ? "text-blue-400 fill-blue-400" : "text-gray-600"} />
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewDepositReturned((v) => !v)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                newDepositReturned ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-gray-400"
              }`}
            >
              {newDepositReturned ? "✓" : "✗"} Deposit returned
            </button>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Share your experience with this landlord…"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none resize-none"
            />
            {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}
            <button
              onClick={submitReview}
              disabled={!newText.trim() || reviewLoading}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40 transition"
            >
              {reviewLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              Submit Review
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No reviews yet — be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="space-y-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">
                      {review.user?.name || review.user?.email || "Anonymous"}
                    </span>
                    {review.user?.isVerified && <VerifiedBadge />}
                    <Stars n={review.rating} size={13} />
                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{review.reviewText}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>Maintenance: {review.maintenanceRating}/5</span>
                    <span className={review.depositReturned ? "text-emerald-400" : "text-red-400"}>
                      Deposit: {review.depositReturned ? "returned" : "not returned"}
                    </span>
                  </div>
                </div>

                {(review.comments || []).map((c: any, ci: number) => (
                  <div key={ci} className="ml-6 rounded-lg border border-white/10 bg-white/3 px-4 py-2.5 text-sm">
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
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none"
                    />
                    <button
                      onClick={() => submitComment(review.id)}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
