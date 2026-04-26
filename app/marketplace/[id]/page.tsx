"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Tag, Package } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

const categoryColors: Record<string, string> = {
  Furniture: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Electronics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Books: "bg-yellow-100 border border-yellow-300 text-yellow-800",
  Kitchen: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const ITEMS = [
  { id: "1", title: "IKEA MICKE Desk", price: 45, category: "Furniture", seller: "Alex Chen", sellerEmail: "alex.chen@uw.edu", condition: "New", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6ea?w=800", description: "Barely used IKEA MICKE desk in white. Perfect for dorm rooms. Comes with the drawer unit included. Picked up from IKEA last year and only used for one quarter before switching to a standing desk. No damage, minor scuffs on the bottom. Must pick up from Beardslee Village." },
  { id: "2", title: "Calc 124/125 Textbook", price: 20, category: "Books", seller: "Sarah J.", sellerEmail: "sj24@uw.edu", condition: "Good", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", description: "Stewart Calculus: Early Transcendentals, 8th edition. Used for TMATH 124 and 125. Some highlighting in chapters 1–4, otherwise clean. Comes with the online access code (unused). Great deal for incoming freshmen." },
  { id: "3", title: "Dorm Mini Fridge", price: 65, category: "Kitchen", seller: "Mike T.", sellerEmail: "miket@uw.edu", condition: "Fair", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800", description: "Compact 1.6 cu ft mini fridge, works great. Has one small cosmetic dent on the side door that doesn't affect function. I'm moving off-campus and my new place has a full-size fridge. Pickup from UWB North Creek Events Center parking lot." },
  { id: "4", title: "27-inch LG Monitor 144Hz", price: 110, category: "Electronics", seller: "Kevin W.", sellerEmail: "kevinw@uw.edu", condition: "Good", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800", description: "LG 27GL650F 27-inch FHD 144Hz gaming monitor. No dead pixels, minimal backlight bleed. Selling because I upgraded to a 4K panel. Comes with original box, stand, power cable, and DisplayPort cable. Local pickup preferred, can meet on campus." },
  { id: "5", title: "Keurig Coffee Maker", price: 15, category: "Kitchen", seller: "Emily R.", sellerEmail: "emilyr@uw.edu", condition: "New", image: "https://images.unsplash.com/photo-1495474472207-464a4d96a792?w=800", description: "Keurig K-Mini, barely used. Got it as a gift but I prefer drip coffee. Makes 6–12 oz cups, fits under most cabinets. Original packaging included. Cash or Venmo only, pick up near Discovery Hall." },
  { id: "6", title: "Ergonomic Office Chair", price: 30, category: "Furniture", seller: "David L.", sellerEmail: "davidl@uw.edu", condition: "Fair", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800", description: "Mesh back ergonomic chair with adjustable lumbar support and armrests. Has some wear on the seat cushion but is comfortable for long study sessions. Great for your desk setup. Pickup from Kenmore area, flexible on timing." },
];

export default function MarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const item = ITEMS.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-primary/50 mb-4">Item not found.</p>
          <Link href="/marketplace" className="text-sm text-primary hover:underline">← Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 min-h-screen">
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-primary/60 hover:text-primary transition mb-6">
        <ChevronLeft size={16} /> Back to Marketplace
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-purple-800/40 to-pink-200/40 aspect-square">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-3 ${categoryColors[item.category]}`}>
              {item.category}
            </span>
            <h1 className="text-3xl font-bold text-primary">{item.title}</h1>
            <p className="text-4xl font-extrabold text-primary mt-2">${item.price}</p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-white/60 px-4 py-3">
            <Package size={15} className="text-primary/60 shrink-0" />
            <span className="text-sm text-primary/70">Condition:</span>
            <span className="text-sm font-semibold text-primary">{item.condition}</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-white/60 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary shrink-0">
              {item.seller.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-primary/50">Listed by</p>
              <p className="text-sm font-semibold text-primary">{item.seller}</p>
            </div>
          </div>

          {user ? (
            <a
              href={`mailto:${item.sellerEmail}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary text-[#c5b4e3] px-6 py-3 font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40"
            >
              <MessageCircle size={16} /> Contact Seller
            </a>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white/60 px-6 py-3 font-semibold text-primary/80 transition hover:bg-white/80"
            >
              Sign in to contact seller
            </Link>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-white/40 px-4 py-2.5 text-xs text-primary/50">
            <Tag size={12} />
            Contact via email · Be safe and meet on campus
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6">
        <h2 className="text-lg font-bold text-primary mb-3">About this item</h2>
        <p className="text-sm text-primary/80 leading-relaxed">{item.description}</p>
      </div>

      {/* Other listings */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-primary mb-4">More listings</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.filter((i) => i.id !== id).slice(0, 3).map((other) => (
            <Link
              key={other.id}
              href={`/marketplace/${other.id}`}
              className="group flex items-center gap-3 rounded-xl border border-primary/10 bg-white/60 p-3 hover:bg-white/80 hover:border-primary/20 transition"
            >
              <img src={other.image} alt={other.title} className="h-14 w-14 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{other.title}</p>
                <p className="text-xs text-primary/60">${other.price} · {other.condition}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
