import { Search, Tag, MessageCircle } from "lucide-react";

const marketplaceItems = [
  { id: 1, title: "IKEA MICKE Desk", price: 45, category: "Furniture", seller: "Alex Chen", condition: "New", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6ea?w=400" },
  { id: 2, title: "Calc 124/125 Textbook", price: 20, category: "Books", seller: "Sarah J.", condition: "Good", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
  { id: 3, title: "Dorm Mini Fridge", price: 65, category: "Kitchen", seller: "Mike T.", condition: "Fair", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400" },
  { id: 4, title: "27-inch LG Monitor 144Hz", price: 110, category: "Electronics", seller: "Kevin W.", condition: "Good", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400" },
  { id: 5, title: "Keurig Coffee Maker", price: 15, category: "Kitchen", seller: "Emily R.", condition: "New", image: "https://images.unsplash.com/photo-1495474472207-464a4d96a792?w=400" },
  { id: 6, title: "Ergonomic Office Chair", price: 30, category: "Furniture", seller: "David L.", condition: "Fair", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400" }
];

const categoryColors: Record<string, string> = {
  Furniture: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Electronics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Books: "bg-yellow-100 border border-yellow-300 text-yellow-800 border-yellow-500/30",
  Kitchen: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const conditionColors: Record<string, string> = {
  New: "text-emerald-800",
  Good: "text-blue-400",
  Fair: "text-yellow-800",
};

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">🛒 Student Marketplace</h1>
          <p className="mt-2 text-primary/70">Buy and sell within the UW Bothell community</p>
        </div>
        
        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/90/50" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full rounded-xl border border-primary/20 bg-white/80 border-primary/10 py-3 pl-10 pr-4 text-sm text-pink-100 placeholder:text-primary/90/40 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-colors"
            />
          </div>
          <button className="w-full sm:w-auto shrink-0 rounded-xl bg-primary text-[#c5b4e3] px-6 py-3 font-semibold text-[#c5b4e3] shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40">
            + Post an Item
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-10 flex flex-wrap gap-3">
        {["All Items", "Furniture", "Electronics", "Books", "Kitchen"].map((category) => (
          <button
            key={category}
            className="rounded-full border border-primary/20 bg-white/80 border-primary/10 px-5 py-2 text-sm font-medium text-primary/80 transition hover:bg-primary/10 hover:text-primary"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {marketplaceItems.map((item) => (
          <div 
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-white/80 border-primary/10 hover:shadow-xl hover:shadow-pink-500/10"
          >
            {/* Image Placeholder */}
            <div className="relative h-48 w-full bg-gradient-to-br from-purple-800/40 to-pink-200/40 flex items-center justify-center border-b border-primary/10 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${categoryColors[item.category]}`}>
                  {item.category}
                </span>
              </div>
            </div>

            <div className="flex flex-col flex-1 p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-primary group-hover:text-primary/90 transition-colors line-clamp-2">
                  {item.title}
                </h2>
                <span className="shrink-0 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">
                  ${item.price}
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-primary/70">Condition:</span>
                <span className={`font-semibold ${conditionColors[item.condition]}`}>
                  {item.condition}
                </span>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-pink-500/30 text-xs font-bold text-primary/90">
                    {item.seller.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-pink-100/70">{item.seller}</span>
                </div>
                
                <button className="flex items-center gap-2 rounded-xl bg-white/80 border-primary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary/90 transition-all hover:bg-primary/10 hover:text-primary">
                  <MessageCircle className="h-4 w-4" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
