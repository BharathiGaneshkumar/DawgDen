import Link from "next/link";
import { Shield, Search, FileText, Star, Calculator, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Verified Listings",
    description: "Browse student-verified housing listings with real photos, honest reviews, and transparent pricing.",
    color: "from-pink-400 to-rose-400",
    shadow: "shadow-pink-500/20",
  },
  {
    icon: FileText,
    title: "AI Lease Checker",
    description: "Upload your lease and our AI highlights red flags, hidden fees, and unfair clauses before you sign.",
    color: "from-fuchsia-400 to-purple-500",
    shadow: "shadow-purple-500/20",
  },
  {
    icon: Star,
    title: "Landlord Reviews",
    description: "Read and write blockchain-verified landlord reviews. Know who you're renting from before you commit.",
    color: "from-violet-400 to-indigo-500",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Calculator,
    title: "Affordability Calculator",
    description: "Calculate what you can afford based on your income, roommates, and local cost of living data.",
    color: "from-sky-400 to-blue-500",
    shadow: "shadow-sky-500/20",
  },
];

const trustItems = [
  "No hidden fees or subscriptions",
  "Blockchain-verified reviews",
  "AI-powered lease analysis",
  "Student-first community",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-pink-300/30 blur-[120px]" />
          <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/40 blur-[100px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(50,0,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(50,0,110,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-base font-bold text-primary">
            <Shield className="h-3.5 w-3.5" />
            Built for students, by students
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-4xl text-6xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-7xl lg:text-8xl">
            Find housing that{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              actually protects you
            </span>
          </h1>

          {/* Tagline */}
          <p className="mb-10 max-w-2xl text-xl font-medium text-primary/80 sm:text-2xl">
            The student housing platform that protects you — with AI lease analysis, verified landlord reviews, and a community that has your back.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/listings"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-purple-500/20 transition-all duration-300 hover:from-purple-400 hover:to-pink-400 hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              Browse Listings
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/lease"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/10 bg-white/50 px-8 py-4 text-lg font-bold text-primary backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:-translate-y-0.5 shadow-sm"
            >
              Check My Lease
            </Link>
          </div>

          {/* Trust items */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-base text-primary/70 font-bold">
                <CheckCircle className="h-4 w-4 text-pink-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-24 bg-white/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-primary">
              Everything you need to rent{" "}
              <span className="text-pink-500">confidently</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-primary/80">
              We built the tools we wish we had when we were looking for student housing.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-primary/10 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-white/80 hover:-translate-y-1 shadow-sm"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg ${feature.shadow}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-primary">{feature.title}</h3>
                  <p className="text-base font-medium leading-relaxed text-primary/80">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 pb-24 pt-12 relative z-10">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-pink-300/50 to-purple-300/50 p-px shadow-xl">
          <div className="rounded-3xl bg-white/80 px-8 py-16 text-center backdrop-blur-xl">
            <h2 className="mb-4 text-4xl font-bold text-primary">
              Ready to rent smarter?
            </h2>
            <p className="mb-8 text-lg font-medium text-primary/80">
              Join thousands of students who found safe, affordable housing with DawgDen.
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-purple-500/20 transition-all duration-300 hover:from-purple-400 hover:to-pink-400 hover:-translate-y-0.5"
            >
              Browse Listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
