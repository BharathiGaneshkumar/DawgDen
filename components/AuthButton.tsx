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
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-primary/10 border border-primary/20" />;
  }

  if (!user) {
    return (
      <a
        href="/api/auth/login"
        className="rounded-lg bg-primary text-[#c5b4e3] px-4 py-2 text-base font-bold shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/40"
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
        className="flex items-center gap-2 rounded-xl border border-primary/20 bg-white/80 px-3 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/10 hover:border-primary/40"
      >
        {u.picture ? (
          <img
            src={u.picture}
            alt="avatar"
            className="h-6 w-6 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-xs font-bold text-white">
            {initials}
          </div>
        )}
        <span className="hidden max-w-[100px] truncate sm:block">
          {u.name ?? u.email}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-primary/60" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-primary/10 bg-white/90 backdrop-blur-md shadow-xl shadow-primary/10">
            {/* Header */}
            <div className="border-b border-primary/10 px-4 py-3">
              <p className="truncate text-sm font-semibold text-primary">
                {u.name ?? u.email}
              </p>
              <p className="truncate text-xs text-primary/50">{u.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {u.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    <Shield className="h-2.5 w-2.5" />
                    Verified UW Student
                  </span>
                )}
                {u.role && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.role === "STUDENT"
                        ? "bg-primary/10 text-primary"
                        : "bg-blue-500/15 text-blue-600"
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
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-primary/80 transition hover:bg-primary/10 hover:text-primary"
              >
                <User className="h-4 w-4" />
                View Profile
              </Link>
              <Link
                href="/profile/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-primary/80 transition hover:bg-primary/10 hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <div className="my-1 border-t border-primary/10" />
              <a
                href="/api/auth/logout"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
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
