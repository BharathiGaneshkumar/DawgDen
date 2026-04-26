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
    <div className="mx-auto max-w-3xl px-4 py-10 min-h-screen">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition mb-6">
        <ChevronLeft size={16} /> Back to Community
      </Link>

      {/* Post Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden mb-6">
        <div className="flex">
          {/* Vote column */}
          <div className="flex w-14 flex-col items-center pt-5 gap-1 bg-white/5 border-r border-white/5 shrink-0">
            <button
              onClick={handleUpvote}
              disabled={!user}
              className={`transition ${voted ? "text-violet-400" : "text-gray-500 hover:text-violet-400"} disabled:opacity-40 disabled:cursor-default`}
              title={user ? "Toggle upvote" : "Sign in to vote"}
            >
              <ArrowBigUp className={`h-6 w-6 ${voted ? "fill-violet-400" : ""}`} />
            </button>
            <span className={`text-sm font-bold ${voted ? "text-violet-400" : "text-white"}`}>{post.upvotes}</span>
          </div>

          <div className="flex-1 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-xs">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold ${categoryColors[post.category] || categoryColors.GENERAL}`}>
                {post.category}
              </span>
              <span className="text-gray-400 flex items-center gap-1.5">
                <img src={post.user?.avatarUrl || "https://i.pravatar.cc/150"} alt={post.user?.name} className="h-4 w-4 rounded-full object-cover" />
                u/{post.user?.name || post.user?.email}
              </span>
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">{post.title}</h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {totalComments} comment{totalComments !== 1 ? "s" : ""}
              </span>
              {!user && (
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition">
                  Sign in to vote or comment
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add top-level comment */}
      {user ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex gap-3 mb-6">
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
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none transition"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim() || submitting}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-40 transition hover:bg-violet-500"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-500 mb-6">
          <Link href="/auth/login" className="text-white font-medium hover:underline">Sign in</Link> to join the conversation
        </div>
      )}

      {/* Comments */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1 mb-3">
          Comments ({totalComments})
        </h2>

        {comments.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">No comments yet — be the first!</p>
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
