"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { Save, User, BookMarked } from "lucide-react";
import Link from "next/link";

type SavedListing = {
  id: string;
  listingId: string;
  createdAt: string;
};

type ProfileData = {
  id: string;
  name: string | null;
  bio: string | null;
  program: string | null;
  gradYear: number | null;
  avatarUrl: string | null;
  role: string;
  savedListings: SavedListing[];
};

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [program, setProgram] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data: ProfileData) => {
          setProfile(data);
          setName(data.name ?? "");
          setBio(data.bio ?? "");
          setProgram(data.program ?? "");
          setGradYear(data.gradYear?.toString() ?? "");
          setAvatarUrl(data.avatarUrl ?? "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || null,
        bio: bio || null,
        program: program || null,
        gradYear: gradYear ? parseInt(gradYear) : null,
        avatarUrl: avatarUrl || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="mt-1 text-gray-400">Update your public profile information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Edit Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-violet-400" />
            <h2 className="font-semibold text-white">Personal Info</h2>
          </div>

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/10"
                onError={() => setAvatarUrl("")}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white ring-2 ring-white/10">
                {(name || user?.email || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <Field
            label="Display Name"
            value={name}
            onChange={setName}
            placeholder="Your name"
          />

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the community about yourself…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none resize-none"
            />
          </div>

          {profile?.role === "STUDENT" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Program / Major"
                value={program}
                onChange={setProgram}
                placeholder="e.g. Computer Science"
              />
              <Field
                label="Graduation Year"
                value={gradYear}
                onChange={setGradYear}
                placeholder="e.g. 2026"
                type="number"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </form>

      {/* Saved Listings */}
      {profile && profile.savedListings.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-pink-400" />
            <h2 className="font-semibold text-white">
              Saved Listings ({profile.savedListings.length})
            </h2>
          </div>
          <div className="space-y-2">
            {profile.savedListings.map((sl) => (
              <Link
                key={sl.id}
                href={`/listings/${sl.listingId}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-white/20 hover:bg-white/10"
              >
                <span className="text-gray-300">Listing #{sl.listingId}</span>
                <span className="text-xs text-gray-600">
                  {new Date(sl.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none"
      />
    </div>
  );
}
