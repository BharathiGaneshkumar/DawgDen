import { Button } from "@/components/ui/button";

export default function ListingsPage() {
  const listings = [
    { id: 1, title: "Cozy Studio near UWB", rent: 1200, bedrooms: 1, address: "Bothell, WA 98011", affordability: "green", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400" },
    { id: 2, title: "2BR Apartment - Shared", rent: 1800, bedrooms: 2, address: "Kenmore, WA 98028", affordability: "yellow", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400" },
    { id: 3, title: "Modern 1BR Mill Creek", rent: 2200, bedrooms: 1, address: "Mill Creek, WA 98012", affordability: "red", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" },
    { id: 4, title: "3BR House - Split 3 ways", rent: 2700, bedrooms: 3, address: "Bothell, WA 98021", affordability: "green", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400" },
    { id: 5, title: "Luxury 2BR Townhouse", rent: 2500, bedrooms: 2, address: "Woodinville, WA 98072", affordability: "yellow", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400" },
    { id: 6, title: "Shared Room for Student", rent: 750, bedrooms: 1, address: "Bothell, WA 98011", affordability: "green", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary">🏘️ Listings</h1>
          <p className="mt-2 text-primary/70">Student-verified housing near UW Bothell</p>
        </div>
        <a href="/listings/new" className="rounded-xl bg-primary text-[#c5b4e3] px-6 py-3 font-semibold text-[#c5b4e3]">
          + Post a Listing
        </a>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {["All", "1 BR", "2 BR", "3+ BR", "Under $1500", "Pet Friendly"].map((filter) => (
          <Button
            key={filter}
            variant="outline"
            className="rounded-full border-primary/20 bg-white/80 border-primary/10 px-4 py-1.5 text-sm text-primary/80 transition hover:bg-primary/10 hover:text-pink-100"
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <a key={listing.id} href={`/listings/${listing.id}`}
            className="group rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 transition-all hover:-translate-y-1 hover:border-primary/20">
            <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-purple-800/40 to-pink-200/40 text-5xl overflow-hidden">
              <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${listing.affordability === "green" ? "bg-emerald-100 border border-emerald-300 text-emerald-800" :
              listing.affordability === "yellow" ? "bg-yellow-100 border border-yellow-300 text-yellow-800" :
                "bg-red-100 border border-red-300 text-red-800"
              }`}>
              {listing.affordability === "green" ? "✅ Affordable" : listing.affordability === "yellow" ? "⚠️ Moderate" : "❌ Expensive"}
            </span>
            <h2 className="mt-3 text-lg font-bold text-primary">{listing.title}</h2>
            <p className="mt-1 text-sm text-primary/70">📍 {listing.address}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">${listing.rent.toLocaleString()}<span className="text-sm font-normal text-primary/70">/mo</span></span>
              <span className="text-sm text-primary/70">🛏 {listing.bedrooms} bed</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
