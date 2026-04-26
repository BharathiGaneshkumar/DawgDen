"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowBigUp, MessageSquare, Clock, ChevronLeft, Send, Loader2, CornerDownRight } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

const categoryColors: Record<string, string> = {
  ROOMMATE: "bg-emerald-100 border border-emerald-300 text-emerald-800",
  HOUSING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  GENERAL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SELLING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function CommentThread({
  comment,
  depth = 0,
  postId,
  user,
  onReplyAdded,
}: {
  comment: any;
  depth?: number;
  postId: string;
  user: any;
  onReplyAdded: (parentId: string, newComment: any) => void;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  async function submitReply() {
    if (!replyText.trim() || !user) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim(), parentId: comment.id }),
      });
      if (res.ok) {
        const newComment = await res.json();
        onReplyAdded(comment.id, newComment);
        setReplyText("");
        setReplying(false);
      }
    } finally {
      setReplyLoading(false);
    }
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l border-white/10 pl-4" : ""}>
      <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 mb-2">
        <img
          src={comment.user?.avatarUrl || `https://i.pravatar.cc/150?u=${comment.userId}`}
          alt={comment.user?.name}
          className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
            <span className="font-semibold text-gray-300">u/{comment.user?.name || comment.user?.email || "anonymous"}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
          {user && depth < 3 && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition"
            >
              <CornerDownRight size={12} />
              {replying ? "Cancel" : "Reply"}
            </button>
          )}
          {replying && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitReply()}
                placeholder={`Reply to ${comment.user?.name || "comment"}…`}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={submitReply}
                disabled={!replyText.trim() || replyLoading}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs text-white hover:bg-violet-500 disabled:opacity-40 transition"
              >
                {replyLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.map((reply: any) => (
        <CommentThread
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          postId={postId}
          user={user}
          onReplyAdded={onReplyAdded}
        />
      ))}
    </div>
  );
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/community/${id}`),
          fetch(`/api/community/${id}/comments`),
        ]);
        if (postRes.ok) setPost(await postRes.json());
        if (commentsRes.ok) setComments(await commentsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleUpvote() {
    if (!user) return alert("Sign in to upvote");
    const prevVoted = voted;
    const prevUpvotes = post.upvotes;
    setVoted(!voted);
    setPost({ ...post, upvotes: post.upvotes + (voted ? -1 : 1) });
    try {
      const res = await fetch(`/api/community/${id}/upvote`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPost((p: any) => ({ ...p, upvotes: data.upvotes }));
        setVoted(data.voted);
      } else {
        setVoted(prevVoted);
        setPost((p: any) => ({ ...p, upvotes: prevUpvotes }));
      }
    } catch {
      setVoted(prevVoted);
      setPost((p: any) => ({ ...p, upvotes: prevUpvotes }));
    }
  }

  async function submitComment() {
    if (!commentText.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReplyAdded(parentId: string, newComment: any) {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), newComment] };
        }
        return c;
      })
    );
  }

  function countComments(list: any[]): number {
    return list.reduce((n, c) => n + 1 + countComments(c.replies || []), 0);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  if (!post || post.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Post not found.</p>
          <Link href="/community" className="text-sm text-violet-500 hover:underline">← Back to Community</Link>
        </div>
      </div>
    );
  }

  const totalComments = countComments(comments);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 min-h-screen relative z-10">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary/60 hover:text-primary transition-colors mb-8">
        <ChevronLeft size={16} /> Back to Community
      </Link>

      {/* Post Card */}
      <div className="rounded-[40px] border border-primary/10 bg-white/60 backdrop-blur-md overflow-hidden mb-10 shadow-sm">
        <div className="flex">
          {/* Vote column */}
          <div className="flex w-16 flex-col items-center pt-8 gap-2 bg-primary/5 border-r border-primary/5 shrink-0">
            <button
              onClick={handleUpvote}
              disabled={!user}
              className={`transition-all active:scale-125 ${voted ? "text-primary" : "text-primary/20 hover:text-primary/60"} disabled:opacity-40 disabled:cursor-default`}
              title={user ? "Toggle upvote" : "Sign in to vote"}
            >
              <ArrowBigUp size={28} className={voted ? "fill-primary" : ""} />
            </button>
            <span className={`text-base font-black ${voted ? "text-primary" : "text-primary/40"}`}>{post.upvotes}</span>
          </div>

          <div className="flex-1 p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-[10px] font-bold uppercase tracking-widest">
              <span className={`rounded-full border px-3 py-1 ${categoryColors[post.category] || "border-primary/10 bg-primary/5 text-primary/60"}`}>
                {post.category}
              </span>
              <span className="text-primary/40 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary">
                  {(post.user?.name || "U")[0].toUpperCase()}
                </div>
                u/{post.user?.name || post.user?.email}
              </span>
              <span className="text-primary/30 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl font-black text-primary mb-6 leading-tight">{post.title}</h1>
            <p className="text-lg text-primary/70 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>

            <div className="mt-10 pt-6 border-t border-primary/5 flex items-center gap-6 text-xs font-bold text-primary/40">
              <span className="flex items-center gap-2">
                <MessageSquare size={16} className="text-primary/20" />
                {totalComments} comment{totalComments !== 1 ? "s" : ""}
              </span>
              {!user && (
                <Link href="/auth/login" className="text-primary/40 hover:text-primary transition underline decoration-dotted underline-offset-4">
                  Sign in to participate
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add top-level comment */}
      {user ? (
        <div className="rounded-3xl border border-primary/10 bg-white/60 p-6 flex gap-4 mb-10 shadow-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
            {(user.name?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 flex gap-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
              placeholder="What are your thoughts?..."
              className="flex-1 rounded-2xl border-none bg-transparent px-0 text-primary placeholder:text-primary/20 focus:ring-0 font-medium text-lg"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim() || submitting}
              className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary text-white disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[40px] border border-dashed border-primary/10 bg-white/20 p-8 text-center text-primary/40 font-bold mb-10">
          <Link href="/auth/login" className="text-primary hover:underline underline-offset-4">Sign in</Link> to join the conversation
        </div>
      )}

      {/* Comments */}
      <div className="space-y-6">
        <h2 className="text-xs font-black text-primary/30 uppercase tracking-[0.2em] px-2">
          Discussion ({totalComments})
        </h2>

        {comments.length === 0 && (
          <div className="py-12 text-center rounded-[40px] border border-primary/5 bg-white/10">
            <p className="text-primary/30 font-bold">No comments yet — be the first to speak up!</p>
          </div>
        )}

        {comments.map((c) => (
          <CommentThread
            key={c.id}
            comment={c}
            postId={id}
            user={user}
            onReplyAdded={handleReplyAdded}
          />
        ))}
      </div>
    </div>
  );
}
