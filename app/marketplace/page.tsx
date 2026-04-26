"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import NewMarketplaceModal from "@/components/modals/NewMarketplaceModal";

const categoryColors: Record<string, string> = {
  Furniture: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Electronics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Books: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Appliances: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Clothing: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const CATEGORIES = ["All Items", "Furniture", "Electronics", "Appliances", "Books", "Clothing", "Other"];

export default function MarketplacePage() {
  const { user } = useUser();
  const isStudent = (user as { role?: string } | undefined | null)?.role === "STUDENT";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [sortOrder, setSortOrder] = useState<"none" | "lowToHigh" | "highToLow">("none");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchItems = async () => {
    setLoading(true);
    let url = "/api/marketplace?";
    if (activeCategory !== "All Items") url += `category=${activeCategory}&`;
    if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [debouncedSearch, activeCategory]);

  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.price - b.price;
    if (sortOrder === "highToLow") return b.price - a.price;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 min-h-[calc(100vh-64px)]">
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">🛒 Student Marketplace</h1>
          <p className="mt-2 text-gray-400">Buy and sell within the UW Bothell community</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4 justify-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
          {isStudent ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/40 text-center"
            >
              + Post an Item
            </button>
          ) : user ? null : (
            <Link
              href="/login"
              className="w-full sm:w-auto shrink-0 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/10 text-center"
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
                  ? "border-violet-500 bg-violet-500/10 text-violet-400"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none focus:border-violet-500 cursor-pointer shadow-sm [&>option]:bg-gray-900"
          >
            <option value="none">Newest</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading...</div>
      ) : sortedItems.length === 0 ? (
        <div className="py-20 text-center text-gray-500">No items match your search.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map((item) => (
            <Link
              key={item.id}
              href={`/marketplace/${item.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-violet-500/10 h-full"
            >
              <div className="relative h-48 w-full bg-gray-800 flex items-center justify-center border-b border-white/10 overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="text-gray-600">No Image</div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md bg-gray-900/80 ${categoryColors[item.category] || categoryColors.Other}`}>
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2">{item.title}</h2>
                  <span className="shrink-0 text-2xl font-bold text-white bg-white/5 px-2 py-1 rounded-lg border border-white/10">${item.price}</span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Seller:</span>
                  <span className="font-semibold text-gray-200">{item.user?.name || item.user?.email || "Unknown"}</span>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/10">
                  <span className={`text-xs font-semibold ${item.isSold ? "text-red-400" : "text-emerald-400"}`}>
                    {item.isSold ? "SOLD" : "AVAILABLE"}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-violet-400 transition">View details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewMarketplaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchItems()} 
      />
    </div>
  );
}
