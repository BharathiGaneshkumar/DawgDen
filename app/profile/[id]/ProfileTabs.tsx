"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { Star, Home, MessageSquare, ShoppingBag, FileText, MapPin } from "lucide-react";

type Listing = {
  id: string;
  title: string;
  rent: number;
  bedrooms: number;
  address: string;
};
type Review = {
  id: string;
  landlordName: string;
  landlordAddress: string;
  rating: number;
  reviewText: string;
  createdAt: string;
};
type Post = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  createdAt: string;
};
type MarketplaceItem = {
  id: string;
  title: string;
  price: number;
  category: string;
  isSold: boolean;
};

export function StudentProfileTabs({
  listings,
  reviews,
  posts,
  marketItems,
}: {
  listings: Listing[];
  reviews: Review[];
  posts: Post[];
  marketItems: MarketplaceItem[];
}) {
  return (
    <Tabs defaultValue="listings">
      <TabsList>
        <TabsTrigger value="listings">
          <Home className="h-3.5 w-3.5" />
          Listings ({listings.length})
        </TabsTrigger>
        <TabsTrigger value="reviews">
          <Star className="h-3.5 w-3.5" />
          Reviews ({reviews.length})
        </TabsTrigger>
        <TabsTrigger value="posts">
          <MessageSquare className="h-3.5 w-3.5" />
          Community ({posts.length})
        </TabsTrigger>
        <TabsTrigger value="marketplace">
          <ShoppingBag className="h-3.5 w-3.5" />
          Marketplace ({marketItems.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="listings">
        {listings.length === 0 ? (
          <EmptyState text="No listings posted yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="rounded-2xl border border-primary/20 bg-background/50 p-5 transition hover:-translate-y-0.5 hover:border-primary shadow-sm"
              >
                <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-violet-900/40 to-pink-900/40 text-4xl">
                  🏠
                </div>
                <h3 className="font-semibold text-foreground">{l.title}</h3>
                <p className="mt-1 text-sm text-foreground/70">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {l.address}
                </p>
                <p className="mt-2 text-xl font-bold text-primary">
                  ${l.rent.toLocaleString()}
                  <span className="text-sm font-normal text-foreground/60">/mo</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="reviews">
        {reviews.length === 0 ? (
          <EmptyState text="No reviews written yet." />
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-primary/20 bg-background/50 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{r.landlordName}</p>
                    <p className="mt-0.5 text-xs text-foreground/60">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {r.landlordAddress}
                    </p>
                  </div>
                  <Stars n={r.rating} />
                </div>
                <p className="mt-3 text-sm text-foreground/80">{r.reviewText}</p>
                <p className="mt-2 text-xs text-foreground/60">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="posts">
        {posts.length === 0 ? (
          <EmptyState text="No community posts yet." />
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-primary/20 bg-background/50 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <span className="shrink-0 rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                    ▲ {p.upvotes}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{p.content}</p>
                <p className="mt-2 text-xs text-foreground/60">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="marketplace">
        {marketItems.length === 0 ? (
          <EmptyState text="No marketplace items listed." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {marketItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-primary/20 bg-background/50 p-5 shadow-sm"
              >
                <div className="mb-3 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-pink-900/30 to-purple-900/30 text-3xl">
                  🛒
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <span className="text-lg font-bold text-primary">
                    ${item.price}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/60">{item.category}</p>
                {item.isSold && (
                  <span className="mt-2 inline-block rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs text-red-400">
                    Sold
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

export function LandlordReviewsList({
  reviews,
}: {
  reviews: Review[];
}) {
  if (reviews.length === 0) return <EmptyState text="No verified reviews yet." />;
  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="rounded-2xl border border-primary/20 bg-background/50 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                ✓ Verified UW Student
              </span>
              <p className="mt-2 font-medium text-foreground">@{r.landlordName}</p>
            </div>
            <Stars n={r.rating} />
          </div>
          <p className="mt-3 text-sm text-foreground/80">{r.reviewText}</p>
          <p className="mt-2 text-xs text-foreground/60">
            {new Date(r.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(n) ? "fill-yellow-400 text-yellow-500" : "text-foreground/30"}`}
        />
      ))}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <FileText className="h-12 w-12 text-foreground/30" />
      <p className="text-sm text-foreground/60">{text}</p>
    </div>
  );
}
