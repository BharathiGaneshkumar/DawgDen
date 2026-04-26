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
          <h1 className="text-4xl font-extrabold text-primary">🛒 Student Marketplace</h1>
          <p className="mt-2 text-primary/70 font-medium">Buy and sell within the UW Bothell community</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4 justify-center">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md py-3.5 pl-12 pr-4 text-sm text-primary placeholder:text-primary/40 focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
            />
          </div>
          {isStudent ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto shrink-0 rounded-2xl bg-primary px-8 py-3.5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 text-center"
            >
              + Post an Item
            </button>
          ) : user ? null : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto shrink-0 rounded-2xl border border-primary/20 bg-white/40 backdrop-blur-md px-8 py-3.5 font-bold text-primary transition-all hover:bg-white/60 text-center"
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
              className={`rounded-full border px-5 py-2 text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                  : "border-primary/10 bg-white/40 text-primary/60 hover:border-primary/30 hover:bg-white/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary/40">Sort by</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="rounded-xl border border-primary/10 bg-white/40 px-3 py-2 text-sm font-bold text-primary focus:outline-none cursor-pointer"
          >
            <option value="none">Newest</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/20 py-20 text-center">
          <p className="text-primary/40 font-medium text-lg">No items found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map((item) => (
            <Link
              key={item.id}
              href={`/marketplace/${item.id}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:bg-white/60 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-primary/5 relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-primary/20 opacity-50">
                    📦
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <div className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg">
                    ${item.price}
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${categoryColors[item.category] || categoryColors.Other}`}>
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="line-clamp-1 text-xl font-bold text-primary group-hover:text-primary transition-colors">
                  {item.title}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {(item.user?.name || item.user?.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="font-bold text-primary/50">{item.user?.name || item.user?.email || "Unknown"}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-primary/5 flex items-center justify-between">
                  <span className={`text-[10px] font-black tracking-widest ${item.isSold ? "text-red-500" : "text-emerald-600"}`}>
                    {item.isSold ? "SOLD" : "AVAILABLE"}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    →
                  </div>
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
