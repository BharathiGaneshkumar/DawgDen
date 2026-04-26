"use client";

import Link from "next/link";
import { GraduationCap, Building2, Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mx-auto w-full max-w-4xl text-center">
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-black tracking-tight text-primary sm:text-6xl">
            Welcome to <span className="text-white drop-shadow-sm">DawgDen</span>
          </h1>
          <p className="text-xl text-primary/60 font-bold max-w-2xl mx-auto">
            The exclusive housing and community platform for UW Bothell.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Student Card */}
          <div className="relative group rounded-[40px] border border-primary/10 bg-white/60 backdrop-blur-md p-10 text-left transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-[0.03] transition-opacity group-hover:opacity-[0.08] text-primary rotate-12">
              <GraduationCap size={240} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-8 border border-primary/10 shadow-inner transition-transform group-hover:scale-110 duration-500">
                <GraduationCap size={40} />
              </div>
              
              <h2 className="text-3xl font-black text-primary mb-4">I'm a Student</h2>
              <p className="text-primary/60 font-bold mb-8 flex-1 leading-relaxed">
                Find verified housing, browse the marketplace, and connect with fellow Huskies.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-sm font-bold text-primary/70 bg-primary/5 p-4 rounded-2xl border border-primary/5">
                  <Shield size={20} className="text-emerald-500 shrink-0" />
                  <span>Verified via <span className="text-primary">@uw.edu</span> email</span>
                </div>
              </div>

              <a 
                href="/auth/login?userType=STUDENT"
                className="mt-auto flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-base font-black text-white transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95"
              >
                Continue to Student Portal
                <ArrowRight size={20} />
              </a>
            </div>
          </div>

          {/* Landlord Card */}
          <div className="relative group rounded-[40px] border border-primary/10 bg-white/40 backdrop-blur-md p-10 text-left transition-all duration-500 hover:-translate-y-2 hover:bg-white/60 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-[0.03] transition-opacity group-hover:opacity-[0.08] text-primary rotate-12">
              <Building2 size={240} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-primary/60 mb-8 border border-primary/10 shadow-sm transition-transform group-hover:scale-110 duration-500">
                <Building2 size={40} />
              </div>
              
              <h2 className="text-3xl font-black text-primary/60 mb-4">I'm a Landlord</h2>
              <p className="text-primary/40 font-bold mb-8 flex-1 leading-relaxed">
                List properties for free and connect with verified student tenants.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-sm font-bold text-primary/30 border-2 border-dashed border-primary/10 p-4 rounded-2xl">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/5 text-xs text-primary/40">✓</span>
                  <span>Unlimited Property Listings</span>
                </div>
              </div>

              <a 
                href="/auth/login?userType=LANDLORD"
                className="mt-auto flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary/10 bg-white/40 px-8 py-5 text-base font-black text-primary transition-all hover:bg-white hover:border-primary/20 active:scale-95"
              >
                Continue as Landlord
                <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-xs font-bold uppercase tracking-widest text-primary/30">
          By continuing, you agree to our <span className="text-primary/50 underline cursor-pointer">Terms</span> & <span className="text-primary/50 underline cursor-pointer">Privacy</span>
        </div>
      </div>
    </div>
  );
}
