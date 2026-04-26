"use client";

import Link from "next/link";
import { GraduationCap, Building2, Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
          Welcome to <span className="text-primary">DawgDen</span>
        </h1>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Choose how you want to use the platform. Are you looking for housing, or are you listing a property?
        </p>

        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Student Card */}
          <div className="relative group rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-left transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-20">
              <GraduationCap size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400 mb-6 border border-violet-500/30">
                <GraduationCap size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">I'm a Student</h2>
              <p className="text-gray-400 mb-6 flex-1">
                Browse student-verified housing, check lease flags with AI, and connect with the UWB community.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield size={16} className="text-emerald-400" />
                  <span>Use your <strong>@uw.edu</strong> email for automatic verification</span>
                </div>
              </div>

              <a 
                href="/auth/login?userType=STUDENT"
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Continue as Student
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Landlord Card */}
          <div className="relative group rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-left transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-20">
              <Building2 size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 mb-6 border border-blue-500/30">
                <Building2 size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">I'm a Landlord</h2>
              <p className="text-gray-400 mb-6 flex-1">
                List your properties, reach verified UW Bothell students, and build your Trust Score.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[10px] text-blue-400">✓</span>
                  <span>Free property listings</span>
                </div>
              </div>

              <a 
                href="/auth/login?userType=LANDLORD"
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Continue as Landlord
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
