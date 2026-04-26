"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Clock, ChevronLeft, Send } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { COMMUNITY_POSTS } from "../page";

const categoryColors: Record<string, string> = {
  "Roommate Needed": "bg-emerald-100 border border-emerald-300 text-emerald-800",
  "Housing Question": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "General": "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

type Comment = { id: string; username: string; avatar: string; text: string; timePosted: string };

const SEED_COMMENTS: Record<string, Comment[]> = {
  "1": [
    { id: "c1", username: "HuskyCat", avatar: "https://i.pravatar.cc/150?img=11", text: "Still available? I'm looking for a place starting September!", timePosted: "1 hour ago" },
    { id: "c2", username: "PNWLiving", avatar: "https://i.pravatar.cc/150?img=12", text: "Is Max friendly with cats? 🐱", timePosted: "45 min ago" },
  ],
  "2": [
    { id: "c3", username: "LegalEagleUWB", avatar: "https://i.pravatar.cc/150?img=13", text: "This is illegal in WA state if the fee wasn't in the original lease. File a complaint with the WA AG office.", timePosted: "4 hours ago" },
    { id: "c4", username: "FormerTenant", avatar: "https://i.pravatar.cc/150?img=14", text: "Same thing happened to me with Apex last year. They backed down when I sent a certified letter.", timePosted: "3 hours ago" },
  ],
  "5": [
    { id: "c5", username: "SafetyFirst", avatar: "https://i.pravatar.cc/150?img=15", text: "Thanks for the heads up! Sharing this with the UWB Housing Discord.", timePosted: "1 day ago" },
  ],
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const post = COMMUNITY_POSTS.find((p) => p.id === id);

  const [upvotes, setUpvotes] = useState(post?.upvotes ?? 0);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS[id] ?? []);
  const [commentText, setCommentText] = useState("");

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-primary/50 mb-4">Post not found.</p>
          <Link href="/community" className="text-sm text-primary hover:underline">← Back to Community</Link>
        </div>
      </div>
    );
  }

  function handleVote(dir: "up" | "down") {
    if (!user) return;
    if (vote === dir) {
      setVote(null);
      setUpvotes(post!.upvotes);
    } else {
      const delta = dir === "up" ? 1 : -1;
      const prev = vote === "up" ? 1 : vote === "down" ? -1 : 0;
      setUpvotes(post!.upvotes + delta - prev);
      setVote(dir);
    }
  }

  function submitComment() {
    if (!commentText.trim() || !user) return;
    setComments((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        username: (user.name as string) || "you",
        avatar: (user.picture as string) || `https://i.pravatar.cc/150?u=${user.sub}`,
        text: commentText.trim(),
        timePosted: "just now",
      },
    ]);
    setCommentText("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 min-h-screen">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-primary/60 hover:text-primary transition mb-6">
        <ChevronLeft size={16} /> Back to Community
      </Link>

      {/* Post Card */}
      <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md overflow-hidden mb-6">
        <div className="flex">
          {/* Vote column */}
          <div className="flex w-14 flex-col items-center pt-5 gap-1 bg-pink-900/5 border-r border-primary/5 shrink-0">
            <button
              onClick={() => handleVote("up")}
              className={`transition ${vote === "up" ? "text-pink-500" : "text-primary/30 hover:text-pink-400"} ${!user ? "cursor-default opacity-50" : ""}`}
              title={user ? undefined : "Sign in to vote"}
            >
              <ArrowBigUp className="h-6 w-6" />
            </button>
            <span className="text-sm font-bold text-primary">{upvotes}</span>
            <button
              onClick={() => handleVote("down")}
              className={`transition ${vote === "down" ? "text-purple-500" : "text-primary/30 hover:text-purple-400"} ${!user ? "cursor-default opacity-50" : ""}`}
            >
              <ArrowBigDown className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-xs">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold ${categoryColors[post.category]}`}>
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

            <h1 className="text-xl sm:text-2xl font-bold text-primary mb-4">{post.title}</h1>
            <p className="text-sm sm:text-base text-primary/80 leading-relaxed">{post.preview}</p>

            <div className="mt-4 flex items-center gap-3 text-xs text-primary/40">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </span>
              {!user && (
                <Link href="/auth/login" className="text-primary/60 hover:text-primary transition">
                  Sign in to vote or comment
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-3 mb-6">
        <h2 className="text-sm font-semibold text-primary/60 uppercase tracking-wide px-1">
          Comments ({comments.length})
        </h2>

        {comments.length === 0 && (
          <p className="text-sm text-primary/40 py-4 text-center">No comments yet — be the first!</p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 rounded-xl border border-primary/8 bg-white/50 px-4 py-3">
            <img src={c.avatar} alt={c.username} className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs text-primary/50">
                <span className="font-semibold text-primary/80">u/{c.username}</span>
                <span>·</span>
                <span>{c.timePosted}</span>
              </div>
              <p className="text-sm text-primary/80 leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add comment */}
      {user ? (
        <div className="rounded-2xl border border-primary/10 bg-white/60 p-4 flex gap-3">
          <img
            src={(user.picture as string) || `https://i.pravatar.cc/150?u=${user.sub}`}
            alt="you"
            className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5"
          />
          <div className="flex-1 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
              placeholder="Add a comment…"
              className="flex-1 rounded-xl border border-primary/20 bg-white/80 px-4 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary focus:outline-none transition"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-primary text-[#c5b4e3] px-4 py-2 text-sm font-semibold disabled:opacity-40 transition hover:opacity-90"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/10 bg-white/40 p-4 text-center text-sm text-primary/50">
          <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link> to join the conversation
        </div>
      )}
    </div>
  );
}
