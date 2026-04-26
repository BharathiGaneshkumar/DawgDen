"use client";

import { useState, useEffect } from "react";
import { Search, ArrowBigUp, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import NewPostModal from "@/components/modals/NewPostModal";

const categoryColors: Record<string, string> = {
  "ROOMMATE": "bg-emerald-500/15 border-emerald-500/30 text-emerald-600",
  "HOUSING": "bg-purple-500/15 border-purple-500/30 text-purple-600",
  "GENERAL": "bg-blue-500/15 border-blue-500/30 text-blue-600",
  "SELLING": "bg-yellow-500/15 border-yellow-500/30 text-yellow-700",
};

const FILTERS = ["All Posts", "Top Posts", "ROOMMATE", "HOUSING", "GENERAL", "SELLING"];

export default function CommunityPage() {
  const { user } = useUser();
  const isStudent = (user as { role?: string } | undefined | null)?.role === "STUDENT";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchPosts = async () => {
    setLoading(true);
    let url = "/api/community?";
    if (activeFilter === "Top Posts") url += "sort=top&";
    else if (activeFilter !== "All Posts") url += `category=${activeFilter}&`;
    if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}&`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [debouncedSearch, activeFilter]);

  const handleUpvote = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!user) {
      alert("Sign in to upvote");
      return;
    }

    // Optimistic update
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));

    try {
      await fetch(`/api/community/${id}/upvote`, { method: "POST" });
    } catch (e) {
      // Revert if failed
      setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes - 1 } : p));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 min-h-[calc(100vh-64px)]">
      <div className="mb-10 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-primary">💬 Community Hub</h1>
          <p className="mt-2 text-primary/70 font-medium">Connect, ask questions, and find roommates</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4 justify-center">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search posts..."
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
              + New Post
            </button>
          ) : user ? null : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto shrink-0 rounded-2xl border border-primary/20 bg-white/40 backdrop-blur-md px-8 py-3.5 font-bold text-primary transition-all hover:bg-white/60 text-center"
            >
              Sign in to post
            </Link>
          )}
        </div>
      </div>

      <div className="mb-10 flex flex-wrap gap-2 justify-center">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full border px-5 py-2 text-sm font-bold transition-all ${
              activeFilter === f
                ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                : "border-primary/10 bg-white/40 text-primary/60 hover:border-primary/30 hover:bg-white/60"
            }`}
          >
            {f === "ROOMMATE" ? "Roommate Needed" : f === "HOUSING" ? "Housing Question" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/20 py-20 text-center">
          <p className="text-primary/40 font-medium text-lg">No posts found matching your search.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="group flex overflow-hidden rounded-3xl border border-primary/10 bg-white/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-white/60 hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Upvote Column */}
              <button 
                onClick={(e) => handleUpvote(e, post.id)}
                className="flex w-16 flex-col items-center justify-start bg-primary/5 py-6 border-r border-primary/5 hover:bg-primary/10 transition-colors shrink-0"
              >
                <ArrowBigUp className="h-6 w-6 text-primary/40 group-hover:text-primary transition-colors" />
                <span className="my-1.5 text-base font-black text-primary">{post.upvotes}</span>
              </button>

              <div className="flex flex-col flex-1 p-6 min-w-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-[10px] font-bold uppercase tracking-widest">
                  <span className={`rounded-full border px-2.5 py-1 ${categoryColors[post.category] || "border-primary/10 bg-primary/5 text-primary/60"}`}>
                    {post.category}
                  </span>
                  <span className="text-primary/40 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary">
                      {(post.user?.name || "U")[0].toUpperCase()}
                    </div>
                    u/{post.user?.name || post.user?.email || "unknown"}
                  </span>
                  <span className="text-primary/30 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-primary group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-base text-primary/80 font-bold line-clamp-2 leading-relaxed mb-4">
                  {post.content}
                </p>

                <div className="mt-auto flex items-center gap-4 text-xs font-bold text-primary/40">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-primary/20" />
                    {post._count?.comments || 0} replies
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewPostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { fetchPosts(); }} 
      />
    </div>
  );
}
