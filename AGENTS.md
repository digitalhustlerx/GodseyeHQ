# Godseye HQ — AGENTS.md

> **For AI agents (OMP, Hermes, Claude Code, etc.) working on this project.**
> Last Updated: 2026-08-08

---

## 🎯 Project Identity

- **Brand:** GodsEye (styled GODSEYE or Godseye)
- **What it is:** A living AI agent that runs your **business** from Telegram (clients, content, orders, reminders). NOT just WordPress — the whole-office framing.
- **Current Phase:** Pre-launch (waitlist gated, founder pricing active, first 100 get founder rate)
- **Live URL:** https://godseye.digitalhustlerx.com  ← **serves the dedicated WAITLIST landing page** (not the marketing SPA)
- **Marketing SPA (full site):** reachable at `https://godseye.digitalhustlerx.com/app/` and `https://godseye.62.84.186.1.sslip.io/`
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
├── GODSEYE-PRODUCT-STANDARD.md    ← Commercial, onboarding, licence + content source of truth (READ THIS)
├── HANDOFF.md                     ← Handoff documentation (READ THIS)
├── AGENTS.md                      ← THIS FILE
├── COMMERCIAL_LICENSE.md          ← Commercial licensing terms
├── supabase-migration-godseyehq.sql ← DB schema migration
├── README.md                      ← GitHub-facing README (OMP already wrote this)
├── LICENSE                        ← AGPL-3.0
├── seo-assets/waitlist.html        ← **DEDICATED WAITLIST LANDING PAGE** (served at main domain root). Source of truth; deploy.sh copies to dist/waitlist.html
├── seo-assets/tracker.js           ← Self-hosted behavior tracker (posts to /api/track)
├── drafts/                         ← Copy experiments + direction docs
│   └── CONSOLIDATED-COPY-ANGLE.md  ← Consolidation agent output (best angle synthesis)
├── marketing-fleet/                ← Accounts/channels/campaigns for social
├── dist/                          ← BUILT OUTPUT — nginx serves this
│   ├── index.html                 (marketing SPA — /app)
│   ├── waitlist.html              (WAITLIST page — main domain root, /)
│   ├── assets/
│   └── server.cjs
├── wp-plugin/                     ← God's Eye WordPress bridge plugin (PHP)
│   ├── godseye-bridge/            ← source of truth: rest.php routes, admin.php UI
│   │   ├── godseye-bridge.php     ← main (v1.2.0)
│   │   ├── includes/rest.php      ← 19 godseye/v1 REST routes + HMAC auth
│   │   ├── includes/admin.php     ← Connect + "Bring your team" tabs
│   │   ├── uninstall.php          ← cleans settings on plugin delete
│   │   └── readme.txt
│   └── dist/godseye-bridge-1.2.0.zip  ← distributable plugin zip
```

> **Plugin ↔ backend contract (v1.2.0):** the plugin connects via `POST /api/sites/connect` + `/api/sites/verify` (in `server.ts`), and the admin referral tab calls `GET /api/referral/link`. All three must exist in `server.ts` — do not remove. `scripts/deploy.sh` rebuilds `dist/godseye-plugin.zip` from `wp-plugin/` automatically (the file `/api/plugin-download` serves).

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

# Push to GitHub (safe — checkpoint + push)
cd /root/godseye-repo && git add -A && git commit -m "checkpoint: <desc>" && git push origin main
```

---

## 🚨 Immediate Action Items

| Priority | Task | Why |
|----------|------|-----|
| 🔴 **HIGH** | Consolidate copy into ONE best angle (see `drafts/CONSOLIDATED-COPY-ANGLE.md`) | Founder consolidating months of copy; wants one all-around message for lead collection |
| 🟡 MED | Set up Vercel/mirror fallback for the waitlist landing | Redundancy — "options so it never goes down" |
| 🟡 MED | Purge old test emails from `waitlist` table if founder approves | Test rows inflate the honest adoption count |
| 🟢 LOW | Wire Polar.sh webhook | Payment checkout has placeholder, no real webhook |

> NOTE: Supabase is NOT used — waitlist + tracking are on local SQLite (`data/godseye.db`). Ignore any older "wire Supabase" notes.

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

| URL | Serves | Root |
|-----|--------|------|
| godseye.digitalhustlerx.com `/` | **WAITLIST landing page** (`waitlist.html`) | `/root/godseye-repo/dist/` |
| godseye.digitalhustlerx.com `/app/` | Full marketing SPA | `/root/godseye-repo/dist/` (alias) |
| godseye.62.84.186.1.sslip.io `/` | Full marketing SPA | `/root/godseye-repo/dist/` |
| godseye-staging.62.84.186.1.sslip.io | Older staging build | `/root/godseye-staging/dist/` |
| api.godseyes.digitalhustlerx.com | Node API backend | Node on :3000 |

**IMPORTANT — main domain root = waitlist:** `location = /` and `location /` in `godseye.digitalhustlerx.com` serve `waitlist.html` (strict lead capture). The marketing SPA is at `/app/`. Do NOT point the main domain root back at `index.html` unless explicitly asked — the waitlist page is the public entry.

**NGINX gotcha (KNOWN):** `sites-enabled/godseye.digitalhustlerx.com` is a **regular file COPY**, not a symlink. You must edit BOTH `sites-available/` and `sites-enabled/` (or copy one to the other) or the live server serves a stale config. `nginx -t` then `systemctl restart nginx`.

ALL nginx configs bind to `62.84.186.1:443` and `[2a02:c207:2319:3150::1]:443` — NEVER use bare `listen 443;`.

After adding a new nginx server block, do a **full restart** (`systemctl restart nginx`), not just reload — the default_server catch-all can override new SNI configs otherwise.

---

## 📊 Git State

```
Remote: git@github.com:digitalhustlerx/GodseyeHQ.git  (origin)
        https://github.com/DigitalHustlerX-Labs/GodseyeHQ.git  (labs)
Branch: main
```

## ⚙️ WORKING PROTOCOL (version safety — READ THIS)

**Consolidate, checkpoint, THEN push. No destructive/live pushes on a whim.**

1. **Always create a checkpoint commit** before any batch of changes: `git add -A && git commit -m "checkpoint: <desc>"`.
2. **Push the checkpoint to origin** so we can always revert to the last good state: `git push origin main`.
3. **Never push straight to the live main page** without reviewing angles/options first when the founder asks to consolidate or choose direction. Analyze, present candidate angle(s), get signoff, THEN apply.
4. **Never edit system files directly via patch/write_file** (nginix config, /etc/*) — those refuse and need terminal/sudo. See the NGINX gotcha above.
5. **Local-first truth:** the waitlist lives in the self-hosted SQLite `data/godseye.db` (track_events for adoption metrics). No third-party analytics for core funnels.
6. If a change is risky/broad, propose it before doing it. Small safe fixes can proceed.

## 📊 LIVE ADOPTION METRICS (self-hosted, local)

- Waitlist count + founder spots: `GET /api/waitlist/stats` → `{count, spotsTotal:100, spotsLeft, pct}`. Real number, never fake it.
- Adoption funnel events: `popup_impression`, `popup_click` logged to `track_events` table in `data/godseye.db` (SQLite).
- Query: `sqlite3 /root/godseye-repo/data/godseye.db "SELECT event,COUNT(*) FROM track_events WHERE event IN ('popup_impression','popup_click') GROUP BY event;"`
- Signups: count in the `waitlist` table.

---

## ❌ Common Mistakes to Avoid

1. **Don't edit files outside `/root/godseye-repo/`** — old copies are scattered everywhere
2. **Don't use `nginx -s reload`** for NEW server blocks — use `systemctl restart nginx`
3. **Don't forget to rebuild** after editing `src/` or `seo-assets/waitlist.html` — nginx serves `dist/` statically; use `./scripts/deploy.sh` (it rebuilds + restores SEO assets + restarts backend)
4. **Don't push without a checkpoint commit first** — always `git add -A && commit && push` so we can revert
5. **Don't show a fake adoption/spots number** — always pull `count`/`spotsLeft` from `/api/waitlist/stats` (real DB)
6. **Don't point the main domain root back to `index.html`** — main domain serves the waitlist page
7. **Don't change the remote** — it's `git@github.com:digitalhustlerx/GodseyeHQ.git`
8. **Don't use Space Grotesk for big headings** — Godseye big headings are **Georgia serif weight 300**; Space Grotesk is only for the wordmark/buttons

---

*End of AGENTS.md — pick up and go.*
