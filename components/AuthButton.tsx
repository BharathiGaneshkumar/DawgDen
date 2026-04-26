"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Shield, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SessionUser = {
  name?: string;
  email?: string;
  picture?: string;
  role?: "STUDENT" | "LANDLORD";
  isVerified?: boolean;
  dbId?: string;
};

export default function AuthButton() {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-white/10" />;
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="rounded-lg border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-200 transition hover:bg-pink-500/20 hover:text-white"
      >
        Sign In
      </a>
    );
  }

  const u = user as SessionUser;
  const initials = ((u.name ?? u.email ?? "?")[0] ?? "?").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
      >
        {u.picture ? (
          <img
            src={u.picture}
            alt="avatar"
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="hidden max-w-[100px] truncate sm:block">
          {u.name ?? u.email}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="border-b border-white/10 px-4 py-3">
              <p className="truncate text-sm font-semibold text-white">
                {u.name ?? u.email}
              </p>
              <p className="truncate text-xs text-gray-400">{u.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {u.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    <Shield className="h-2.5 w-2.5" />
                    Verified UW Student
                  </span>
                )}
                {u.role && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.role === "STUDENT"
                        ? "bg-violet-500/15 text-violet-400"
                        : "bg-blue-500/15 text-blue-400"
                    }`}
                  >
                    {u.role === "STUDENT" ? "Student" : "Landlord"}
                  </span>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="p-1.5">
              <Link
                href={u.dbId ? `/profile/${u.dbId}` : "/profile/me"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <User className="h-4 w-4" />
                View Profile
              </Link>
              <Link
                href="/profile/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <div className="my-1 border-t border-white/10" />
              <a
                href="/auth/logout"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
