import { Search, Star, MessageSquare } from "lucide-react";

const landlords = [
  {
    id: 1,
    name: "John Smith",
    address: "18204 104th Ave NE, Bothell, WA",
    rating: 4.5,
    depositReturned: true,
    maintenanceRating: "Excellent",
    reviewSnippet: "Super responsive. Fixed the dishwasher the same day we called. Really fair with the deposit when moving out.",
  },
  {
    id: 2,
    name: "Apex Properties Management",
    address: "Multiple locations near UWB",
    rating: 2.1,
    depositReturned: false,
    maintenanceRating: "Poor",
    reviewSnippet: "Took 3 weeks to fix the heating during winter. Charged $300 from deposit for 'cleaning' even though we deep cleaned.",
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    address: "19315 110th Ave NE, Bothell, WA",
    rating: 4.8,
    depositReturned: true,
    maintenanceRating: "Good",
    reviewSnippet: "Sarah is a great landlord! She genuinely cares about her tenants and brought us cookies during finals week.",
  },
  {
    id: 4,
    name: "Campus Edge Living",
    address: "18500 112th Ave NE, Bothell, WA",
    rating: 3.5,
    depositReturned: true,
    maintenanceRating: "Average",
    reviewSnippet: "Decent place, but the maintenance portal is buggy. They did return the full deposit minus a standard carpet cleaning fee.",
  },
];

export default function LandlordsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">⭐ Landlord Reviews</h1>
          <p className="mt-2 text-pink-100/60">Real reviews from UW Bothell students</p>
        </div>
        
        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-300/50" />
            <input 
              type="text" 
              placeholder="Search landlords or addresses..." 
              className="w-full rounded-xl border border-pink-300/20 bg-pink-500/10 py-3 pl-10 pr-4 text-sm text-pink-100 placeholder:text-pink-300/40 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-colors"
            />
          </div>
          <button className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:-translate-y-0.5 hover:shadow-pink-500/40">
            + Write a Review
          </button>
        </div>
      </div>

      {/* Landlord Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {landlords.map((landlord) => (
          <div 
            key={landlord.id}
            className="group flex flex-col rounded-2xl border border-pink-300/10 bg-pink-500/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-300/20 hover:bg-pink-500/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors">
                  {landlord.name}
                </h2>
                <p className="mt-1 text-sm text-pink-100/50">📍 {landlord.address}</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-pink-500/10 px-2.5 py-1 text-pink-300 font-semibold text-lg border border-pink-500/20">
                <span>{landlord.rating}</span>
                <Star className="h-4 w-4 fill-pink-400 text-pink-400" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-950/40 p-3 border border-pink-300/5">
                <p className="text-xs text-pink-100/50 mb-1">Deposit Returned</p>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex h-2 w-2 rounded-full ${landlord.depositReturned ? 'bg-emerald-400' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                  <span className={`font-medium ${landlord.depositReturned ? 'text-emerald-400' : 'text-red-400'}`}>
                    {landlord.depositReturned ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-gray-950/40 p-3 border border-pink-300/5">
                <p className="text-xs text-pink-100/50 mb-1">Maintenance</p>
                <p className={`font-medium ${
                  landlord.maintenanceRating === 'Excellent' ? 'text-emerald-400' :
                  landlord.maintenanceRating === 'Good' ? 'text-blue-400' :
                  landlord.maintenanceRating === 'Average' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {landlord.maintenanceRating}
                </p>
              </div>
            </div>

            <div className="mt-5 relative">
              <MessageSquare className="absolute -left-1 -top-1 h-5 w-5 text-purple-400/20 rotate-180" />
              <p className="pl-6 text-sm text-pink-100/70 italic leading-relaxed">
                "{landlord.reviewSnippet}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
