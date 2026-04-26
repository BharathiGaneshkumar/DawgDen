"use client";

import { useState, useEffect } from "react";
import { Search, ArrowBigUp, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import NewPostModal from "@/components/modals/NewPostModal";

const categoryColors: Record<string, string> = {
  "ROOMMATE": "bg-emerald-100 border border-emerald-300 text-emerald-800",
  "HOUSING": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "GENERAL": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "SELLING": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
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
      <div className="mb-8 flex flex-col items-center justify-center text-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">💬 Community Hub</h1>
          <p className="mt-2 text-gray-400">Connect, ask questions, and find roommates</p>
        </div>

        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search posts..."
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
              + New Post
            </button>
          ) : user ? null : (
            <Link
              href="/login"
              className="w-full sm:w-auto shrink-0 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/10 text-center"
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
                ? "border-violet-500 bg-violet-500/10 text-violet-400"
                : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300"
            }`}
          >
            {f === "ROOMMATE" ? "Roommate Needed" : f === "HOUSING" ? "Housing Question" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center text-gray-500">No posts match your search.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="group flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-white/10 cursor-pointer"
            >
              {/* Upvote Column */}
              <button 
                onClick={(e) => handleUpvote(e, post.id)}
                className="flex w-14 flex-col items-center justify-start bg-white/5 py-4 border-r border-white/5 hover:bg-violet-500/10 transition-colors shrink-0"
              >
                <ArrowBigUp className="h-5 w-5 text-gray-500 group-hover:text-violet-400 transition-colors" />
                <span className="my-1 text-sm font-bold text-white">{post.upvotes}</span>
              </button>

              <div className="flex flex-col flex-1 p-4 sm:p-5 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2 text-xs">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${categoryColors[post.category]}`}>
                    {post.category}
                  </span>
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <img src={post.user?.avatarUrl || "https://i.pravatar.cc/150"} alt={post.user?.name} className="h-4 w-4 rounded-full object-cover" />
                    u/{post.user?.name || post.user?.email || "unknown"}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-1.5 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-3">
                  {post.content}
                </p>

                <div className="mt-auto flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
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
