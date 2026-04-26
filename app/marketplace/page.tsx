"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

const categoryColors: Record<string, string> = {
  Furniture: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Electronics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Books: "bg-yellow-100 border border-yellow-300 text-yellow-800",
  Kitchen: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const conditionColors: Record<string, string> = {
  New: "text-emerald-600",
  Good: "text-blue-500",
  Fair: "text-yellow-700",
};

const ITEMS = [
  { id: "1", title: "IKEA MICKE Desk", price: 45, category: "Furniture", seller: "Alex Chen", condition: "New", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6ea?w=400" },
  { id: "2", title: "Calc 124/125 Textbook", price: 20, category: "Books", seller: "Sarah J.", condition: "Good", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
  { id: "3", title: "Dorm Mini Fridge", price: 65, category: "Kitchen", seller: "Mike T.", condition: "Fair", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400" },
  { id: "4", title: "27-inch LG Monitor 144Hz", price: 110, category: "Electronics", seller: "Kevin W.", condition: "Good", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400" },
  { id: "5", title: "Keurig Coffee Maker", price: 15, category: "Kitchen", seller: "Emily R.", condition: "New", image: "https://images.unsplash.com/photo-1495474472207-464a4d96a792?w=400" },
  { id: "6", title: "Ergonomic Office Chair", price: 30, category: "Furniture", seller: "David L.", condition: "Fair", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400" },
];

const CATEGORIES = ["All Items", "Furniture", "Electronics", "Books", "Kitchen"];

export default function MarketplacePage() {
  const { user } = useUser();
  const isStudent = (user as { role?: string } | undefined | null)?.role === "STUDENT";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [sortOrder, setSortOrder] = useState<"none" | "lowToHigh" | "highToLow">("none");

  const filtered = ITEMS
    .filter((item) => activeCategory === "All Items" || item.category === activeCategory)
    .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()) || item.seller.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "lowToHigh") return a.price - b.price;
      if (sortOrder === "highToLow") return b.price - a.price;
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 min-h-screen">
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">🛒 Student Marketplace</h1>
          <p className="mt-2 text-primary/70">Buy and sell within the UW Bothell community</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4 justify-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-primary/20 bg-white/80 py-3 pl-10 pr-4 text-sm text-primary placeholder:text-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          {isStudent ? (
            <Link
              href="/marketplace/new"
              className="w-full sm:w-auto shrink-0 rounded-xl bg-primary text-[#c5b4e3] px-6 py-3 font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 text-center"
            >
              + Post an Item
            </Link>
          ) : user ? null : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto shrink-0 rounded-xl border border-primary/20 bg-white/60 px-6 py-3 font-semibold text-primary/80 transition-all hover:bg-white/80 text-center"
            >
              Sign in to sell
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-primary/20 bg-white/80 text-primary/80 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-sm font-bold text-primary/70">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="rounded-xl border border-primary/20 bg-white/80 px-3 py-2 text-sm font-bold text-primary outline-none focus:border-primary/50 cursor-pointer shadow-sm"
          >
            <option value="none">Recommended</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-primary/50">No items match your search.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/marketplace/${item.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-white/80 hover:shadow-xl hover:shadow-primary/10 h-full"
            >
              <div className="relative h-48 w-full bg-gradient-to-br from-purple-800/40 to-pink-200/40 flex items-center justify-center border-b border-primary/10 overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md bg-white/80 ${categoryColors[item.category]}`}>
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-primary group-hover:text-primary/90 transition-colors line-clamp-2">{item.title}</h2>
                  <span className="shrink-0 text-2xl font-bold text-primary bg-white/60 px-2 py-1 rounded-lg border border-primary/10">${item.price}</span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-primary/70">Condition:</span>
                  <span className={`font-semibold bg-white/60 px-2 rounded-md ${conditionColors[item.condition]}`}>{item.condition}</span>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary/90">
                      {item.seller.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-primary/70">{item.seller}</span>
                  </div>
                  <span className="text-xs text-primary/50 group-hover:text-primary/70 transition">View details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
