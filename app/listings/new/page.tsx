"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Home, MapPin, DollarSign, Bed, Bath, Calendar, FileText,
  Wifi, Car, WashingMachine, Wind, PawPrint, Sofa, Zap, ChevronRight,
  ChevronLeft, UploadCloud, CheckCircle2, X, Loader2, Dumbbell, BatteryCharging,
} from "lucide-react";

// ── static ISP data for the UWB / Bothell / Kenmore area ──────────────
const AREA_ISPS = [
  { name: "Xfinity", type: "Cable", maxSpeed: "1.2 Gbps", avgPrice: "$40–85/mo", rating: 3.2, note: "Widely available, consistent speeds, contracts required" },
  { name: "Ziply Fiber", type: "Fiber", maxSpeed: "2 Gbps", avgPrice: "$30–60/mo", rating: 4.5, note: "Best value fiber, expanding coverage in Bothell/Kenmore", recommended: true },
  { name: "T-Mobile Home Internet", type: "5G Fixed Wireless", maxSpeed: "300 Mbps", avgPrice: "$50/mo flat", rating: 3.8, note: "No contracts, great for areas without fiber" },
  { name: "Astound (Wave)", type: "Cable", maxSpeed: "940 Mbps", avgPrice: "$35–70/mo", rating: 3.6, note: "Limited coverage; check availability at your address" },
];

const AMENITIES = [
  { key: "wifi", label: "WiFi / Internet", icon: Wifi },
  { key: "parking", label: "Parking", icon: Car },
  { key: "laundry", label: "In-Unit Laundry", icon: WashingMachine },
  { key: "ac", label: "Air Conditioning", icon: Wind },
  { key: "petFriendly", label: "Pet Friendly", icon: PawPrint },
  { key: "furnished", label: "Furnished", icon: Sofa },
  { key: "gym", label: "Gym / Fitness", icon: Dumbbell },
  { key: "evCharging", label: "EV Charging", icon: BatteryCharging },
];

const STEPS = ["Basic Info", "Amenities", "Photos & Submit"];

const LEASE_OPTIONS = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "9", label: "9 months" },
  { value: "12", label: "12 months (standard)" },
  { value: "18", label: "18 months" },
  { value: "24", label: "24 months" },
];

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 1
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [deposit, setDeposit] = useState("");
  const [leaseLength, setLeaseLength] = useState("12");
  const [availableFrom, setAvailableFrom] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [amenities, setAmenities] = useState<string[]>([]);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);

  // Step 3
  const [imagePreview, setImagePreview] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");

  function toggleAmenity(key: string) {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function step1Valid() {
    return title.trim() && address.trim() && rent && Number(rent) > 0;
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          address: address.trim(),
          rent: parseFloat(rent),
          bedrooms: parseInt(bedrooms),
          bathrooms: parseFloat(bathrooms),
          deposit: deposit ? parseFloat(deposit) : null,
          leaseLength: parseInt(leaseLength),
          availableFrom: availableFrom ? new Date(availableFrom).toISOString() : null,
          description: description.trim(),
          amenities,
          utilitiesIncluded,
          imageUrl: imageDataUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post listing");
      }

      const listing = await res.json();
      router.push(`/listings/${listing.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 min-h-screen relative z-10">
      {/* Back link */}
      <button 
        onClick={() => router.back()} 
        className="mb-8 inline-flex items-center gap-2 rounded-2xl bg-white/40 backdrop-blur-md px-4 py-2 text-sm font-black text-primary/60 hover:bg-white/60 hover:text-primary transition-all active:scale-95 shadow-sm"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-primary leading-tight">List a Place</h1>
        <p className="mt-2 text-lg font-bold text-primary/40 uppercase tracking-widest">Share your space with students</p>
      </div>

      {/* Step indicator */}
      <div className="mb-10 flex items-center gap-3">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} className="flex items-center gap-3 flex-1">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base font-black transition-all shadow-lg ${done ? "bg-emerald-500 text-white shadow-emerald-500/20" : active ? "bg-primary text-white shadow-primary/20" : "bg-white/40 text-primary/30"}`}>
                {done ? <CheckCircle2 size={20} /> : n}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${active ? "text-primary" : done ? "text-emerald-600" : "text-primary/20"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-1 rounded-full ${done ? "bg-emerald-500/30" : "bg-primary/5"}`} />}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Basic Info ── */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-xl p-8 space-y-8 shadow-2xl">
            <h2 className="text-xl font-black text-primary flex items-center gap-3"><Home size={22} className="text-pink-500" /> Basic Details</h2>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Listing Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cozy 2BR near UWB campus"
                className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-4 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1 flex items-center gap-2"><MapPin size={14} /> Address *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 18101 Bothell Way NE, Bothell, WA 98011"
                className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-4 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1 flex items-center gap-2"><DollarSign size={14} /> Rent / month *</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black opacity-30">$</span>
                  <input
                    type="number"
                    min={0}
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder="1200"
                    className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 py-4 pl-10 pr-5 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Security Deposit</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black opacity-30">$</span>
                  <input
                    type="number"
                    min={0}
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="optional"
                    className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 py-4 pl-10 pr-5 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1 flex items-center gap-2"><Bed size={14} /> Bedrooms *</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-4 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                >
                  {["1", "2", "3", "4", "5"].map((n) => (
                    <option key={n} value={n}>{n} bedroom{n !== "1" ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1 flex items-center gap-2"><Bath size={14} /> Bathrooms *</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-4 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                >
                  {["1", "1.5", "2", "2.5", "3", "3.5", "4"].map((n) => (
                    <option key={n} value={n}>{n} bathroom{n !== "1" ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1 flex items-center gap-2"><FileText size={14} /> Lease Length</label>
                <select
                  value={leaseLength}
                  onChange={(e) => setLeaseLength(e.target.value)}
                  className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-4 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                >
                  {LEASE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1 flex items-center gap-2"><Calendar size={14} /> Available From</label>
                <input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-4 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the place — parking situation, proximity to campus, neighborhood vibe, rules, etc."
                className="w-full resize-none rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-4 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => step1Valid() && setStep(2)}
            disabled={!step1Valid()}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-black text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-sm"
          >
            Next: Amenities <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── STEP 2: Amenities & Utilities ── */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-xl p-8 space-y-8 shadow-2xl">
            <h2 className="text-xl font-black text-primary flex items-center gap-3"><Zap size={22} className="text-yellow-500" /> Amenities & Utilities</h2>

            {/* Amenities grid */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">What's included?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {AMENITIES.map(({ key, label, icon: Icon }) => {
                  const on = amenities.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAmenity(key)}
                      className={`group flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-sm font-black transition-all active:scale-95 shadow-sm ${
                        on
                          ? "border-primary bg-primary text-white shadow-primary/20"
                          : "border-primary/5 bg-white/40 text-primary/40 hover:border-primary/20 hover:text-primary"
                      }`}
                    >
                      <Icon size={18} className={on ? "text-white" : "text-primary/20 group-hover:text-primary/40"} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Utilities toggle */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Utilities</label>
              <button
                type="button"
                onClick={() => setUtilitiesIncluded((v) => !v)}
                className={`w-full flex items-center justify-between rounded-[28px] border-2 px-6 py-5 transition-all active:scale-[0.98] shadow-sm ${
                  utilitiesIncluded
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                    : "border-primary/5 bg-white/40 text-primary/40 hover:border-primary/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${utilitiesIncluded ? "bg-emerald-500 text-white" : "bg-primary/5 text-primary/20"}`}>
                    <Zap size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-base">{utilitiesIncluded ? "Utilities included in rent" : "Utilities NOT included"}</p>
                    <p className={`text-xs font-bold uppercase tracking-widest ${utilitiesIncluded ? "text-emerald-600/60" : "text-primary/20"}`}>Electricity, water, trash, etc.</p>
                  </div>
                </div>
                <div className={`h-8 w-14 rounded-full transition-colors relative shadow-inner ${utilitiesIncluded ? "bg-emerald-500" : "bg-primary/10"}`}>
                  <div className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${utilitiesIncluded ? "translate-x-7" : "translate-x-1"}`} />
                </div>
              </button>
            </div>

            {/* ISP info for the area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30">Local Internet Providers</label>
                <div className="flex items-center gap-1 text-[10px] font-black text-primary/20 uppercase tracking-widest">
                  <Wifi size={10} /> AREA INFO
                </div>
              </div>
              <div className="space-y-3">
                {AREA_ISPS.map((isp) => (
                  <div key={isp.name} className={`group relative flex items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all shadow-sm ${isp.recommended ? "border-primary/20 bg-primary/5" : "border-primary/5 bg-white/40 hover:bg-white/60"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isp.recommended ? "bg-primary text-white" : "bg-primary/5 text-primary/20"}`}>
                        <Wifi size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-primary">{isp.name}</span>
                          {isp.recommended && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-widest shadow-sm">Best</span>}
                          <span className="text-[10px] text-primary/40 font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-lg">{isp.type}</span>
                        </div>
                        <p className="text-xs font-bold text-primary/40 mt-0.5">{isp.note}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-black text-primary">{isp.maxSpeed}</p>
                      <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{isp.avgPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setStep(1)} 
              className="flex-1 rounded-[28px] border-2 border-primary/5 bg-white/40 py-5 font-black text-primary/40 hover:bg-white/60 hover:text-primary transition-all active:scale-95 shadow-sm uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button 
              onClick={() => setStep(3)} 
              className="flex-1 rounded-[28px] bg-primary py-5 font-black text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              Next: Photos <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Photos & Submit ── */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-xl p-8 space-y-8 shadow-2xl">
            <h2 className="text-xl font-black text-primary flex items-center gap-3"><UploadCloud size={22} className="text-pink-500" /> Photos</h2>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

            {imagePreview ? (
              <div className="relative rounded-3xl overflow-hidden border-4 border-white/50 shadow-xl group">
                <img src={imagePreview} alt="preview" className="w-full h-80 object-cover" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => { setImagePreview(""); setImageDataUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-4 right-4 rounded-2xl bg-white/90 backdrop-blur-md p-3 text-primary shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center rounded-[32px] border-4 border-dashed border-primary/5 bg-white/40 py-20 gap-4 hover:border-primary/20 hover:bg-white/60 transition-all active:scale-[0.98] group"
              >
                <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-primary">Upload listing photos</p>
                  <p className="text-xs font-bold text-primary/30 uppercase tracking-widest mt-1">JPG, PNG, WEBP — pick from device</p>
                </div>
              </button>
            )}

            <p className="text-xs font-bold text-primary/30 uppercase tracking-widest text-center">✨ Listings with photos get 3x more views</p>
          </div>

          {/* Summary Card */}
          <div className="rounded-[40px] border border-white/40 bg-white/80 backdrop-blur-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <CheckCircle2 size={120} className="text-primary" />
            </div>
            <h3 className="text-lg font-black text-primary uppercase tracking-widest">Final Review</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Listing Title</p>
                <p className="text-base font-black text-primary truncate">{title || "Untitled"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Monthly Rent</p>
                <p className="text-base font-black text-primary">${Number(rent || 0).toLocaleString()}/mo</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Property Address</p>
                <p className="text-base font-black text-primary truncate">{address || "No address"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Configuration</p>
                <p className="text-base font-black text-primary">{bedrooms} bed · {bathrooms} bath</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Lease Terms</p>
                <p className="text-base font-black text-primary">{leaseLength} months · {utilitiesIncluded ? "Utilities Included" : "Utilities Extra"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Amenities</p>
                <p className="text-base font-black text-primary truncate">{amenities.length > 0 ? amenities.join(", ") : "None listed"}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-5 text-sm font-bold text-red-500 animate-shake">{error}</div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => setStep(2)} 
              className="flex-1 rounded-[28px] border-2 border-primary/5 bg-white/40 py-5 font-black text-primary/40 hover:bg-white/60 hover:text-primary transition-all active:scale-95 shadow-sm uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] rounded-[28px] bg-primary py-5 font-black text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={20} className="animate-spin" /> POSTING…</> : <>🏠 POST LISTING</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
