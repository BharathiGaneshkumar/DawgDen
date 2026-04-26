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
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">Listing Detail — {params.id}</h1>
    </div>
  );
}
