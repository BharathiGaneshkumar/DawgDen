"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import AuthButton from "./AuthButton";

const navLinks = [
  { href: "/listings", label: "Listings" },
  { href: "/community", label: "Community" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/lease", label: "Lease" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-b from-background via-background/90 to-transparent pb-8 pt-2">
      <div className="mx-auto flex py-2 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-1 transition-opacity hover:opacity-90 -ml-4 md:-ml-6 lg:-ml-8"
        >
          <img 
            src="/logo.png" 
            alt="DawgDen Logo" 
            className="h-24 w-24 md:h-28 md:w-28 object-contain drop-shadow-sm" 
          />
          <span className="text-3xl font-extrabold tracking-tight text-primary mt-2 -ml-2">
            Dawg<span className="text-white drop-shadow-sm">Den</span>
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
                className={`relative rounded-lg px-5 py-3 text-lg font-extrabold transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-primary/70 hover:text-primary"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-primary/10" />
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
            className="hidden rounded-lg bg-primary text-[#c5b4e3] px-4 py-2 text-base font-bold text-[#c5b4e3] shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/40 sm:block"
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
