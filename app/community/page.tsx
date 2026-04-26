"use client";

import { useState } from "react";
import { Search, ArrowBigUp, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export const COMMUNITY_POSTS = [
  { id: "1", title: "Looking for a 3rd roommate in Beardslee Blvd apartment! 🐾 Pet friendly", category: "Roommate Needed", upvotes: 45, replies: 12, poster: "UWBDawg24", timePosted: "2 hours ago", preview: "Hey everyone! My current roommate and I (both junior CS majors) are looking for a third person to join our lease at the Beardslee Blvd apartments starting this Fall. Rent would be around $850/mo. We have a very friendly golden retriever named Max. DM if interested!", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "2", title: "Is anyone else having issues getting their deposit back from Apex Management?", category: "Housing Question", upvotes: 128, replies: 34, poster: "throwaway_tenant", timePosted: "5 hours ago", preview: "Moved out a month ago and left the place spotless. Now they're saying there's a $400 'mandatory cleaning fee' that wasn't in the lease. Has anyone dealt with this before? Thinking about taking them to small claims court.", avatar: "https://i.pravatar.cc/150?img=6" },
  { id: "3", title: "Free couch on 104th Ave NE if anyone wants it!", category: "General", upvotes: 89, replies: 7, poster: "SarahG", timePosted: "1 day ago", preview: "We're moving out today and couldn't fit our IKEA couch in the U-Haul. It's in decent condition, dark grey. Left it on the curb at the corner of 104th and Beardslee. First come first serve!", avatar: "https://i.pravatar.cc/150?img=7" },
  { id: "4", title: "Best internet provider for the Mill Creek area?", category: "Housing Question", upvotes: 22, replies: 15, poster: "TransferStudent23", timePosted: "1 day ago", preview: "Just signed a lease for a place in Mill Creek. Xfinity and Ziply are both available. We'll have 4 people streaming and gaming pretty regularly. What do you guys recommend?", avatar: "https://i.pravatar.cc/150?img=8" },
  { id: "5", title: "Beware of Facebook Marketplace housing scams", category: "General", upvotes: 215, replies: 42, poster: "HousingHero", timePosted: "2 days ago", preview: "Just a heads up! There's a scam going around with a 'landlord' asking for a $50 application fee via Zelle before even showing the unit. DO NOT send money before viewing!", avatar: "https://i.pravatar.cc/150?img=9" },
  { id: "6", title: "Subleasing my room at The Villas for Spring Quarter", category: "Roommate Needed", upvotes: 14, replies: 3, poster: "BioMajor_Alex", timePosted: "2 days ago", preview: "I'm studying abroad next quarter and need someone to take over my lease from April to June. Rent is $950/mo, all utilities included. You get your own private bathroom.", avatar: "https://i.pravatar.cc/150?img=10" },
];

const categoryColors: Record<string, string> = {
  "Roommate Needed": "bg-emerald-100 border border-emerald-300 text-emerald-800",
  "Housing Question": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "General": "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const FILTERS = ["All Posts", "Top Posts", "Roommate Needed", "Housing Question", "General"];

export default function CommunityPage() {
  const { user } = useUser();
  const isStudent = (user as { role?: string } | undefined | null)?.role === "STUDENT";

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Posts");

  const filtered = COMMUNITY_POSTS.filter((post) => {
    const matchCategory =
      activeFilter === "All Posts" ||
      activeFilter === "Top Posts" ||
      post.category === activeFilter;
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.preview.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  }).sort((a, b) => activeFilter === "Top Posts" ? b.upvotes - a.upvotes : 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 min-h-screen">
      <div className="mb-8 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">💬 Community Hub</h1>
          <p className="mt-2 text-primary/70">Connect, ask questions, and find roommates</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-primary/20 bg-white/80 py-3 pl-10 pr-4 text-sm text-primary placeholder:text-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          {isStudent ? (
            <Link
              href="/community/new"
              className="w-full sm:w-auto shrink-0 rounded-xl bg-primary text-[#c5b4e3] px-6 py-3 font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 text-center"
            >
              + New Post
            </Link>
          ) : user ? null : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto shrink-0 rounded-xl border border-primary/20 bg-white/60 px-6 py-3 font-semibold text-primary/80 transition hover:bg-white/80 text-center"
            >
              Sign in to post
            </Link>
          )}
        </div>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              activeFilter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-primary/20 bg-white/80 text-primary/80 hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-primary/50">No posts match your search.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="group flex overflow-hidden rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-sm transition-all duration-300 hover:border-pink-300/30 hover:bg-white/80 cursor-pointer"
            >
              {/* Upvote Column */}
              <div className="flex w-14 flex-col items-center justify-start bg-pink-900/10 py-4 border-r border-pink-300/5 group-hover:bg-pink-900/20 transition-colors shrink-0">
                <ArrowBigUp className="h-5 w-5 text-primary/40" />
                <span className="my-1 text-sm font-bold text-primary">{post.upvotes}</span>
              </div>

              <div className="flex flex-col flex-1 p-4 sm:p-5 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2 text-xs">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${categoryColors[post.category]}`}>
                    {post.category}
                  </span>
                  <span className="text-primary/70 flex items-center gap-1.5">
                    <img src={post.avatar} alt={post.poster} className="h-4 w-4 rounded-full object-cover" />
                    u/{post.poster}
                  </span>
                  <span className="text-primary/60 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.timePosted}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-primary group-hover:text-primary/90 transition-colors mb-1.5 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-primary/60 line-clamp-2 leading-relaxed mb-3">
                  {post.preview}
                </p>

                <div className="mt-auto flex items-center gap-3 text-xs text-primary/50">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {post.replies} replies
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
