"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import AuthButton from "./AuthButton";

const navLinks = [
  { href: "/listings", label: "Listings" },
  { href: "/landlords", label: "Landlords" },
  { href: "/lease", label: "Lease Checker" },
  { href: "/community", label: "Community" },
  { href: "/marketplace", label: "Marketplace" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 transition-shadow group-hover:shadow-violet-500/50">
            <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Nest<span className="text-violet-400">Safe</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-white/10" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side: Post + Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/listings/new"
            className="hidden rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40 sm:block"
          >
            List a Place
          </Link>
          <AuthButton />
          {/* Mobile menu toggle */}
          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((p) => !p)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-gray-950/95 px-4 py-3 md:hidden">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/listings/new"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            List a Place
          </Link>
        </div>
      )}
    </nav>
  );
}
