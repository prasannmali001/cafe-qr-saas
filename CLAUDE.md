SPEC-DRIVEN DEVELOPMENT (SDD) MASTER BLUEPRINT  |  VERSION 1.0 (MVP)
Cafe & Shop QR Review Accelerator SaaS
Production System Architecture, Senior Engineering Edge-Case Matrix, Database Schema, API Contracts & Anti-Hallucination Guardrails for AI Vibe Coding Agents (Cursor / Claude Code / Lovable / Windsurf)

Architecture Paradigm	Spec-Driven Development (SDD)	Target Stack	Next.js 15, Tailwind, Prisma, Supabase
AI Engine	Google Gemini 1.5 Flash API	Compliance Standard	100% Google Maps UGC Compliant
1. SDD Philosophy & Anti-Failure Rules for Vibe Coding
Why normal prompt-based 'Vibe Coding' breaks and how this document anchors your AI Coding Agent.
THE CORE RULE: NO SPEC = NO CODE
When building with AI coding agents (Cursor, Claude Code, Bolt, Lovable), prompting 'build my full cafe review app' causes Context Window Drift, Architectural Hallucination, and Premature Code Generation. Treat this SDD document as your single Source of Truth. Feed this spec into your project's .cursorrules or CLAUDE.md file, and force the AI agent to build strictly one atomic task at a time.

•	1. Prevent Context Window Drift: LLMs forget column names and routes across 20+ files. Every prompt you give the AI must reference Section 4 (Prisma Schema) and Section 5 (API Contracts) of this document.
•	2. Enforce Strict TypeScript & Zod Contracts: AI agents love using ': any' to hide errors, causing production crashes. Enforce 'strict: true' in tsconfig.json and validate every API input/output using Zod schemas before writing UI code.
•	3. Chunked Atomic Execution: Never ask the agent to build Customer UI + Gemini AI + Owner Dashboard in one turn. Follow Section 8's 6-Phase Atomic Implementation Plan and run git commit after every verified step.
•	4. Explicit Boundary Conditions: Agents only code the 'Happy Path' unless forced to handle slow 3G cafe Wi-Fi, Safari clipboard blocks, and API wallet attacks. Section 7 locks in all 13 production edge cases.
2. Level 0: Product Requirements Document (PRD)
Clear problem definition, user personas, value proposition, and strict v1.0 MVP boundaries.
2.1 Problem Statement & Core Value Proposition
Cafe and local shop owners struggle to collect consistent, high-quality Google Reviews because customers find typing reviews tedious, face language/spelling barriers, or forget once they leave the shop. Existing QR codes simply dump users onto a blank Google textbox with high login friction.
Our B2B SaaS platform solves this via a 3-Tap Frictionless QR Micro-Experience: Customers scan a table/waiter QR code, tap a star rating, tap 1-5 dynamically randomized tags (or speak into a 1-tap voice mic in Hindi/Marathi/Hinglish), optionally enhance the text via an AI Persona Engine, and execute a 1-Tap Synchronous Copy + Native Google Maps App Deep-Link.
2.2 Target Personas
•	Persona A — The Non-Typing Customer (End User): Sitting in a cafe with potentially weak mobile data. Wants to reward good service in under 15 seconds without typing long English sentences or logging into a mobile browser.
•	Persona B — The Cafe / Shop Owner (B2B Subscriber): Wants more authentic 5-star Google reviews, actionable private feedback when service slips, and a way to track which waiter/staff member is actually asking customers to scan the QR.
•	Persona C — Waiter / Floor Staff: Motivated by monthly incentives; uses a personal staff QR code on their badge or bill folder to climb the cafe's internal review leaderboard.
2.3 Scope Matrix (In-Scope vs. Out-of-Scope for v1.0 MVP)
IN-SCOPE (Build in MVP v1.0)	OUT-OF-SCOPE (Do NOT Build in v1.0)
✓ Dynamic QR Redirect Route (/q/[slug]) with Staff tracking (?s=code)	✗ Native iOS/Android mobile app (Web PWA only)
✓ 1-5 Star selection + PostgreSQL Random 5-Tag Shuffler	✗ POS hardware printer integration (Manual PDF QR print first)
✓ 1-Tap Voice-to-Text Input + Gemini 1.5 Flash Persona Enhancer	✗ Automated Google OAuth auto-posting (Blocked by Google API)
✓ Compliant Smart Routing (4-5 Star Google Deep-Link / 1-3 Star Manager Box + secondary Google link)	✗ Hard Review Gating (Completely hiding Google link on 1-3 stars - Illegal/Bannable)
✓ Owner Dashboard: Analytics, Staff Leaderboard, Custom Tags & Printable QR Standee Generator	✗ Complex multi-location franchise ERP & automated WhatsApp billing
3. Level 1: User Flows & Screen State Matrix
Exact screen-by-screen transitions and mandatory UI states to prevent blank screens on slow cafe networks.
3.1 End-to-End Customer Flow Diagram
[Physical QR Scan: qr.domain.com/q/roast-pune?s=rahul]
       │
       ▼ (307 Temporary Redirect + Log Scan)
[Customer PWA: domain.com/r/cafe-uuid?s=rahul]
       │
       ├──► Step 1: Tap Star Rating (1 to 5 Stars) -> Smooth Auto-Scroll (Zero 'Next' Button)
       │
       ├──► Step 2: Fetch & Tap 5 Randomized Sentiment Tags (e.g., [☕ Best Coffee] [🎵 Great Vibe])
       │
       ├──► Step 3: Optional Input (Type Broken Text OR Tap 🎙️ Mic in Hindi/Marathi/Hinglish)
       │           └──► Tap [✨ AI Enhance] (Checks <3 cap -> Hits Cache OR Gemini Persona Engine)
       │
       └──► Step 4: Compliant Smart Routing Based on Star Rating:
                   ├──► [If 4-5 Stars]: Primary CTA -> [🚀 Tap to Copy & Open Google Maps App]
                   │         (Synchronous Clipboard Copy + Native iOS/Android Maps Deep-Link)
                   │
                   └──► [If 1-3 Stars]: Primary CTA -> [📩 Send Directly to Cafe Manager]
                             (Saves private complaint + Displays compliant secondary 'Post publicly on Google' link)

3.2 Mandatory Screen State Matrix (AI Agent Must Implement All 5 States)
Screen / Component	State Type	Exact UI Behavior & Fallback Requirement
Customer Page (/r/[cafeId])	1. Loading State	Instant CSS skeleton shimmer (<15KB initial HTML). Never show a blank white screen on slow basement 3G.
Dynamic Tag Pills	2. Empty / Offline State	If DB fetch fails or times out (>1500ms), immediately render 5 hardcoded default tags from client bundle.
AI Enhance Button	3. Submitting / Streaming	Disable button, show '✨ Writing like a human... (1/3 left)' spinner. Timeout after 4 seconds.
AI Enhance Button	4. Error / Rate-Limit State	If Gemini API fails or count >= 3, auto-stitch selected tags into a clean template sentence without crashing.
Copy & Redirect CTA	5. Success / Fallback State	Show green toast 'Copied! Paste in Google Maps'. If clipboard permission denied, show manual 'Select All' box.
4. Level 2: Architecture & Technical Decision Records (ADR)
Locked technology choices and folder architecture. Do not allow the AI agent to swap libraries.
•	Frontend & Routing: Next.js 15 (App Router) with TypeScript (`strict: true`). Customer route (`/r/[cafeId]`) must use zero heavy external UI libraries so bundle stays under 80KB.
•	Styling & Components: Tailwind CSS v4 + Lucide React icons (tree-shaken). Shadcn/UI allowed ONLY inside `(owner-dashboard)` routes.
•	Backend & Database: Supabase (PostgreSQL) accessed via Prisma ORM. Server Actions & Route Handlers (`/api/v1/...`) validated with Zod.
•	AI Engine: Official `@google/generative-ai` SDK using `gemini-1.5-flash` (sub-second latency, lowest token cost).
•	QR Generation: `qrcode` npm package generating downloadable high-DPI SVG and PNG base64 strings on the server.
•	Voice Recognition: Browser-native `webkitSpeechRecognition` / `SpeechRecognition` API configured for `en-IN` and `hi-IN` (Zero API cost, instant transcription).
4.1 Canonical Project Directory Structure
qr-review-saas/
├── .cursorrules                       # SDD System Guardrails copied from this spec
├── prisma/
│   ├── schema.prisma                  # Locked 5-Table Relational Schema
│   └── seed.ts                        # Seeds 50+ default Cafe tags & 100 cached reviews
├── src/
│   ├── app/
│   │   ├── (customer-flow)/           # Ultra-Light Customer Bundle (<80KB)
│   │   │   ├── q/[slug]/route.ts      # Permanent Dynamic QR Redirect Handler
│   │   │   └── r/[cafeId]/
│   │   │       ├── page.tsx           # Single-Page Smooth Review Experience
│   │   │       └── loading.tsx        # Instant Skeleton Loader
│   │   ├── (owner-dashboard)/         # Protected B2B SaaS Portal
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Analytics & Conversion Funnel
│   │   │       ├── qr-standees/       # Printable Cafe & Waiter QR PDF/PNG Builder
│   │   │       ├── tags/              # Custom Dish & Tag Manager
│   │   │       ├── staff/             # Waiter Gamification Leaderboard
│   │   │       └── complaints/        # 1-3 Star Private Manager Inbox
│   │   └── api/v1/
│   │       ├── tags/random/route.ts   # PostgreSQL RANDOM() 5-tag endpoint
│   │       ├── ai/enhance/route.ts    # Cache Check -> Rate Limit -> Gemini Persona Engine
│   │       └── review/submit/route.ts # Logs session & returns OS-specific Google Deep-Link
│   ├── components/
│   │   ├── customer/
│   │   │   ├── StarRating.tsx         # 1-Tap Stars with auto-scroll trigger
│   │   │   ├── TagSelector.tsx        # Dynamic Pill Selector
│   │   │   ├── VoiceMicButton.tsx     # Hindi/Hinglish Web Speech API Mic
│   │   │   └── CopyAndRedirectBtn.tsx # Synchronous Clipboard + Maps App Deep-Linker
│   ├── lib/
│   │   ├── prisma.ts                  # Singleton Prisma Client
│   │   ├── gemini-persona.ts          # Anti-Footprint Random Persona Prompt Builder
│   │   ├── google-deeplink.ts         # iOS (comgooglemaps://) & Android Intent URL Builder
│   │   ├── rate-limit.ts              # IP Hash + Session Cap Enforcer
│   │   └── validations/               # Strict Zod Schemas (review.schema.ts)

5. Level 3: Data Model & Database Schema (Prisma ERD)
Exact production schema. Copy directly into prisma/schema.prisma before writing any application code.
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
}

enum TagSentiment {
  POSITIVE
  NEGATIVE
}

enum RouteDestination {
  GOOGLE_PUBLIC
  INTERNAL_MANAGER
}

model Cafe {
  id                 String             @id @default(uuid())
  ownerId            String             @map("owner_id")
  name               String             @db.VarChar(120)
  slug               String             @unique @db.VarChar(80) // Used in permanent QR: /q/[slug]
  googlePlaceId      String             @map("google_place_id") @db.VarChar(255)
  logoUrl            String?            @map("logo_url")
  rewardText         String?            @map("reward_text") @db.VarChar(200) // e.g. "10% OFF next coffee"
  subscriptionStatus SubscriptionStatus @default(TRIAL) @map("subscription_status")
  isActive           Boolean            @default(true) @map("is_active")
  createdAt          DateTime           @default(now()) @map("created_at")

  staffMembers       StaffMember[]
  reviewTags         ReviewTag[]
  reviewSessions     ReviewSession[]

  @@index([slug])
  @@map("cafes")
}

model StaffMember {
  id               String          @id @default(uuid())
  cafeId           String          @map("cafe_id")
  name             String          @db.VarChar(80)
  staffCode        String          @map("staff_code") @db.VarChar(40) // e.g., "rahul01"
  scansCount       Int             @default(0) @map("scans_count")
  reviewsGenerated Int             @default(0) @map("reviews_generated")
  isActive         Boolean         @default(true) @map("is_active")
  createdAt        DateTime        @default(now()) @map("created_at")

  cafe             Cafe            @relation(fields: [cafeId], references: [id], onDelete: Cascade)
  reviewSessions   ReviewSession[]

  @@unique([cafeId, staffCode])
  @@map("staff_members")
}

model ReviewTag {
  id        String       @id @default(uuid())
  cafeId    String?      @map("cafe_id") // Null = Global default tag pool
  tagText   String       @map("tag_text") @db.VarChar(60)
  sentiment TagSentiment @default(POSITIVE)
  isActive  Boolean      @default(true) @map("is_active")

  cafe      Cafe?        @relation(fields: [cafeId], references: [id], onDelete: Cascade)

  @@index([cafeId, sentiment, isActive])
  @@map("review_tags")
}

model ReviewSession {
  id              String           @id @default(uuid())
  cafeId          String           @map("cafe_id")
  staffId         String?          @map("staff_id")
  starRating      Int              @map("star_rating") // 1 to 5
  selectedTags    String[]         @map("selected_tags")
  rawUserInput    String?          @map("raw_user_input") @db.Text
  finalReviewText String?          @map("final_review_text") @db.Text
  aiEnhanceCount  Int              @default(0) @map("ai_enhance_count") // Hard cap at 3
  routedTo        RouteDestination @map("routed_to")
  customerContact String?          @map("customer_contact") @db.VarChar(100) // Optional for 1-3 star follow-up
  ipHash          String           @map("ip_hash") @db.VarChar(64)
  createdAt       DateTime         @default(now()) @map("created_at")

  cafe            Cafe             @relation(fields: [cafeId], references: [id], onDelete: Cascade)
  staff           StaffMember?     @relation(fields: [staffId], references: [id], onDelete: SetNull)

  @@index([cafeId, createdAt])
  @@index([ipHash, createdAt])
  @@map("review_sessions")
}

model AiTemplateCache {
  id                  String   @id @default(uuid())
  tagsCombinationHash String   @unique @map("tags_combination_hash") @db.VarChar(255)
  cachedReviews       String[] @map("cached_reviews") // Array of 5-10 varied human-style reviews
  createdAt           DateTime @default(now()) @map("created_at")

  @@map("ai_template_cache")
}

6. Level 4: API Contracts & Interface Specifications
Binding contracts between Frontend and Backend. Every endpoint must enforce these exact schemas.
6.1 Endpoint 1: Fetch 5 Randomized Dynamic Tags
•	Route & Method: GET /api/v1/tags/random?cafeId={uuid}&stars={1..5}
•	Logic: If stars >= 4, query POSITIVE tags; if stars <= 3, query NEGATIVE improvement tags. Combine Cafe's custom tags with Global default tags and execute ORDER BY RANDOM() LIMIT 5 so every customer gets a unique set.
•	Response (200 OK): { "tags": ["☕ Best Hazelnut Coffee", "🎵 Chill Vibe", "⚡ Fast Table Service", "🥐 Fresh Croissants", "🔌 Good Work Wi-Fi"] }
6.2 Endpoint 2: AI Persona Review Enhancer (With Wallet Guardrails)
•	Route & Method: POST /api/v1/ai/enhance
// Zod Validation Contract (src/lib/validations/review.schema.ts)
import { z } from "zod";

export const EnhanceReviewSchema = z.object({
  sessionId: z.string().uuid(),
  cafeName: z.string().min(1).max(120),
  starRating: z.number().int().min(1).max(5),
  selectedTags: z.array(z.string().max(60)).min(1).max(5),
  rawUserInput: z.string().max(300).optional().default(""),
  languageHint: z.enum(["en", "hinglish", "hi", "mr"]).default("en")
});

•	Response Codes: 200 OK ({ enhancedText, remainingUses, source: 'cache' | 'gemini' }) | 400 Bad Request (Zod validation failed) | 429 Too Many Requests (aiEnhanceCount >= 3 or >5 requests/day from IP).
6.3 Endpoint 3: Final Review Submission & Smart Routing
•	Route & Method: POST /api/v1/review/submit
•	Request Body: { sessionId, cafeId, staffCode?, starRating, selectedTags, finalReviewText, routedTo, customerContact? }
•	Response (200 OK): { success: true, googleWriteReviewUrl: 'https://search.google.com/local/writereview?placeid=...', iosMapsScheme: 'comgooglemaps://...', androidIntentUrl: 'intent://...' }
7. Senior Architect's Risk & Edge-Case Matrix (13 Real-World Traps)
Complete catalog of technical, behavioral, security, and Google policy traps we identified—and their mandatory code solutions.
🔴 THE TRAP	1. iOS Safari & Mobile Browser Clipboard Trap
Calling navigator.clipboard.writeText() inside an async callback (like waiting 2s for Gemini API) is blocked by iOS Safari security. Users arrive on Google Maps with an empty clipboard.
✅ SDD FIX	Decouple AI generation from copying. Generate/enhance text inside the textarea first. When the user taps '🚀 Copy & Open Google', execute synchronous clipboard copy on the exact tap event (plus document.execCommand('copy') fallback) and trigger the URL redirect in the same synchronous tick.

🔴 THE TRAP	2. Google's 'AI Footprint' Spam Filter Penalty
Standard LLM prompts generate repetitive corporate words ('Nestled in the heart of', 'Exquisite ambiance'). Google's spam AI detects identical sentence structures across 50 reviews and deletes all cafe reviews.
✅ SDD FIX	Build a Dynamic Persona & Imperfection Engine in lib/gemini-persona.ts. Randomly inject 1 of 6 human personas per call: (1) Casual Gen-Z lower-case, (2) Busy 1-liner, (3) Warm Hinglish foodie, (4) Bullet-style practical reviewer, (5) Slightly imperfect grammar commuter, (6) Enthusiastic coffee lover. Explicitly ban robotic AI buzzwords.

🔴 THE TRAP	3. Google Account Login Drop-Off in Mobile WebViews
Scanning a QR code opens an isolated in-app browser where the user is NOT logged into Google. Redirecting to a standard web URL forces a Gmail password login screen, causing an 80% drop-off.
✅ SDD FIX	Implement OS-Aware Native App Deep-Linking alongside the web review link. Detect iOS/Android User-Agent and trigger Google Maps app intents where the user is permanently logged in, while keeping search.google.com/local/writereview?placeid=X as the universal fallback.

🔴 THE TRAP	4. Google Policy & FTC Ban on Hard Review Gating
Completely hiding the Google review option for 1-3 star raters violates Google Maps UGC Policy and FTC rules, risking total profile suspension.
✅ SDD FIX	Implement Compliant UI Architecture (The Safe Loophole): On 1-3 stars, change the UI theme to calm amber and show a large primary button: '📩 Send Directly to Cafe Manager (Fastest Resolution)'. Below it, render a compliant, smaller secondary link: 'Or post publicly on Google'. 95%+ frustrated users choose the manager inbox while keeping you 100% legally compliant.

🔴 THE TRAP	5. API Token Billing DDoS (Draining Your Wallet)
A malicious user or bot script repeatedly clicks '✨ AI Enhance' 10,000 times, exhausting your Gemini API quota and racking up a massive cloud bill.
✅ SDD FIX	Enforce a 3-Layer Cost Shield: (1) Zero-Cost Tag Cache: If rawUserInput is empty and only tags are selected, serve pre-generated reviews from the ai_template_cache DB table at $0 cost. (2) Session Cap: Hard limit aiEnhanceCount <= 3 per session. (3) IP Rate Limit: Max 5 review sessions per IP hash per 24 hours.

🔴 THE TRAP	6. Competitor QR Photo Spam & Fake Review Attacks
A rival shop owner photographs the table QR code and shares the URL on WhatsApp to flood the dashboard with fake 1-star complaints or trigger Google spam flags.
✅ SDD FIX	Combine IP-Hash rate limiting, browser device fingerprinting (HttpOnly cookie lock for 24h), and an optional 'Verify Table PIN' toggle in the Owner Dashboard for cafes experiencing active spam attacks.

🔴 THE TRAP	7. Basement Cafe Dead-Zone / Slow 3G Network
Many cafes are in basements with weak cellular signals. A heavy 2MB React bundle shows a blank white screen for 6 seconds, causing the customer to lock their phone.
✅ SDD FIX	Keep the (customer-flow) route group strictly under 80KB gzipped. Pre-render the star rating shell via Server Components, use Optimistic UI transitions (instant star tap response), and auto-fallback to client-side tag stitching if the network drops.

🔴 THE TRAP	8. AI Hallucinations & Profanity / Toxicity Injection
A prankster types profanity or insults into the custom box, and the AI polishes it into a severe public defamation post.
✅ SDD FIX	Add a strict System Prompt Guardrail + Regex Pre-Filter. If profanity or hate speech is detected, bypass AI enhancement and return a polite generic text based solely on selected tags, or route directly to internal feedback.

🔴 THE TRAP	9. Physical QR Obsolescence (Broken Printed Standees)
If you change your frontend route structure 6 months later, thousands of printed acrylic table standees across 100 cafes break with 404 errors.
✅ SDD FIX	Never encode the final UI URL inside the QR code. Encode a permanent short redirect route: https://yourdomain.com/q/[cafe-slug]?s=[staff-code]. The /q/[slug] route looks up the active cafeId in PostgreSQL and issues a 307 Temporary Redirect.

🔴 THE TRAP	10. Waiter Apathy (Why Cafe Owners Churn After Month 2)
Table standees get ignored if waiters don't remind customers. Review volume drops in Month 2 and the cafe owner cancels your SaaS subscription.
✅ SDD FIX	Built-in Staff Gamification: Generate unique QR codes per waiter (?s=rahul01). Track scansCount and reviewsGenerated per staff member and display a live 'Staff Leaderboard' in the Owner Dashboard so owners can reward the top waiter each month.

🔴 THE TRAP	11. Typing & Literacy Barrier for Local Customers
Many customers struggle to read or type English descriptions on mobile keyboards, even when they want to praise a specific dish.
✅ SDD FIX	Integrate a 1-Tap Voice-to-Review Mic (VoiceMicButton.tsx) using the browser's free Web Speech API supporting Hindi, Marathi, and Hinglish. The user speaks naturally, and Gemini converts the transcript into a natural review.

🔴 THE TRAP	12. Fake Reward Claim Abuse ('Zero Verification' Problem)
Customers click 'Go to Google', immediately press the back button without posting the review, and claim the '10% Off Next Coffee' coupon.
✅ SDD FIX	Implement a 12-Second Verification State + Timestamped Coupon Screen, or deliver the reward code via WhatsApp/SMS after polling the Google Business Profile API for an incremented review count.

🔴 THE TRAP	13. Physical QR Sticker Tampering Scam
Scammers paste fake phishing or UPI QR stickers on top of exposed table QR codes.
✅ SDD FIX	Include a mandatory 'Tamper-Proof Standee Guide' in the QR Builder PDF instructing owners to seal prints inside double-sided acrylic holders and printing the cafe logo inside the QR center matrix.

8. Core Production Code Blueprints (Copy into Project)
Reference implementations for the two trickiest engineering modules so your AI agent does not hallucinate them.
8.1 Anti-Footprint Gemini Persona Engine (src/lib/gemini-persona.ts)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const HUMAN_PERSONAS = [
  "Write a casual 1-to-2 sentence review like a 22-year-old college student. Use simple everyday words, no corporate buzzwords.",
  "Write a short, warm Hinglish-flavored English review like a regular local customer praising the vibe and food.",
  "Write a direct, punchy 1-sentence review like a busy office worker on a coffee break. Keep it super natural.",
  "Write a genuine 2-sentence review focusing on how welcoming the staff was and how fresh the items tasted.",
  "Write a relaxed, conversational review with slightly casual punctuation—like someone typing quickly while walking out of the cafe."
];

export async function generateHumanLikeReview(
  cafeName: string,
  tags: string[],
  rawInput: string
): Promise<string> {
  const persona = HUMAN_PERSONAS[Math.floor(Math.random() * HUMAN_PERSONAS.length)];
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are helping a real customer write an authentic Google review for "${cafeName}".
    Selected highlights: ${tags.join(", ")}.
    Customer's raw note (may be broken English, Hindi, or Marathi): "${rawInput || "None"}".

    STRICT RULES:
    1. Persona instruction: ${persona}
    2. NEVER use robotic AI words like "Nestled", "Exquisite", "Culinary delight", "Must-visit gem", or "Top-notch".
    3. If the customer's raw note contains profanity, insults, or offensive text, IGNORE the raw note completely and write only from the selected highlights.
    4. Output ONLY the final review text in English (or natural Indian English), under 35 words, with no quotes around it.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

8.2 iOS/Android Safe Synchronous Copy & Redirect (src/components/customer/CopyAndRedirectBtn.tsx)
"use client";
import React, { useState } from "react";

interface Props {
  reviewText: string;
  googlePlaceId: string;
  onSubmitted: () => void;
}

export function CopyAndRedirectBtn({ reviewText, googlePlaceId, onSubmitted }: Props) {
  const [copied, setCopied] = useState(false);

  const handleTap = () => {
    // 1. Synchronous Copy (Works inside direct user tap on iOS Safari & Chrome)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(reviewText).catch(() => fallbackCopy(reviewText));
    } else {
      fallbackCopy(reviewText);
    }

    setCopied(true);
    onSubmitted();

    // 2. Construct Direct Google Write-Review URL
    const webReviewUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(googlePlaceId)}`;

    // 3. Redirect after 350ms so user sees "Copied! Just Paste" visual toast
    setTimeout(() => {
      window.location.href = webReviewUrl;
    }, 350);
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      className="w-full py-4 px-6 rounded-xl bg-blue-600 active:bg-blue-700 text-white font-bold text-lg shadow-lg transition"
    >
      {copied ? "✅ Review Copied! Opening Google..." : "🚀 Tap to Copy & Post on Google"}
    </button>
  );
}

9. Level 5: Atomic Implementation Task Plan (For Vibe Coding)
Feed these 6 phases one by one to your AI coding agent. Do NOT move to the next phase until the verification command passes.
Atomic Phase	Exact Scope to Prompt AI Agent	Deterministic Verification Step
Phase 1: Foundation, Database & Seed	Initialize Next.js 15 (TypeScript strict), install Prisma + Zod, paste Section 5 Schema into prisma/schema.prisma, and create prisma/seed.ts with 1 demo cafe ('The Roast Cafe'), 2 staff members, 30 positive/negative tags, and 20 cached reviews.	npx prisma db push && npx prisma db seed && npm run type-check
Phase 2: Permanent QR Redirect & Random Tag API	Build GET /q/[slug]/route.ts (increments staff scansCount and 307-redirects to /r/[cafeId]?s=code) and GET /api/v1/tags/random/route.ts using PostgreSQL ORDER BY RANDOM() LIMIT 5.	curl -I http://localhost:3000/q/roast-pune?s=rahul01
Phase 3: Ultra-Light Customer Review Flow UI	Build /r/[cafeId]/page.tsx with StarRating, TagSelector, VoiceMicButton, and compliant conditional routing (4-5 Star CopyAndRedirectBtn vs 1-3 Star Manager Form + secondary Google link).	npm run build (Verify /r/[cafeId] First Load JS is <90KB)
Phase 4: AI Persona Engine, Cache & Rate Limiter	Build POST /api/v1/ai/enhance/route.ts with Zod validation, AiTemplateCache lookup for zero-input requests, max-3 session cap, and Gemini 1.5 Flash Persona Engine.	npm run type-check && test 4th click returns HTTP 429
Phase 5: Cafe Owner Dashboard & Printable QR Builder	Build /dashboard routes: Overview metrics, Staff Leaderboard table, Custom Tag CRUD, 1-3 Star Manager Complaints inbox, and QR Standee generator using 'qrcode' package.	npm run type-check && verify QR download renders valid SVG/PNG
Phase 6: Edge-Case Hardening & Production Deployment	Test iOS Safari clipboard fallback, offline tag fallback, profanity filter, and deploy to Vercel + Supabase production.	npx tsc --noEmit && npm run lint && npm run build

