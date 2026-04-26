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
    <div className="mx-auto max-w-2xl px-4 py-12 min-h-screen">
      {/* Back link */}
      <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">List a Place</h1>
        <p className="mt-1 text-gray-400 text-sm">Fill in the details so students can find your listing.</p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${done ? "bg-emerald-500 text-white" : active ? "bg-violet-600 text-white" : "bg-white/10 text-gray-500"}`}>
                {done ? <CheckCircle2 size={16} /> : n}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? "text-white" : done ? "text-emerald-400" : "text-gray-500"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? "bg-emerald-500/50" : "bg-white/10"}`} />}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Basic Info ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Home size={18} className="text-violet-400" /> Basic Details</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Listing Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cozy 2BR near UWB campus"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300 flex items-center gap-1.5"><MapPin size={14} className="text-violet-400" /> Address *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 18101 Bothell Way NE, Bothell, WA 98011"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300 flex items-center gap-1.5"><DollarSign size={14} className="text-violet-400" /> Rent / month *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    type="number"
                    min={0}
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder="1200"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-8 pr-4 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Security Deposit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    type="number"
                    min={0}
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="optional"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-8 pr-4 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300 flex items-center gap-1.5"><Bed size={14} className="text-violet-400" /> Bedrooms *</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition cursor-pointer"
                >
                  {["1", "2", "3", "4", "5"].map((n) => (
                    <option key={n} value={n}>{n} bedroom{n !== "1" ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300 flex items-center gap-1.5"><Bath size={14} className="text-violet-400" /> Bathrooms *</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition cursor-pointer"
                >
                  {["1", "1.5", "2", "2.5", "3", "3.5", "4"].map((n) => (
                    <option key={n} value={n}>{n} bathroom{n !== "1" ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300 flex items-center gap-1.5"><FileText size={14} className="text-violet-400" /> Lease Length</label>
                <select
                  value={leaseLength}
                  onChange={(e) => setLeaseLength(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition cursor-pointer"
                >
                  {LEASE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300 flex items-center gap-1.5"><Calendar size={14} className="text-violet-400" /> Available From</label>
                <input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the place — parking situation, proximity to campus, neighborhood vibe, rules, etc."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none resize-none transition"
              />
            </div>
          </div>

          <button
            onClick={() => step1Valid() && setStep(2)}
            disabled={!step1Valid()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-40 transition"
          >
            Next: Amenities <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── STEP 2: Amenities & Utilities ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Zap size={18} className="text-violet-400" /> Amenities & Utilities</h2>

            {/* Amenities grid */}
            <div>
              <p className="text-sm font-medium text-gray-300 mb-3">What's included?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES.map(({ key, label, icon: Icon }) => {
                  const on = amenities.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAmenity(key)}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        on
                          ? "border-violet-500 bg-violet-500/15 text-violet-300"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      <Icon size={15} className={on ? "text-violet-400" : "text-gray-500"} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Utilities toggle */}
            <div>
              <button
                type="button"
                onClick={() => setUtilitiesIncluded((v) => !v)}
                className={`w-full flex items-center justify-between rounded-xl border px-5 py-4 transition ${
                  utilitiesIncluded
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap size={16} className={utilitiesIncluded ? "text-emerald-400" : "text-gray-500"} />
                  <div className="text-left">
                    <p className="font-medium text-sm">{utilitiesIncluded ? "Utilities included in rent" : "Utilities NOT included"}</p>
                    <p className="text-xs mt-0.5 opacity-70">Electricity, water, trash, etc.</p>
                  </div>
                </div>
                <div className={`h-6 w-11 rounded-full transition-colors relative ${utilitiesIncluded ? "bg-emerald-500" : "bg-white/20"}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${utilitiesIncluded ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </button>
            </div>

            {/* ISP info for the area */}
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">📶 Internet providers near UW Bothell</p>
              <p className="text-xs text-gray-500 mb-3">For reference — tenants will see this. No action needed unless you want to add this info to your description.</p>
              <div className="space-y-2">
                {AREA_ISPS.map((isp) => (
                  <div key={isp.name} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isp.recommended ? "border-violet-500/30 bg-violet-500/5" : "border-white/5 bg-white/3"}`}>
                    <div className="flex items-center gap-3">
                      <Wifi size={14} className={isp.recommended ? "text-violet-400" : "text-gray-500"} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{isp.name}</span>
                          {isp.recommended && <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-semibold">Best</span>}
                          <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{isp.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{isp.note}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs text-gray-300 font-medium">{isp.maxSpeed}</p>
                      <p className="text-xs text-gray-500">{isp.avgPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 font-semibold text-gray-300 hover:bg-white/10 transition flex items-center justify-center gap-2">
              <ChevronLeft size={18} /> Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 rounded-xl bg-violet-600 py-3.5 font-semibold text-white hover:bg-violet-500 transition flex items-center justify-center gap-2">
              Next: Photos <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Photos & Submit ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><UploadCloud size={18} className="text-violet-400" /> Photos</h2>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img src={imagePreview} alt="preview" className="w-full h-64 object-cover" />
                <button
                  onClick={() => { setImagePreview(""); setImageDataUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-3 right-3 rounded-full bg-black/70 p-1.5 text-white hover:bg-black transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/3 py-14 gap-3 hover:border-violet-500/50 hover:bg-violet-500/5 transition group"
              >
                <UploadCloud className="h-10 w-10 text-gray-500 group-hover:text-violet-400 transition" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-300">Upload a photo</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP — pick from your device</p>
                </div>
              </button>
            )}

            <p className="text-xs text-gray-500">Photo is optional but listings with photos get significantly more views.</p>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2 text-sm">
            <p className="font-semibold text-white mb-3">Review your listing</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-gray-400">
              <span>Title</span><span className="text-white truncate">{title}</span>
              <span>Address</span><span className="text-white truncate">{address}</span>
              <span>Rent</span><span className="text-white">${Number(rent).toLocaleString()}/mo</span>
              <span>Bedrooms</span><span className="text-white">{bedrooms} bed · {bathrooms} bath</span>
              <span>Lease</span><span className="text-white">{leaseLength} months</span>
              {deposit && <><span>Deposit</span><span className="text-white">${Number(deposit).toLocaleString()}</span></>}
              <span>Amenities</span><span className="text-white">{amenities.length > 0 ? amenities.join(", ") : "None selected"}</span>
              <span>Utilities</span><span className={utilitiesIncluded ? "text-emerald-400" : "text-gray-300"}>{utilitiesIncluded ? "Included" : "Not included"}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 font-semibold text-gray-300 hover:bg-white/10 transition flex items-center justify-center gap-2">
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Posting…</> : "🏠 Post Listing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
