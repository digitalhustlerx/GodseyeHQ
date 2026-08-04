# Godseye HQ — AGENTS.md

> **For AI agents (OMP, Hermes, Claude Code, etc.) working on this project.**
> Last Updated: 2026-07-21

---

## 🎯 Project Identity

- **Brand:** GodsEye (styled GODSEYE or Godseye)
- **What it is:** AI-powered WordPress management agent via Telegram
- **Current Phase:** Pre-launch (waitlist gated, founder pricing active)
- **Live URL:** https://godseye.digitalhustlerx.com
- **Telegram Bot:** @GodseyeXbot
- **License:** AGPL-3.0 + Commercial (dual license)

---

## 📍 SOURCE OF TRUTH

**The ONLY directory you should EVER edit is `/root/godseye-repo/`**

Everything else is legacy:
- `/root/godseye/` — 🗑️ Old workspace, DO NOT TOUCH
- `/root/godseye-waitlist/` — 🗑️ Old Next.js waitlist at godseye.shop, LEGACY
- `/root/godseye/dashboard/` — 🗑️ Old HTML dashboard, LEGACY
- `/home/openclaw/godseye-documentation/` — 🗑️ OLD DOCS, ignore

---

## 📁 File Map

```
/root/godseye-repo/
├── src/
│   ├── App.tsx                    ← THE MAIN FILE — entire SPA in one component
│   ├── main.tsx                   ← React entry (do not touch)
│   ├── index.css                  ← TailwindCSS styles
│   ├── types.ts                   ← All TypeScript types
│   ├── mockData.ts                ← Pricing plans, credit packs, self-host plans
│   └── components/
│       ├── WordPressDashboard.tsx  ← WP management dashboard UI
│       ├── LivePlayground.tsx      ← Command sandbox
│       └── WaitlistModal.tsx      ← Waitlist + founder pricing + referrals
├── server.ts                      ← Express production server
├── package.json                   ← Deps: React, Vite, Tailwind, Lucide, express
├── vite.config.ts                 ← Vite config
├── PRD.md                         ← Product Requirements Document (READ THIS)
├── HANDOFF.md                     ← Handoff documentation (READ THIS)
├── AGENTS.md                      ← THIS FILE
├── COMMERCIAL_LICENSE.md          ← Commercial licensing terms
├── supabase-migration-godseyehq.sql ← DB schema migration
├── README.md                      ← GitHub-facing README (OMP already wrote this)
├── LICENSE                        ← AGPL-3.0
└── dist/                          ← BUILT OUTPUT — nginx serves this
    ├── index.html
    ├── assets/
    └── server.cjs
```

---

## 🧰 Commands

```bash
# Build for production
cd /root/godseye-repo && npm run build

# Dev server
cd /root/godseye-repo && npm run dev

# Run production server (if using Node SSR)
cd /root/godseye-repo && node dist/server.cjs

# Nginx reload (after config changes)
nginx -t && systemctl restart nginx

# Push to GitHub (7 commits waiting)
cd /root/godseye-repo && git push origin main
```

---

## 🚨 Immediate Action Items

| Priority | Task | Why |
|----------|------|-----|
| 🔴 **HIGH** | Push 7 commits to GitHub | Repo is 7 commits ahead, nothing on origin |
| 🔴 **HIGH** | Rebuild (`npm run build`) | `dist/` may be stale after latest commit |
| 🟡 MED | Wire Supabase credentials | WaitlistModal uses Supabase — currently unconnected |
| 🟡 MED | Wire Polar.sh webhook | Payment checkout has placeholder, no real webhook |
| 🟢 LOW | Replace godseye.shop | Old Next.js waitlist still active at godseye.shop |

---

## 🧪 App Structure (Views)

The app is a **single-file React SPA** where all views are controlled by `activeView` state in `App.tsx`:

| `activeView` | What renders | Key code in App.tsx |
|---|---|---|
| `landing` 🏠 | Marketing page (hero, features, pricing, FAQ, footer) | Lines 578-1035 |
| `waitlist` | Legacy waitlist page | Lines 377-544 |
| `dashboard` | WP management dashboard | Lines 545-564 |
| `playground` | Command sandbox | Lines 565-577 |
| `buy` 💳 | Plans, credits, checkout | Lines 1036-1263 |
| `download` ⬇️ | Plugin download + install guide | Lines 1264-1400 |
| `success` ✅ | Post-purchase confirmation | Lines 1401-1480 |

The **WaitlistModal** is a separate component that overlays on top — intercepting all CTAs when no waitlist session exists.

---

## 🎨 Design Tokens

```css
/* Dark theme, gold accents */
bg: #0A0A0A
text: #F2F2F2
accent: #C4A484 (gold)
surface: #121212
border: rgba(255,255,255,0.1)
heading font: Georgia, serif (300 weight)
body font: system sans-serif
radius: rounded-2xl (cards), rounded-full (buttons)
```

---

## 💬 Telegram: GodseyeHQ Forum Topics

| Topic | Thread ID | Purpose |
|-------|-----------|---------|
| 🏠 Landing Page | 462 | Hero copy, design, CTAs, A/B tests, conversion |
| 💰 Pricing & Credits | 463 | Credit packs, tiers, checkout, Polar.sh, revenue |
| 📊 Data Flow & Architecture | 464 | Auth, sessions, WP connections, Supabase, bot API |
| 🚀 Marketing & Growth | 465 | Launch, social distribution, community, analytics |
| 🔧 Dev & Git | 466 | Code changes, builds, deploys, git operations |
| 💼 Business & Strategy | 467 | Revenue model, licensing, roadmap, competitors |

**Chat ID:** `-1004450820767` (forum-enabled supergroup)
**Bot:** @GodseyeXbot (Godseye X Bot) via Composio
**Rules:** Each topic stays scoped. Create temporary topics for branches, close when done. No cross-topic noise.

---

## 🌐 Domain & Nginx

| URL | Config File | Root |
|-----|-------------|------|
| godseye.digitalhustlerx.com | `/etc/nginx/sites-available/godseye.digitalhustlerx.com` | `/root/godseye-repo/dist/` |
| godseye.62.84.186.1.sslip.io | `/etc/nginx/sites-available/godseye.sslip` | `/root/godseye-repo/dist/` |
| api.godseyes.digitalhustlerx.com | `/etc/nginx/sites-available/godseye-api` | Node API backend |

ALL nginx configs bind to `62.84.186.1:443` and `[2a02:c207:2319:3150::1]:443` — NEVER use bare `listen 443;`.

After adding a new nginx server block, do a **full restart** (`systemctl restart nginx`), not just reload — the default_server catch-all can override new SNI configs otherwise.

---

## 📊 Git State

```
Remote: git@github.com:digitalhustlerx/GodseyeHQ.git
Branch: main
Status: 7 commits ahead of origin/main (NOT PUSHED)
```

**Last commit (bb4fa40):** "Commercial launch: waitlist gating, founder pricing, self-host matrix, AGPL license"  
— Added LICENSE files, WaitlistModal, founder pricing, referral system, Supabase migration, self-host matrix

---

## ❌ Common Mistakes to Avoid

1. **Don't edit files outside `/root/godseye-repo/`** — old copies are scattered everywhere
2. **Don't use `nginx -s reload`** for NEW server blocks — use `systemctl restart nginx`
3. **Don't forget to rebuild** after editing `src/` — nginx serves `dist/` statically
4. **Don't push without rebuilding first** — stale `dist/` breaks the live site
5. **Don't change the remote** — it's `git@github.com:digitalhustlerx/GodseyeHQ.git`

---

*End of AGENTS.md — pick up and go.*
