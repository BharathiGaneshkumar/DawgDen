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

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-primary/60">Loading listing…</p>
      </div>
    </div>
  );
  if (!listing) return <div className="flex min-h-screen items-center justify-center"><p className="text-primary/60">Listing not found.</p></div>;

  const amenityList = Object.keys(AMENITY_ICONS).map((key) => ({
    label: key === "petFriendly" ? "Pet Friendly" : key.charAt(0).toUpperCase() + key.slice(1),
    icon: AMENITY_ICONS[key],
    on: Array.isArray(listing.amenities) && listing.amenities.includes(key),
  }));

  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen relative z-10 text-primary">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-primary/60 hover:text-primary transition-colors">
          <ChevronLeft size={16} /> Back to Listings
        </Link>

        {/* Photo Gallery */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-violet-200/40 to-pink-100/40 shadow-sm">
          {photos.length > 0 ? (
            <>
              <img src={photos[imgIdx]} alt="listing" className="h-96 w-full object-cover" />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-primary/20 p-2 hover:bg-primary/40 transition"><ChevronLeft size={20} className="text-white" /></button>
                  <button onClick={() => setImgIdx(i => (i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary/20 p-2 hover:bg-primary/40 transition"><ChevronRight size={20} className="text-white" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => <button key={i} onClick={() => setImgIdx(i)} className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-6 bg-white" : "w-1.5 bg-white/60"}`} />)}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex h-72 items-center justify-center flex-col gap-2">
              <div className="text-7xl">🏠</div>
              <p className="text-primary/50 text-sm">No photos yet</p>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">{listing.title}</h1>
              <p className="mt-1 text-4xl font-extrabold text-primary">${listing.rent.toLocaleString()}<span className="text-base font-normal text-primary/60">/mo</span></p>
              <p className="mt-1 text-sm text-primary/70">🛏 {listing.bedrooms} bed · 🚿 {listing.bathrooms} bath</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setSaved(s => !s)} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${saved ? "border-pink-500 bg-pink-500/20 text-pink-500" : "border-primary/10 bg-white/80 text-primary/70 hover:border-primary/40"}`}>
                <Heart size={15} className={saved ? "fill-pink-400 text-pink-400" : ""} />{saved ? "Saved" : "Save"}
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md shadow-primary/20">
                <Phone size={14} /> Contact Landlord
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
          <div className="flex items-center gap-1.5 text-sm text-primary/70"><MapPin size={13} className="text-primary" />{listing.address}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary/70">Posted by</span>
            <span className="font-medium text-primary">@{listing.postedBy.username}</span>
            {listing.postedBy.isVerified && <VerifiedBadge />}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-primary">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map(({ label, icon: Icon, on }) => (
                <span key={label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-primary/40 bg-primary/10 text-primary" : "border-primary/10 bg-white/80 text-primary/40 line-through"}`}>
                  <Icon size={11} />{label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-primary">Utilities Included</h2>
            <div className="space-y-2">
              {utilityBadges.map(({ label, icon: Icon, on }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <Icon size={13} className={on ? "text-emerald-500" : "text-primary/40"} />
                  <span className={on ? "text-primary" : "text-primary/40 line-through"}>{label}</span>
                  {on && <span className="ml-auto text-xs text-emerald-500 font-medium">Included</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-5 sm:col-span-2 shadow-sm">
            <h2 className="mb-3 font-semibold text-primary">Lease Details</h2>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {[{ label: "Lease", value: listing.leaseLength }, { label: "Deposit", value: `$${listing.securityDeposit.toLocaleString()}` }, { label: "Available", value: new Date(listing.availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/80 border border-primary/10 p-3">
                  <p className="text-xs text-primary/60 mb-1">{label}</p>
                  <p className="font-semibold text-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commute Section */}
        <CommuteSection commute={listing.commute} busRoutes={listing.busRoutes} address={listing.address} uwbAddress={listing.uwb.address} />

        {/* Utilities + ISP Section */}
        <UtilitiesSection utilityCosts={listing.utilityCosts} included={listing.utilities} isps={listing.isps} />

        {/* Roommate Split Calculator */}
        <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">🏠 Roommate Cost Split</h2>
          <p className="text-xs text-primary/60">Total monthly: rent ${listing.rent} + est. utilities ~${listing.utilityCosts.total} = <span className="text-primary font-medium">${listing.rent + listing.utilityCosts.total}</span></p>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-white/80 px-4 py-2.5">
              <Users size={15} className="text-primary" />
              <input type="number" min={1} max={10} value={numPeople} onChange={e => setNumPeople(e.target.value)}
                className="w-16 bg-transparent text-primary text-sm font-medium focus:outline-none"
                placeholder="People" />
              <span className="text-xs text-primary/60">people sharing</span>
            </div>
            <button onClick={handleCalc} disabled={calcLoading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition shadow-md shadow-primary/20">
              {calcLoading ? "Calculating…" : "Calculate Split"}
            </button>
          </div>
          {calcResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-white/80 border border-primary/10 p-3">
                  <p className="text-[11px] text-primary/60 mb-1">Rent / person</p>
                  <p className="text-xl font-bold text-primary">${calcResult.perPersonRent}<span className="text-xs text-primary/50">/mo</span></p>
                </div>
                <div className="rounded-xl bg-white/80 border border-primary/10 p-3">
                  <p className="text-[11px] text-primary/60 mb-1">Utilities / person</p>
                  <p className="text-xl font-bold text-blue-500">${calcResult.perPersonUtilities}<span className="text-xs text-primary/50">/mo</span></p>
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                  <p className="text-[11px] text-primary mb-1">Total / person</p>
                  <p className="text-xl font-bold text-primary">${calcResult.perPerson}<span className="text-xs text-primary/60">/mo</span></p>
                </div>
              </div>
              <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm">
                <p className="text-xs text-primary font-medium mb-1">✨ AI Tip</p>
                <p className="text-primary/80">{calcResult.tip}</p>
              </div>
            </div>
          )}
        </div>

        {/* Landlord Trust Score */}
        <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">🏅 Landlord Trust Score</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-xl font-bold text-white shadow-lg shadow-primary/20">{listing.landlordTrustScore.toFixed(1)}</div>
            <div className="space-y-1"><Stars n={listing.landlordTrustScore} size={18} /><p className="text-xs text-primary/60">Based on verified student reviews</p></div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-emerald-500">{listing.depositReturnRate}%</p>
              <p className="text-xs text-primary/50">Deposit Return Rate</p>
            </div>
            <Link
              href={`/landlords/${listing.userId}`}
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition"
            >
              View profile <ExternalLink size={13} />
            </Link>
          </div>
          <p className="text-sm text-primary/70 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">AI pattern summary: This landlord has a history of timely responses and fair deposit returns. Minor issues reported around maintenance request delays.</p>
          <Link href={`/landlords/${listing.landlordId}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition">See Full Landlord Profile <ExternalLink size={13} /></Link>
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">⭐ Reviews</h2>
              {localReviews.length > 0 && <div className="flex items-center gap-2 mt-1"><Stars n={avgRating} /><span className="text-sm text-primary/60">{avgRating.toFixed(1)} · {localReviews.length} review{localReviews.length !== 1 ? "s" : ""}</span></div>}
            </div>
            <button onClick={() => setShowForm(f => !f)} className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition">{showForm ? "Cancel" : "Write a Review"}</button>
          </div>

          {showForm && (
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <button key={i} onClick={() => setNewRating(i)}><Star size={22} className={i <= newRating ? "text-yellow-400 fill-yellow-400" : "text-primary/20"} /></button>)}</div>
              <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Share your experience…" rows={3} className="w-full rounded-xl border border-primary/10 bg-white/80 px-4 py-2.5 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none resize-none" />
              <button onClick={submitReview} className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md shadow-primary/20">Submit Review</button>
            </div>
          )}
          {localReviews.length === 0 ? (
            <p className="text-sm text-primary/50 text-center py-6">No reviews yet — be the first!</p>
          ) : (
            <div className="space-y-5">
              {reviews.map((review: any) => (
                <div key={review.id} className="space-y-2">
                  <div className="rounded-xl border border-primary/10 bg-white/80 p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-primary text-sm">@{review.username}</span>
                      {review.isVerified && <VerifiedBadge />}
                      <Stars n={review.rating} size={13} />
                      <span className="ml-auto text-xs text-primary/50">{review.date}</span>
                    </div>
                    <p className="text-sm text-primary/70">{review.text}</p>
                  </div>
                  {review.comments.map((c, ci) => (
                    <div key={ci} className="ml-6 rounded-lg border border-primary/10 bg-white/60 px-4 py-2.5 text-sm">
                      <span className="font-medium text-primary">@{c.username}</span><span className="mx-2 text-primary/30">·</span><span className="text-primary/70">{c.text}</span><span className="ml-2 text-xs text-primary/40">{c.date}</span>
                    </div>
                  ))}
                  <div className="ml-6 flex gap-2">
                    <input value={commentInputs[review.id] ?? ""} onChange={e => setCommentInputs(p => ({ ...p, [review.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && submitComment(review.id)} placeholder="Add a comment…" className="flex-1 rounded-lg border border-primary/10 bg-white/80 px-3 py-1.5 text-xs text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none" />
                    <button onClick={() => submitComment(review.id)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition">Post</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
