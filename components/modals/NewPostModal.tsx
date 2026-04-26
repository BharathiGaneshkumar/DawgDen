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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gray-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-white">Create Community Post</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="ROOMMATE">Roommate Needed</option>
              <option value="HOUSING">Housing Question</option>
              <option value="GENERAL">General</option>
              <option value="SELLING">Selling</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
              placeholder="What's on your mind?"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Content</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
              placeholder="Share details here..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
