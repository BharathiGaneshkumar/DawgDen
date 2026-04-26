import { prisma } from "@/lib/prisma";
import { auth0 } from "@/lib/auth0";
import { calculateKarma } from "@/lib/karma";
import { notFound, redirect } from "next/navigation";
import { Shield, Zap, Home, Star, MessageSquare, ShoppingBag, Calendar } from "lucide-react";
import Link from "next/link";
import { StudentProfileTabs, LandlordReviewsList } from "./ProfileTabs";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "me") {
    const session = await auth0.getSession();
    if (!session) redirect("/auth/login");
    const me = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub as string },
    });
    if (!me) redirect("/");
    redirect(`/profile/${me.id}`);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      listings: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      posts: { orderBy: { createdAt: "desc" } },
      marketItems: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) notFound();

  // If user is a landlord, fetch reviews ABOUT them, since user.reviews are reviews they wrote
  let landlordReviews: any[] = [];
  if (user.role === "LANDLORD") {
    landlordReviews = await prisma.review.findMany({
      where: { landlordName: user.name ?? "" },
      orderBy: { createdAt: "desc" },
    });
  }

  const karma = await calculateKarma(id);

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isStudent = user.role === "STUDENT";

  // Fetch AI summary for landlords
  let aiSummary: string | null = null;
  if (!isStudent) {
    try {
      const res = await fetch(
        `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/landlords/${id}/summary`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        aiSummary = data.summary ?? null;
      }
    } catch {
      // summary unavailable
    }
  }

  const trustScore =
    user.role === "LANDLORD"
      ? landlordReviews.length > 0
        ? landlordReviews.reduce((s, r) => s + r.rating, 0) / landlordReviews.length
        : null
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 min-h-screen">
      {/* Profile Header */}
      <div className="mb-8 rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name ?? "avatar"}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/20 shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white ring-2 ring-primary/20 shadow-sm">
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {user.name ?? user.email}
              </h1>
              {isStudent && user.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <Shield className="h-3 w-3" />
                  Verified UW Student
                </span>
              )}
              {!isStudent && (
                <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                  Landlord
                </span>
              )}
            </div>

            {isStudent && (
              <p className="mt-1 text-sm text-foreground/70">
                {user.program && <span>{user.program}</span>}
                {user.program && user.gradYear && <span> · </span>}
                {user.gradYear && <span>Class of {user.gradYear}</span>}
              </p>
            )}

            {user.bio && (
              <p className="mt-2 max-w-xl text-sm text-foreground/80">{user.bio}</p>
            )}

            <div className="mt-3 flex items-center gap-1.5 text-xs text-foreground/60">
              <Calendar className="h-3.5 w-3.5" />
              Joined {joinedDate}
            </div>
          </div>

          {/* Karma (students) or Trust Score (landlords) */}
          {isStudent ? (
            <div className="flex flex-col items-center rounded-xl border border-primary/20 bg-primary/5 px-6 py-4 text-center">
              <Zap className="mb-1 h-5 w-5 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{karma}</p>
              <p className="text-xs text-foreground/70">Karma</p>
            </div>
          ) : (
            trustScore !== null && (
              <div className="flex flex-col items-center rounded-xl border border-blue-500/20 bg-blue-500/5 px-6 py-4 text-center">
                <Star className="mb-1 h-5 w-5 fill-yellow-400 text-yellow-500" />
                <p
                  className={`text-2xl font-bold ${
                    trustScore >= 7
                      ? "text-emerald-500"
                      : trustScore >= 5
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {trustScore.toFixed(1)}
                </p>
                <p className="text-xs text-foreground/70">Trust Score</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isStudent ? (
          <>
            <StatCard icon={<Home className="h-4 w-4 text-violet-400" />} label="Listings" value={user.listings.length} />
            <StatCard icon={<Star className="h-4 w-4 text-yellow-400" />} label="Reviews Written" value={user.reviews.length} />
            <StatCard icon={<MessageSquare className="h-4 w-4 text-pink-400" />} label="Community Posts" value={user.posts.length} />
            <StatCard icon={<ShoppingBag className="h-4 w-4 text-emerald-400" />} label="Items Sold" value={user.marketItems.filter((i) => i.isSold).length} />
          </>
        ) : (
          <>
            <StatCard icon={<Home className="h-4 w-4 text-violet-400" />} label="Active Listings" value={user.listings.length} />
            <StatCard icon={<Star className="h-4 w-4 text-yellow-400" />} label="Reviews" value={landlordReviews.length} />
            {user.responseRate != null && (
              <StatCard icon={<Zap className="h-4 w-4 text-blue-400" />} label="Response Rate" value={`${user.responseRate}%`} />
            )}
          </>
        )}
      </div>

      {/* Landlord: AI Summary */}
      {!isStudent && aiSummary && (
        <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-500">
            ✨ AI Pattern Summary
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">{aiSummary}</p>
        </div>
      )}

      {/* Content */}
      {isStudent ? (
        <StudentProfileTabs
          listings={user.listings.map((l) => ({
            id: l.id,
            title: l.title,
            rent: l.rent,
            bedrooms: l.bedrooms,
            address: l.address,
          }))}
          reviews={user.reviews.map((r) => ({
            id: r.id,
            landlordName: r.landlordName,
            landlordAddress: r.landlordAddress,
            rating: r.rating,
            reviewText: r.reviewText,
            createdAt: r.createdAt.toISOString(),
          }))}
          posts={user.posts.map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            upvotes: p.upvotes,
            createdAt: p.createdAt.toISOString(),
          }))}
          marketplaceItems={user.marketItems.map((m) => ({
            id: m.id,
            title: m.title,
            price: m.price,
            category: m.category,
            isSold: m.isSold,
          }))}
        />
      ) : (
        <>
          {/* Landlord Active Listings */}
          {user.listings.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Active Listings</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {user.listings.map((l) => (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="rounded-2xl border border-primary/20 bg-background/50 p-5 transition hover:-translate-y-0.5 hover:border-primary shadow-sm"
                  >
                    <h3 className="font-semibold text-foreground">{l.title}</h3>
                    <p className="mt-1 text-sm text-foreground/70">{l.address}</p>
                    <p className="mt-2 text-xl font-bold text-primary">
                      ${l.rent.toLocaleString()}<span className="text-sm font-normal text-foreground/60">/mo</span>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Landlord Verified Reviews */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Verified Reviews</h2>
            <LandlordReviewsList
              reviews={landlordReviews.map((r) => ({
                id: r.id,
                landlordName: r.landlordName,
                landlordAddress: r.landlordAddress,
                rating: r.rating,
                reviewText: r.reviewText,
                createdAt: r.createdAt.toISOString(),
              }))}
            />
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-4 text-center shadow-sm">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-foreground/60">{label}</p>
    </div>
  );
}
