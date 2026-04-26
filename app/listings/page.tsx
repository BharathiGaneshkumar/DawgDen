import { Button } from "@/components/ui/button";

export default function ListingsPage() {
  const listings = [
    { id: 1, title: "Cozy Studio near UWB", rent: 1200, bedrooms: 1, address: "Bothell, WA 98011", affordability: "green" },
    { id: 2, title: "2BR Apartment - Shared", rent: 1800, bedrooms: 2, address: "Kenmore, WA 98028", affordability: "yellow" },
    { id: 3, title: "Modern 1BR Mill Creek", rent: 2200, bedrooms: 1, address: "Mill Creek, WA 98012", affordability: "red" },
    { id: 4, title: "3BR House - Split 3 ways", rent: 2700, bedrooms: 3, address: "Bothell, WA 98021", affordability: "green" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">🏘️ Listings</h1>
          <p className="mt-2 text-pink-100/60">Student-verified housing near UW Bothell</p>
        </div>
        <a href="/listings/new" className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-3 font-semibold text-white">
          + Post a Listing
        </a>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {["All", "1 BR", "2 BR", "3+ BR", "Under $1500", "Pet Friendly"].map((filter) => (
          <Button
            key={filter}
            variant="outline"
            className="rounded-full border-pink-300/20 bg-pink-500/10 px-4 py-1.5 text-sm text-pink-200 transition hover:bg-pink-500/20 hover:text-pink-100"
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <a key={listing.id} href={`/listings/${listing.id}`}
            className="group rounded-2xl border border-pink-300/10 bg-pink-500/5 p-6 transition-all hover:-translate-y-1 hover:border-pink-300/20">
            <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-purple-800/40 to-pink-800/40 text-5xl">
              🏠
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${listing.affordability === "green" ? "bg-emerald-500/20 text-emerald-400" :
              listing.affordability === "yellow" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>
              {listing.affordability === "green" ? "✅ Affordable" : listing.affordability === "yellow" ? "⚠️ Moderate" : "❌ Expensive"}
            </span>
            <h2 className="mt-3 text-lg font-bold text-white">{listing.title}</h2>
            <p className="mt-1 text-sm text-pink-100/50">📍 {listing.address}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-white">${listing.rent.toLocaleString()}<span className="text-sm font-normal text-pink-100/50">/mo</span></span>
              <span className="text-sm text-pink-100/50">🛏 {listing.bedrooms} bed</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
