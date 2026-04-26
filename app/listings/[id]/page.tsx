"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Wifi, Car, Wind, PawPrint, Sofa, WashingMachine, Zap, Droplets, Flame, Globe, Star, ChevronLeft, ChevronRight, Phone, Heart, ExternalLink, Users } from "lucide-react";
import { CommuteSection, UtilitiesSection } from "./sections";

interface Listing {
  id: string; title: string; rent: number; bedrooms: number; bathrooms: number;
  address: string; lat: number; lng: number;
  uwb: { lat: number; lng: number; address: string };
  images: string[];
  postedBy: { username: string; isVerified: boolean };
  amenities: { wifi: boolean; parking: boolean; laundry: boolean; ac: boolean; petFriendly: boolean; furnished: boolean };
  utilities: { electricity: boolean; water: boolean; internet: boolean; gas: boolean };
  utilityCosts: { electricity: number; water: number; sewage: number; gas: number; trash: number; total: number };
  leaseLength: string; securityDeposit: number; availableFrom: string;
  landlordId: string; landlordTrustScore: number; depositReturnRate: number;
  commute: { driving: { time: string; distance: string; trafficTime: string }; walking: { time: string; distance: string }; transit: { time: string; route: string; stops: number } };
  busRoutes: { route: string; name: string; frequency: string; firstBus: string; lastBus: string }[];
  isps: { name: string; type: string; speed: string; price: number; rating: number; available: boolean; recommended?: boolean }[];
}
interface Comment { username: string; text: string; date: string; }
interface Review { id: string; username: string; isVerified: boolean; rating: number; text: string; date: string; comments: Comment[]; }

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return <span className="flex items-center gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={size} className={i <= Math.round(n) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />)}</span>;
}
function VerifiedBadge() {
  return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">✓ Verified UW Student</span>;
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  // Calculator
  const [numPeople, setNumPeople] = useState("1");
  const [calcResult, setCalcResult] = useState<{ perPerson: number; perPersonRent: number; perPersonUtilities: number; tip: string; total: number } | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  // Reviews
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      Promise.all([
        fetch(`/api/listings/${p.id}`).then(r => r.json()),
        fetch(`/api/reviews?listingId=${p.id}`).then(r => r.json()),
      ]).then(([l, rv]) => { setListing(l); setLocalReviews(rv); setReviews(rv); setLoading(false); });
    });
  }, [params]);

  async function handleCalc() {
    if (!listing) return;
    setCalcLoading(true);
    const res = await fetch("/api/affordability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rent: listing.rent, numPeople: Number(numPeople), utilitiesTotal: listing.utilityCosts.total }),
    });
    setCalcResult(await res.json());
    setCalcLoading(false);
  }

  function submitReview() {
    if (!newText.trim()) return;
    const r: Review = { id: `local-${Date.now()}`, username: "you", isVerified: true, rating: newRating, text: newText, date: new Date().toISOString().split("T")[0], comments: [] };
    setLocalReviews(p => [r, ...p]);
    setNewText(""); setShowForm(false);
  }

  function submitComment(rid: string) {
    const text = commentInputs[rid]?.trim();
    if (!text) return;
    setLocalReviews(p => p.map(r => r.id === rid ? { ...r, comments: [...r.comments, { username: "you", text, date: new Date().toISOString().split("T")[0] }] } : r));
    setCommentInputs(p => ({ ...p, [rid]: "" }));
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        <p className="text-gray-400">Loading listing…</p>
      </div>
    </div>
  );
  if (!listing) return <div className="flex min-h-screen items-center justify-center bg-slate-950"><p className="text-gray-400">Listing not found.</p></div>;

  const avgRating = localReviews.length ? localReviews.reduce((s, r) => s + r.rating, 0) / localReviews.length : 0;
  const photos = listing.images;

  const amenities = [
    { label: "WiFi", icon: Wifi, on: listing.amenities.wifi },
    { label: "Parking", icon: Car, on: listing.amenities.parking },
    { label: "Laundry", icon: WashingMachine, on: listing.amenities.laundry },
    { label: "AC", icon: Wind, on: listing.amenities.ac },
    { label: "Pet Friendly", icon: PawPrint, on: listing.amenities.petFriendly },
    { label: "Furnished", icon: Sofa, on: listing.amenities.furnished },
  ];
  const utilityBadges = [
    { label: "Electricity", icon: Zap, on: listing.utilities.electricity },
    { label: "Water", icon: Droplets, on: listing.utilities.water },
    { label: "Internet", icon: Globe, on: listing.utilities.internet },
    { label: "Gas", icon: Flame, on: listing.utilities.gas },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Back to Listings
        </Link>

        {/* Photo Gallery */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-900/40 to-slate-900">
          {photos.length > 0 ? (
            <>
              <img src={photos[imgIdx]} alt="listing" className="h-96 w-full object-cover" />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80 transition"><ChevronLeft size={20} /></button>
                  <button onClick={() => setImgIdx(i => (i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80 transition"><ChevronRight size={20} /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => <button key={i} onClick={() => setImgIdx(i)} className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />)}
                  </div>
                </>
              )}
            </>
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
              <p className="mt-1 text-4xl font-extrabold text-violet-400">${listing.rent.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span></p>
              <p className="mt-1 text-sm text-gray-400">🛏 {listing.bedrooms} bed · 🚿 {listing.bathrooms} bath</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setSaved(s => !s)} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${saved ? "border-pink-500 bg-pink-500/20 text-pink-300" : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"}`}>
                <Heart size={15} className={saved ? "fill-pink-400 text-pink-400" : ""} />{saved ? "Saved" : "Save"}
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20">
                <Phone size={14} /> Contact Landlord
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400"><MapPin size={13} className="text-violet-400" />{listing.address}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Posted by</span>
            <span className="font-medium text-white">@{listing.postedBy.username}</span>
            {listing.postedBy.isVerified && <VerifiedBadge />}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 font-semibold text-white">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map(({ label, icon: Icon, on }) => (
                <span key={label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-violet-500/40 bg-violet-500/15 text-violet-300" : "border-white/5 bg-white/3 text-gray-600 line-through"}`}>
                  <Icon size={11} />{label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="mb-3 font-semibold text-white">Utilities Included</h2>
            <div className="space-y-2">
              {utilityBadges.map(({ label, icon: Icon, on }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <Icon size={13} className={on ? "text-emerald-400" : "text-gray-600"} />
                  <span className={on ? "text-gray-200" : "text-gray-600 line-through"}>{label}</span>
                  {on && <span className="ml-auto text-xs text-emerald-400 font-medium">Included</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:col-span-2">
            <h2 className="mb-3 font-semibold text-white">Lease Details</h2>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {[{ label: "Lease", value: listing.leaseLength }, { label: "Deposit", value: `$${listing.securityDeposit.toLocaleString()}` }, { label: "Available", value: new Date(listing.availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-white">{value}</p>
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
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">🏠 Roommate Cost Split</h2>
          <p className="text-xs text-gray-500">Total monthly: rent ${listing.rent} + est. utilities ~${listing.utilityCosts.total} = <span className="text-white font-medium">${listing.rent + listing.utilityCosts.total}</span></p>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <Users size={15} className="text-violet-400" />
              <input type="number" min={1} max={10} value={numPeople} onChange={e => setNumPeople(e.target.value)}
                className="w-16 bg-transparent text-white text-sm font-medium focus:outline-none"
                placeholder="People" />
              <span className="text-xs text-gray-500">people sharing</span>
            </div>
            <button onClick={handleCalc} disabled={calcLoading}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition">
              {calcLoading ? "Calculating…" : "Calculate Split"}
            </button>
          </div>
          {calcResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500 mb-1">Rent / person</p>
                  <p className="text-xl font-bold text-violet-400">${calcResult.perPersonRent}<span className="text-xs text-gray-500">/mo</span></p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500 mb-1">Utilities / person</p>
                  <p className="text-xl font-bold text-blue-400">${calcResult.perPersonUtilities}<span className="text-xs text-gray-500">/mo</span></p>
                </div>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 p-3">
                  <p className="text-[11px] text-violet-300 mb-1">Total / person</p>
                  <p className="text-xl font-bold text-white">${calcResult.perPerson}<span className="text-xs text-gray-400">/mo</span></p>
                </div>
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm">
                <p className="text-xs text-violet-400 font-medium mb-1">✨ AI Tip</p>
                <p className="text-gray-300">{calcResult.tip}</p>
              </div>
            </div>
          )}
        </div>

        {/* Landlord Trust Score */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">🏅 Landlord Trust Score</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-xl font-bold text-white shadow-lg shadow-violet-500/20">{listing.landlordTrustScore.toFixed(1)}</div>
            <div className="space-y-1"><Stars n={listing.landlordTrustScore} size={18} /><p className="text-xs text-gray-400">Based on verified student reviews</p></div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-emerald-400">{listing.depositReturnRate}%</p>
              <p className="text-xs text-gray-500">Deposit Return Rate</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 rounded-xl bg-white/5 px-4 py-3">AI pattern summary: This landlord has a history of timely responses and fair deposit returns. Minor issues reported around maintenance request delays.</p>
          <Link href={`/landlords/${listing.landlordId}`} className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition">See Full Landlord Profile <ExternalLink size={13} /></Link>
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Reviews</h2>
              {localReviews.length > 0 && <div className="flex items-center gap-2 mt-1"><Stars n={avgRating} /><span className="text-sm text-gray-400">{avgRating.toFixed(1)} · {localReviews.length} review{localReviews.length !== 1 ? "s" : ""}</span></div>}
            </div>
            <button onClick={() => setShowForm(f => !f)} className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/20 transition">{showForm ? "Cancel" : "Write a Review"}</button>
          </div>
          {showForm && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <button key={i} onClick={() => setNewRating(i)}><Star size={22} className={i <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} /></button>)}</div>
              <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Share your experience…" rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none resize-none" />
              <button onClick={submitReview} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition">Submit Review</button>
            </div>
          )}
          {localReviews.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No reviews yet — be the first!</p>
          ) : (
            <div className="space-y-5">
              {localReviews.map(review => (
                <div key={review.id} className="space-y-2">
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">@{review.username}</span>
                      {review.isVerified && <VerifiedBadge />}
                      <Stars n={review.rating} size={13} />
                      <span className="ml-auto text-xs text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-sm text-gray-300">{review.text}</p>
                  </div>
                  {review.comments.map((c, ci) => (
                    <div key={ci} className="ml-6 rounded-lg border border-white/5 bg-white/2 px-4 py-2.5 text-sm">
                      <span className="font-medium text-gray-300">@{c.username}</span><span className="mx-2 text-gray-600">·</span><span className="text-gray-400">{c.text}</span><span className="ml-2 text-xs text-gray-600">{c.date}</span>
                    </div>
                  ))}
                  <div className="ml-6 flex gap-2">
                    <input value={commentInputs[review.id] ?? ""} onChange={e => setCommentInputs(p => ({ ...p, [review.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && submitComment(review.id)} placeholder="Add a comment…" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none" />
                    <button onClick={() => submitComment(review.id)} className="rounded-lg bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition">Post</button>
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
