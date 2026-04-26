# DawgDen 

**The student housing platform that actually protects you.**

Live at: [https://dawg-den.vercel.app](https://dawg-den.vercel.app)

Built for **UWB Hacks 2025** · **Cities and Societies** track

---

## The Problem

Moving to a new country for university is hard enough. Finding housing as an international student at UW Bothell is a nightmare. Students describe signing leases they couldn't fully understand, losing $500+ deposits to landlords who vanish after move-out, scrambling through WhatsApp group chains trying to sell a mattress before flying home. There's no central place to look up a landlord, no way to verify a listing is real, no tool that reads lease legal jargon for you.

DawgDen is what we wish had existed.

---

## What It Does

### 9 Core Features

**1. Verified Housing Listings**
Students and landlords post real listings with photos, rent, bedroom count, deposit, amenities, and address. Every listing page links to Google Maps. Students can leave reviews directly on a listing.

**2. AI Lease Checker**
Upload any lease PDF. DawgDen extracts the text with `pdf-parse`, sends it to **Google Gemma 4** (`gemma-3-27b-it` via the Gemini API), and returns a structured breakdown of red flags — each tagged High / Medium / Low severity with a plain-English description of the issue. Catch hidden fees, auto-renewal traps, and illegal clauses before you sign.

**3. Verified Landlord Reviews**
Students submit reviews with a 1–10 rating, maintenance rating, deposit-returned status, and written feedback. Each review is hashed on the **Solana blockchain** (devnet), making it tamper-proof and immutable. Landlords cannot pressure a platform to delete their record.

**4. AI Landlord Trust Score**
Every landlord profile calculates a Trust Score (out of 10) from: average rating (40%), deposit return rate (30%), and maintenance rating (30%). A **Gemma 4** AI summary then condenses all reviews into 2–3 objective sentences highlighting behavioral patterns — so students know what they're walking into.

**5. Voice Assistant**
Powered by the **ElevenLabs React SDK**, the in-app voice assistant answers questions about listings, explains lease clauses, and guides students through the platform hands-free — critical for students navigating a new country and a new language simultaneously.

**6. Community Hub**
A Reddit-style forum with four categories: Roommate Needed, Housing Question, General, and Selling. Students post, upvote, and thread-reply to comments. Per-user upvote deduplication prevents spam. Full-text search and category filters.

**7. Student Marketplace**
Buy and sell furniture, electronics, books, appliances, and clothing within the UW Bothell community. Replaces the chaotic WhatsApp group chains students currently rely on. Supports categories, price sorting, search, and sold/available status. Only verified students can post items.

**8. Karma System**
Students earn karma for contributing: writing reviews, posting in the community, listing housing, selling in the marketplace. Displayed on every public profile, surfacing trustworthy community members.

**9. Affordability Calculator**
Enter income, roommate count, and location — get a realistic breakdown of what you can afford, including cost-split scenarios per roommate. Helps students avoid overcommitting before they land in Seattle.

---

## Two User Types

| | Student | Landlord |
|---|---|---|
| Browse listings | ✅ | ✅ |
| Post listings | ✅ | ✅ |
| Write landlord reviews | ✅ (verified UW email) | ❌ |
| Post in Community Hub | ✅ | ❌ |
| Sell in Marketplace | ✅ | ❌ |
| View AI Trust Score summary | ✅ | ✅ |
| Karma score | ✅ | — |
| Trust Score | — | ✅ |

Students verify their UW email via Auth0 to unlock reviews and marketplace posting. Landlords get a dedicated profile page with an AI-generated reputation summary.

---

## AI & API Integrations

### Google Gemma 4 (Gemini API)
Used in two critical flows:
- **Lease analysis** — PDF text is extracted and sent to Gemma with a structured prompt; the model returns JSON-parseable issues with severity levels, clause names, and descriptions
- **Landlord AI summaries** — all tenant reviews for a landlord are aggregated and summarized into 2–3 objective sentences highlighting patterns in deposit handling, maintenance, and behavior

Model: `gemma-3-27b-it` via `@google/generative-ai`

### ElevenLabs
Conversational voice assistant via `@elevenlabs/react`. Students interact with the platform by voice — asking about listings, getting lease clause explanations, or navigating features without touching a menu.

### Auth0
Full authentication via `@auth0/nextjs-auth0` v4 with two distinct roles: `STUDENT` and `LANDLORD`. The `beforeSessionSaved` hook upserts users to Postgres on every login and enriches the session with `role`, `isVerified`, and the internal DB user ID. Protected routes (`/listings/new`, `/community/new`, `/marketplace/new`, `/lease`, `/profile/settings`) require an active Auth0 session.

---

## MLH Prize Tracks

- **Best Use of Gemma 4** — AI lease red-flag detection + landlord trust summaries
- **Best Use of ElevenLabs** — hands-free voice assistant for platform navigation
- **Best Use of Auth0 for AI Agents** — role-enriched sessions gating AI features by user type

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Frontend | React 19, TypeScript (strict), Tailwind CSS v4 |
| UI Components | Shadcn/Radix UI, lucide-react |
| Auth | Auth0 v4 (`@auth0/nextjs-auth0`) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma v7 with `@prisma/adapter-pg` |
| AI — Lease + Reviews | Google Gemini API / Gemma 4 (`gemma-3-27b-it`) |
| AI — Voice | ElevenLabs React SDK (`@elevenlabs/react`) |
| PDF Parsing | `pdf-parse` (dynamic CJS import) |
| Maps | Google Maps Embed API (`@react-google-maps/api`) |
| Deployment | Vercel |

---

## Local Development

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required Environment Variables

```env
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
APP_BASE_URL=http://localhost:3000

DATABASE_URL=

GEMINI_API_KEY=
ELEVENLABS_API_KEY=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## Project Structure

```
nestsafe/
├── app/
│   ├── api/
│   │   ├── community/          # Posts, upvotes, comments
│   │   ├── landlords/          # Trust score + Gemma AI summary
│   │   ├── lease/analyze/      # Gemma 4 lease red-flag analysis
│   │   ├── listings/           # CRUD + reviews
│   │   ├── marketplace/        # Items CRUD
│   │   └── profile/            # User settings
│   ├── community/              # Community Hub
│   ├── lease/                  # AI Lease Checker
│   ├── listings/               # Browse + listing detail
│   ├── marketplace/            # Student Marketplace
│   ├── profile/[id]/           # Public profile (student + landlord views)
│   └── calculator/             # Affordability Calculator
├── components/
│   ├── modals/                 # New post / listing / marketplace modals
│   ├── Navbar.tsx
│   └── AuthButton.tsx
├── lib/
│   ├── auth0.ts                # Auth0Client + beforeSessionSaved hook
│   ├── gemini.ts               # Gemini/Gemma lazy client
│   ├── karma.ts                # Karma calculation logic
│   └── prisma.ts               # Singleton Prisma client
├── prisma/schema.prisma        # Full DB schema
└── proxy.ts                    # Next.js 16 route protection
```

---

## Development

Built at **UWB Hacks 2025** with development assistance from:

- **Antigravity Claude Sonnet 4.6** — full-stack implementation, debugging, TypeScript strict-mode fixes, Vercel deployment
- **Claude Code** (VS Code extension) — in-editor pair programming and codebase navigation

---

*Built for students. By students. Because no one should sign a lease they don't understand.*
