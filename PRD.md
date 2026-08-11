# Godseye HQ — Product Requirements Document (PRD)

> **Version:** 3.0.0  
> **Status:** 🟢 Pre-launch landing baseline approved  
> **Last Updated:** 2026-08-11  
> **Author:** Digital Viking / Digital Hustlers  

---

## Milestone baseline — canonical pre-launch landing

The canonical multi-hero GodsEye application page is the public pre-launch landing page at `https://godseye.digitalhustlerx.com`. It contains the hero slider and full marketing sections. It is not the single-hero alternate page or waitlist/capture variant.

All primary account CTAs must go directly to the branded OpenSaaS application:

- Signup: `https://app.digitalhustlerx.com/signup`
- Login: `https://app.digitalhustlerx.com/login`
- Authenticated dashboard, account, and pricing host: `https://app.digitalhustlerx.com`

The temporary `opensaas.62.84.186.1.sslip.io` hostname is not customer-facing. `godseye.shop` is a legacy alias redirecting to the canonical landing; `buy.godseye.shop` redirects to app pricing. `/app/` is an alternate/legacy route, not the primary public entry. See `docs/PRE-LAUNCH-LANDING-MILESTONE-PRD.md` for complete acceptance criteria and remaining field-tweaking work.

---

## 1. Product Overview

Godseye HQ is an **AI-powered WordPress management agent** controlled via Telegram chat. Users connect their WordPress site (via a plugin + Application Password), then send natural language commands to a Telegram bot to manage posts, pages, plugins, WooCommerce orders, media, and more.

**Tagline:** *Your Personal AI Developer, 24/7*  
**Core Promise:** "WordPress, managed by AI. No more logging into wp-admin for routine tasks."

---

## 2. Current Live Endpoints

| URL | Purpose | Serves From | Status |
|-----|---------|-------------|--------|
| **https://godseye.digitalhustlerx.com** | Main product landing + dashboard | `/root/godseye-repo/dist/` | 🟢 Live |
| **https://godseye.62.84.186.1.sslip.io** | Mirror (same content) | `/root/godseye-repo/dist/` | 🟢 Live |
| **https://godseye.shop** | Old waitlist (Next.js) | `/root/godseye-waitlist/` on :3100 | 🔴 Legacy |
| **https://buy.godseye.shop** | Old sales page (WordPress) | WordPress backend | 🔴 Legacy |
| **https://api.godseyes.digitalhustlerx.com** | Backend API | Node backend | 🔧 Active |
| **https://t.me/GodseyeXbot** | Telegram bot | Docker container | 🟢 Active |

---

## 3. Architecture

### 3.1 Frontend (React SPA)

```
/root/godseye-repo/  ← SOURCE OF TRUTH (git repo)
├── src/
│   ├── App.tsx                    ← Main application (1,574 lines, ALL views)
│   ├── main.tsx                   ← React entry point
│   ├── index.css                  ← TailwindCSS global styles
│   ├── types.ts                   ← Type definitions
│   ├── mockData.ts                ← Pricing, credit packs, self-host plans
│   └── components/
│       ├── WordPressDashboard.tsx  ← WP management dashboard
│       ├── LivePlayground.tsx      ← Sandbox for testing commands
│       └── WaitlistModal.tsx      ← Waitlist signup + founder pricing
├── server.ts                      ← Express server (SSR/production)
├── package.json                   ← Dependencies (React + Vite + Tailwind)
├── vite.config.ts                 ← Build config
├── tsconfig.json                  ← TypeScript config
├── LICENSE                        ← AGPL-3.0
├── COMMERCIAL_LICENSE.md          ← Commercial licensing terms
├── supabase-migration-godseyehq.sql ← DB migration (referral + payments)
└── dist/                          ← BUILT OUTPUT (auto-generated)
```

### 3.2 Views / Pages

| View | Route | Purpose |
|------|-------|---------|
| **landing** | `/` | Marketing homepage (hero, features, how-it-works, pricing, FAQ, footer) |
| **waitlist** | `/waitlist` | Waitlist signup (legacy, mostly replaced by modal) |
| **dashboard** | `/dashboard` | WordPress management dashboard (mock data) |
| **playground** | `/playground` | Sandbox to test Telegram-style commands |
| **buy** | `/buy` | Subscription plans, credit packs, checkout |
| **download** | `/download` | Plugin download + install guide |
| **success** | `/success` | Post-purchase confirmation |

### 3.3 Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **WaitlistModal** | `src/components/WaitlistModal.tsx` | Email capture → Supabase → referral code |
| **WordPressDashboard** | `src/components/WordPressDashboard.tsx` | Mock WP management UI |
| **LivePlayground** | `src/components/LivePlayground.tsx` | Interactive command sandbox |

### 3.4 Backend / External Dependencies

| Service | Purpose | Status |
|---------|---------|--------|
| **Supabase** | Waitlist DB, referral tracking, payments | ⚙️ Schema migrated, needs connection |
| **Telegram Bot** (`@GodseyeXbot`) | User-facing AI agent | 🟢 Active |
| **Polar.sh** | Payment processing (checkout) | 🔧 Products created, webhook placeholder |
| **Godseye X Bot** | AI/agent processing gateway | 🔧 Legacy integration |
| **API Backend** (`api.godseyes.digitalhustlerx.com`) | License management, site connections | 🟢 Active |

---

## 4. Pricing Model

### 4.1 Subscription Plans

| Plan | Monthly | Credits | Sites | Founder Price | Founder Badge |
|------|---------|---------|-------|---------------|---------------|
| **Free** | $0 | 50 | 1 | — | — |
| **Starter** | $9/mo | 500 | 1 | **$4.50/mo** ⭐ | Founders |
| **Pro** | $29/mo | 2,000 | 3 | **$14.50/mo** ⭐ | Founders |
| **Agency** | $99/mo | 10,000 | 10 | **$49.50/mo** ⭐ | Founders |

### 4.2 One-Time Top-Ups

| Pack | Price | Credits |
|------|-------|---------|
| Wallet Top-Up | $10 | 100 |
| Starter Pack | $9 | 500 |

### 4.3 Self-Host Tiers (New — OMP commit `bb4fa40`)

| Tier | Setup Fee | Monthly | Description |
|------|-----------|---------|-------------|
| DIY | Free | $0 | Self-serve, own VPS |
| White-Glove | $99 | $19 | We install & configure |
| Migration | $49 | $9 | Move from existing setup |
| Storage | Free | $9 | Offload WP media |
| White-Label | $499 | $49 | Rebrand as your own |
| Enterprise | Custom | Custom | Full managed |

### 4.4 Founder Pricing

- **First 100 signups** get 50% off for 1 year
- **14-day scarcity countdown** displayed on waitlist
- **Founders badge** shown on pricing cards

---

## 5. Commercial / Open Source Strategy

Dual-license model introduced in the latest commit:

| License | When It Applies |
|---------|----------------|
| **AGPL-3.0** | Self-hosting for personal or non-competing commercial use |
| **Commercial License** | Any use not permitted by AGPL (proprietary hosting, modifications not shared back) |

Contact for commercial license: `license@godseye.shop`

---

## 6. Referral System

- **500 credits** awarded to both referrer and referee
- Referral code auto-generated on waitlist signup
- Referral link with copy button in success UI
- Supabase table supports `referral_code`, `referred_by` tracking

---

## 7. Waitlist Flow

```
User clicks CTA → WaitlistModal opens → Email input → 
Supabase insert → Founder badge check (first 100) → 
Referral code generated → Success screen → 
Founder pricing unlocked in localStorage
```

The app has a **soft gate**: all CTAs (Start Free, Buy Credits, etc.) are intercepted and redirect to the WaitlistModal before granting full access.

---

## 8. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | TailwindCSS v4 + Lucide icons |
| Fonts | Georgia (serif headings), system fonts (body) |
| Server | Express (Node) via `server.ts` |
| Database | Supabase (PostgreSQL) |
| Payments | Polar.sh (checkout), Polar webhook placeholder |
| AI/Bot | Telegram bot `@GodseyeXbot` + Godseye X Bot gateway |
| Git host | `github.com/digitalhustlerx/GodseyeHQ` |
| Production | nginx → `/root/godseye-repo/dist/` |

---

## 9. Development Commands

```bash
# Dev server
cd /root/godseye-repo && npm run dev

# Production build
cd /root/godseye-repo && npm run build

# Run production server
cd /root/godseye-repo && node dist/server.cjs

# Reload nginx after config changes
nginx -t && systemctl restart nginx

# Git push (unpushed commits exist!)
git push origin main
```

---

## 10. Git State

```
9 commits total, HEAD at bb4fa40
7 commits ahead of origin/main (NOT PUSHED)
```

**Key commits:**
| Date | Commit | Description |
|------|--------|-------------|
| Jul 21 | `bb4fa40` | 🆕 Commercial launch: waitlist gating, founder pricing, self-host matrix, AGPL license |
| Jul 21 | `2ec006a` | Update Telegram bot to @GodseyeXbot |
| Jul 21 | `4efa867` | Add comprehensive README, remove internal ops |
| Jul 21 | `9d7359e` | Remove jargon in WordPressDashboard |
| Jul 21 | `03c7bc5` | Simplify copy + premium subscription features |
| Jul 21 | `ec909ad` | Backup before copy/pricing simplification |
| Jul 19 | `83e67ab` | (origin/main) Initial project structure |

---

## 11. Files That Need Attention

| File | Status |
|------|--------|
| **Supabase connection** (in WaitlistModal) | ⚙️ Needs real Supabase credentials |
| **Polar.sh webhook** | ⚙️ Placeholder — needs wiring |
| **Telegram bot token** | 🟢 Set to @GodseyeXbot |
| **`dist/` build** | ⚙️ May be stale after 7 commits — rebuild needed |
| **Git push** | ❌ 7 commits unpushed to origin |

---

*End of PRD.*
