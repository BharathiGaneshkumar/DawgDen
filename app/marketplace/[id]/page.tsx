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
    <div className="mx-auto max-w-5xl px-4 py-12 min-h-screen relative z-10">
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary/60 hover:text-primary transition-colors mb-8">
        <ChevronLeft size={16} /> Back to Marketplace
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-[40px] border border-primary/10 bg-white/60 backdrop-blur-md aspect-square flex items-center justify-center shadow-sm">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
          ) : (
            <div className="text-primary/20 text-8xl opacity-20">📦</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[40px] border border-primary/10 bg-white/60 backdrop-blur-md p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${categoryColor}`}>
                {item.category}
              </span>
              {item.isSold && (
                <span className="inline-flex items-center rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-500">
                  SOLD
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black text-primary leading-tight">{item.title}</h1>
            <p className="text-5xl font-black text-primary mt-4">${item.price}</p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-4 rounded-3xl border border-primary/5 bg-white/40 p-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Package size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Contact Method</p>
                <p className="text-base font-bold text-primary truncate">{item.contactInfo}</p>
              </div>
            </div>

            {item.user && (
              <div className="flex items-center gap-4 rounded-3xl border border-primary/5 bg-white/40 p-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary shrink-0">
                  {(item.user.name || item.user.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Listed by</p>
                  <p className="text-base font-bold text-primary truncate">{item.user.name || item.user.email}</p>
                </div>
              </div>
            )}
          </div>

          {!item.isSold && (
            user ? (
              <a
                href={`mailto:${item.contactInfo}`}
                className="flex items-center justify-center gap-3 rounded-2xl bg-primary text-white px-8 py-5 text-lg font-black shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-1 active:scale-95"
              >
                <MessageCircle size={20} /> Contact Seller
              </a>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-primary/10 bg-white/40 px-8 py-5 text-lg font-black text-primary transition-all hover:bg-white hover:border-primary/20 active:scale-95"
              >
                Sign in to contact seller
              </Link>
            )
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-primary/5 bg-primary/5 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-primary/40 text-center justify-center">
            <Tag size={14} className="text-primary/20" />
            <span>Meet on campus for a safe transaction</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 rounded-[40px] border border-primary/10 bg-white/40 backdrop-blur-sm p-10 space-y-6">
        <h2 className="text-2xl font-black text-primary flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">📦</span>
          About this item
        </h2>
        <p className="text-lg text-primary/70 leading-relaxed font-medium">{item.description}</p>
      </div>
    </div>
  );
}
