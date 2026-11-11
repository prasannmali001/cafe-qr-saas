# Cafe & Shop QR Review Accelerator SaaS

> **Production System Architecture, Senior Engineering Edge-Case Matrix, Database Schema, API Contracts & Anti-Hallucination Guardrails built with Spec-Driven Development (SDD v1.0).**

---

## ⚡ Stack & Key Architectural Choices

- **Framework**: Next.js 15 (App Router) + TypeScript (`"strict": true`, Zero `any`)
- **Styling**: Tailwind CSS + `lucide-react` icons (tree-shaken)
- **Database & ORM**: PostgreSQL (Supabase) via Prisma ORM 6
- **AI Engine**: Google Gemini 1.5 Flash API (`@google/generative-ai`)
- **Voice Input**: Native browser Web Speech API (`SpeechRecognition` in `en-IN` & `hi-IN` - zero token cost)
- **QR Generation**: Server-side `qrcode` package with Level H (30%) Error Correction
- **Compliance Standard**: 100% Google Maps UGC & FTC Compliant (Safe Loophole Architecture)

---

## 🚀 Quickstart (Works Out-Of-The-Box Without Local DB)

Every route in the platform features **graceful offline/demo fallback** so the entire customer flow and owner dashboard can be tested immediately upon cloning:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optionally provide your `GEMINI_API_KEY` for live AI generation. If omitted, the built-in Anti-Footprint 6-Persona Engine automatically runs in client-grade fallback mode).*

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Key Routes & Demo Scenarios to Test

| Route | Purpose | Key Verification Behavior |
| :--- | :--- | :--- |
| **`/`** | SaaS Landing Page | Quick-switch buttons for both customer and owner views. |
| **`/q/roast-pune?s=rahul01`** | Permanent QR Redirect | 307 temporary redirect to `/r/[cafeId]` with waiter attribution. |
| **`/r/demo-roast-pune-id?s=rahul01`** | Customer Review Experience | 3-tap review flow with stars, dynamic pills, voice input, and AI enhance. |
| **`/dashboard`** | Owner Overview | Real-time conversion funnel, star ratings, and Anti-Spam Table PIN toggle. |
| **`/dashboard/qr-standees`** | QR Studio | Printable acrylic standees and waiter bill badges with 1-tap SVG/PNG download. |
| **`/dashboard/staff`** | Waiter Leaderboard | Gamified waiter leaderboard tracking scans and generated reviews. |
| **`/dashboard/tags`** | Custom Dish Manager | CRUD for positive highlights and constructive feedback categories. |
| **`/dashboard/complaints`** | 1-3★ Complaints Inbox | Private feedback triage with customer phone/email and resolution tickets. |
| **`/api/v1/health`** | System Health Check | Verifies database connectivity, latency, and Gemini API status. |

---

## 🗄️ Connecting Production Supabase (PostgreSQL)

When ready to link your live Supabase cloud database:

1. Create a PostgreSQL project on [Supabase.com](https://supabase.com).
2. Copy your connection URI into `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
   ```
3. Push the 5-table relational schema:
   ```bash
   npx prisma db push
   ```
4. Seed demo cafe, waiters, 30 tags, and 20 AI cache combinations:
   ```bash
   npx prisma db seed
   ```

---

## 🛡️ Senior Architect's 13 Edge-Case Defenses Built In

| Trap # | Real-World Failure | Code Solution Implemented |
| :--- | :--- | :--- |
| **#1** | **iOS Safari Clipboard Block** | Synchronous clipboard copy in direct user tap tick (`CopyAndRedirectBtn.tsx`) + `document.execCommand('copy')` fallback + manual copy box. |
| **#2** | **Google AI Footprint Penalty** | Dynamic 6-Persona Engine in `gemini-persona.ts` (College student, Hinglish local, busy worker, etc.) + strict ban on robotic AI words (*"Nestled"*, *"Exquisite"*). |
| **#3** | **Mobile WebView Login Drop-Off** | OS-aware native app deep-link generator in `google-deeplink.ts` (`comgooglemaps://` & Android intent) bypassing Google login friction. |
| **#4** | **Google Policy / FTC Hard Gating Ban** | Compliant UI Architecture: 1-3 stars routes to empathetic Manager Box while displaying compliant secondary *"Or post publicly on Google"* link. |
| **#5** | **AI Token Billing Wallet DDoS** | 3-Layer Shield in `rate-limit.ts`: $0 Tag Cache lookup (`ai_template_cache`), hard cap at 3 enhancements/session, and max 15 requests/IP/day. |
| **#6** | **Competitor QR Photo Spam** | 24-hour cookie cooldown guard + optional daily 2-digit Table PIN verification toggle in Owner Dashboard. |
| **#7** | **Basement Cafe 3G Dead-Zone** | Ultra-light `<15KB` CSS skeleton shimmer (`loading.tsx`), client bundle under `<90KB`, and instant client tag fallback if DB times out (>1500ms). |
| **#8** | **Profanity & Toxicity Injection** | Pre-filter regex in `gemini-persona.ts`: completely discards abusive custom notes and generates polite reviews strictly from tags. |
| **#9** | **Physical Printed Standee Obsolescence**| Standees encode permanent redirect route `/q/[slug]?s=[staffCode]` issuing 307 redirects to PostgreSQL cafe IDs. |
| **#10**| **Waiter Apathy & SaaS Churn** | Gamified Waiter Leaderboard tracking `scansCount` and `reviewsGenerated` with individual QR suffixes. |
| **#11**| **Local Language / Typing Barrier** | 1-Tap Voice-to-Text (`VoiceMicButton.tsx`) supporting Indian English (`en-IN`) and Hindi/Hinglish (`hi-IN`). |
| **#12**| **Fake Reward Claim Screenshot Abuse** | Live Timestamped Reward Coupon (`LiveRewardCoupon.tsx`) with ticking live seconds and counter verification codes. |
| **#13**| **Physical QR Sticker Tampering** | High error correction (`Level H`) embedding center matrix branding + Tamper-Proof acrylic standee guide. |

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. Import your repository into [Vercel](https://vercel.com).
3. In Project Settings -> Environment Variables, configure:
   - `DATABASE_URL`: Your Supabase pooler / direct connection string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g. `https://your-cafe-saas.vercel.app`).
4. Click **Deploy**.

---

## 🧪 Testing & Type Verification

```bash
# Verify TypeScript strict mode (zero any)
npx tsc --noEmit

# Run ESLint
npm run lint

# Compile production bundle
npm run build
```
