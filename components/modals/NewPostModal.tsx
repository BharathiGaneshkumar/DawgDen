"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPostModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Assuming we set 'role' in session, but client might just see user object.
  // Actually, we should check role from our db context or just rely on API failure.
  // We'll let the API enforce it, and show the error.

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[40px] border border-white/40 bg-white/60 backdrop-blur-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-2xl p-2 text-primary/40 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Send className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary leading-tight">New Post</h2>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Community Hub</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3.5 text-primary font-bold focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
            >
              <option value="ROOMMATE">Roommate Needed</option>
              <option value="HOUSING">Housing Question</option>
              <option value="GENERAL">General Discussion</option>
              <option value="SELLING">Selling Something</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3.5 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="What's on your mind?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-1">Content</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-2xl border-2 border-primary/5 bg-white/40 px-5 py-3.5 text-primary font-bold placeholder:text-primary/20 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="Share details here..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-white/40 px-6 py-4 font-black text-primary/60 transition-all hover:bg-white/60 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Create Post"}
              {!loading && <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
