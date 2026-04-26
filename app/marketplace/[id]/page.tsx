"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Tag, Package, Loader2 } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

const categoryColors: Record<string, string> = {
  Furniture: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Electronics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Books: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Appliances: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Clothing: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function MarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/marketplace/${id}`)
      .then((r) => r.json())
      .then((data) => { setItem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  if (!item || item.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Item not found.</p>
          <Link href="/marketplace" className="text-sm text-violet-400 hover:underline">← Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const categoryColor = categoryColors[item.category] || categoryColors.Other;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 min-h-screen">
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-6">
        <ChevronLeft size={16} /> Back to Marketplace
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900 aspect-square flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-600 text-6xl">📦</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColor}`}>
                {item.category}
              </span>
              {item.isSold && (
                <span className="inline-flex items-center rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                  SOLD
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white">{item.title}</h1>
            <p className="text-4xl font-extrabold text-white mt-2">${item.price}</p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Package size={15} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-400">Contact:</span>
            <span className="text-sm font-semibold text-white truncate">{item.contactInfo}</span>
          </div>

          {item.user && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/20 border border-violet-500/30 text-sm font-bold text-violet-300 shrink-0">
                {(item.user.name || item.user.email || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500">Listed by</p>
                <p className="text-sm font-semibold text-white">{item.user.name || item.user.email}</p>
              </div>
            </div>
          )}

          {!item.isSold && (
            user ? (
              <a
                href={`mailto:${item.contactInfo}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white px-6 py-3 font-semibold shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:bg-violet-500"
              >
                <MessageCircle size={16} /> Contact Seller
              </a>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/10"
              >
                Sign in to contact seller
              </Link>
            )
          )}

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-gray-500">
            <Tag size={12} />
            Contact via email · Meet on campus for safety
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-bold text-white mb-3">About this item</h2>
        <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}
