# GODSEYE — BUILD-EXEC-PACK-READY
> **Purpose:** Turn the drafted conversion/restructure plans into one ~90-minute, developer-executable sequence that makes the live site conversion-ready for first customers.
> **Read-only analysis + single markdown file. No src/, dist/, or server.ts modified. No build run.**
> **Source grounding:** `AGENTS.md`, `HANDOFF.md`, `PRD.md`, `drafts/FULL-SITE-RESTRUCTURE.md`, `drafts/GODSEYE-CONVERSION-BLUEPRINT.md`, `drafts/GODSEYE-FREE-ONBOARDING-BLUEPRINT.md`, `drafts/GODSEYE-DOMAIN-FIRST-ONBOARDING.md`, `drafts/BURST-EXEC-PACK.md`, `drafts/PRICING-DRAFT.ts`, plus live `src/` (App.tsx routes, LandingPage, PricingPage, StartPage, Layout, WaitlistModal) and `server.ts` routes.
> **Date:** 2026-08-07

---

## 0. CURRENT-STATE REALITY vs. THE DOCS (read this first — the docs are stale in places)

Two of the AGENTS.md/HANDOFF.md assumptions no longer match the code on disk:

1. **The waitlist gate is GONE from CTAs.** `App.tsx` is now a React Router SPA (56-line route table), not the old `activeView` single-view app. Primary CTA links (`Plug It In →`, `Get My AI Agent →`, `Get started`) all point to **`/start`** or **`/pricing`**. `WaitlistModal` only opens on the landing page when `?ref=` is in the URL (`LandingPage.tsx` L196-198 + L623) — it is **not** intercepting every CTA anymore. Do not spend time "ungating" CTAs; that work is already done.

2. **The pricing model is split in two.** The **lived** model on the site (`PricingPage.tsx` L6-53 + `src/mockData.ts` `PRICING_PLANS`/`CREDIT_PACKS`) sells **credits + WordPress sites** (`$0/$9/$29/$99`, comparison table, "1 credit = 1 command"). The **approved new** model (PRD §4, `PRICING-DRAFT.ts`, Landing teaser L503) sells **an agent by the hour / on retainer** ("from $0.30/day", 1h trial $9, hour packs, monthly hires). Every drafted conversion plan (FULL-SITE-RESTRUCTURE, CONVERSION-BLUEPRINT, BOTH onboarding blueprints) says the same thing: land on **pricing and `/start`**, present **hours + hires**, and make **Telegram the destination** — not a WordPress plugin install. This mismatch is the single biggest conversion leak on the site right now.

Everything in this pack converges the UI to the approved narrative **without** touching `server.ts`, the plugin, or the checkout contract.

---

## 1. #1 SHIP-BY-ITSELF WIN (~15 min) — the single smallest change that most lifts conversion

**File:** `src/pages/StartPage.tsx`
**Block:** the `hero` section (L130-143) — the `<h1>` and the subheading `<p>`.
**Problem:** `/start` (where every gold CTA sends people) presents itself as a **WordPress plugin installation flow**: H1 *"Set up in under 60 seconds."*, subheading *"Three steps to connect your WordPress site to your AI agent."* A first-visit non-technical customer who clicked "Plug It In →" expecting to meet an agent immediately sees WordPress jargon and bounces. This is the single highest-leverage wrong message because it is the exact page every paid CTA lands on.
**Exact change (copy-only, one block, no logic):** replace the hero `<p>` subheading text (L140-142) with a Telegram-first line, and keep the H1. Concretely:

```tsx
<p className="text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
  Your agent is waiting in Telegram. Message @GodseyeXbot, then connect your
  WordPress site — it's optional and takes under 60 seconds.
</p>
```

**Why this ships alone:** zero logic, zero risk, no server/checkout/route impact. It is a pure copy change that reframes the *destination* from "plugin install" to "meet your agent," which is the core narration every draft plan calls for (CONVERSION-BLUEPRINT §10: *"`/start` is a bridge between purchase and Telegram — not a second sales page"*). It can be merged, built, and pushed on its own inside ~15 minutes. (The full 3-step plugin list below it can stay for now; it is optional-value, not first-thought.)
**Merge note:** build with `scripts/deploy.sh` (see §3), not bare `npm run build`.

---

## 2. THE 90-MIN BUILD SEQUENCE

Ordered for maximum momentum: each step is bounded, names the real file + the real change, and delivers a visible/verifiable win before the longer ones. **Momentum rule:** copy/label wins first (instant), then data/structure wins, then the "bridge" pages, then build+push.

### Step 1 — Top banner: stop selling "Private Beta" (~5 min)
**File:** `src/components/Layout.tsx` — `top banner` div (L90-92).
**Change:** text `👁️ GodsEye v2.0 — From Private Beta to Public Release` → `👁️ Hire an AI agent for your business — from $0.30 a day`.
**Why:** FULL-SITE-RESTRUCTURE §Problem D: stale banner contradicts launch readiness. Visible on every page; instant credibility win.
**Touch risk:** none.

### Step 2 — Navigation: remove the two dead links + the mislabeled "Hire" path (~5 min)
**File:** `src/components/Layout.tsx`.
**Change:** in `navLinks` (L72-78) remove the `Templates` entry (`/templates`) and the `Blog` entry (`/blog`). Blog content still exists at `/blog/` for SEO, but a blog link in the *sales* nav sends buyers to content instead of checkout (FULL-SITE-RESTRUCTURE §Problem B: *"/templates and /blog are dead/broken"*; CONVERSION-BLUEPRINT §4: remove Templates + Blog from primary nav).
**Also change (same file):** the golden desktop CTA (L172-177) label `Get started` → `Hire Your Agent →` (label only; keep `to="/start"`). One consistent primary-CTA voice per CONVERSION-BLUEPRINT §2.
**Touch risk:** none — pure JSX links/labels. `/blog` full-page redirect (`App.tsx` `BlogRedirect`) is untouched.

### Step 3 — Pricing: switch the sales model from "credits" to "hours + hires" — data layer first (~20 min)
**File:** `src/mockData.ts`.
**Change:** supersede `PRICING_PLANS` and `CREDIT_PACKS` with the approved `HOUR_BUNDLES`, `MONTHLY_HIRES`, `ADDONS`, `FREE_TIER` from `drafts/PRICING-DRAFT.ts` (L41-207). Keep **existing `polarProductId` values** currently in `PRICING_PLANS`:
- `starter → bc746111-be41-4f7e-8e75-ed3d7eb1e7e3` (already wired; probe-verified live in BURST-EXEC-PACK §1d),
- `pro → a31bba8d-5ef6-4033-93c4-24acdb46a30f`,
- `vps/godmode → b13480b8-f4ae-4051-aa1c-36ac31303ce7`.
**Important:** do **not** delete the shape `PricingPlan` export contract that `Layout.tsx` and `PricingPage.tsx` already import and render from `mockData` — keep exporting a compatible array under a working name, or update those imports in the same commit (Step 4 renders it). **Do not touch `server.ts`; never remove a `polarProductId`.**
**Why:** this is the core convergence FULL-SITE-RESTRUCTURE §PAGE 2 and CONVERSION-BLUEPRINT §3 demand: pricing must match the offer ("hours work / agent on standby", never "credits").
**Touch risk:** checkout contract — only if a `polarProductId` is dropped or mistyped. Preserve them.

### Step 4 — Pricing page: render the new hours + retainer model (~20 min)
**File:** `src/pages/PricingPage.tsx`.
**Change:** replace the body so it presents **two paths** (matches CONVERSION-BLUEPRINT §9 + PRICING-DRAFT):
- **Section A — Buy focused work:** `HOUR_BUNDLES` cards ("1-Hour Trial $9", "10-Hour Pack $69", etc.), each "Buy Now →" calling `(window as any).godseyeCheckout({ id, name, price, polarProductId })`.
- **Section B — Keep an agent on standby:** `MONTHLY_HIRES` cards ("Starter $9/mo", "Pro $29/mo", "VPS/Self-Host $99/mo") — these are the real recurring Polar products.
- Update the header (L104-109) to "Hire by the hour. Or put it on retainer." (already the Landing teaser headline).
- Replace the "credits" FAQ copy (L6-27: *"What counts as a credit?"*, *"Do credits roll over?"*) with the pricing FAQ from CONVERSION-BLUEPRINT §9 Section D (Do hours expire? / switch between hours & monthly? / payment methods? / refunds?).
**Touch risk:** checkout. Every Buy button must pass a **real `polarProductId`** from mockData so `layout.handleCreateCheckout` still reaches `POST /api/create-checkout` with a valid plan. Removing the free/credits comparison table is fine — it is static JSX.

### Step 5 — Landing: give the primary CTA text one clear voice and one destination (~10 min)
**File:** `src/pages/LandingPage.tsx`.
**Change:** hero CTA (L292-294) currently `Plug It In →` → `/start`. Retitle to `Hire Your Agent →` (keep `/start`). Match the `$9` microcopy under it (L300-302) to the new price framing if desired (`No website needed · Cancel anytime`). Leave the four supported hero slides and all sections intact — the restructure's "compress to 7 sections" (FULL-SITE-RESTRUCTURE §PART 3) is a polish pass, not a first-customer blocker; the landing is already close to the approved narrative.
**Touch risk:** none (single label).

### Step 6 — `/start`: finish the Telegram-first reframe (~10 min)
**File:** `src/pages/StartPage.tsx`.
**Change (builds on the #1 win):** reword the three step bodies so Telegram is the primary action and WordPress is optional — reordering is optional; the key is Step 1's body (the "Install Plugin / Message @GodseyeXbot" card, L54-77) leading with **"Message @GodseyeXbot →"** (already present) and de-emphasizing "Install Plugin". Rename step titles to drop "Plugin" framing if it reads as required. Add a post-payment-aware line in the success branch (L165-170) to "Open Telegram — your agent is ready" per CONVERSION-BLUEPRINT §10 State B.
**Touch risk:** none — copy only. Do **not** touch the `download_token` / `/api/plugin-download` logic (L50-52, L159-193); that must keep working for paid plugin buyers.

### Step 7 — Build + deploy with the correct script (~5 min, the only build)
**File:** `scripts/deploy.sh` (run, not edit).
**Change:** run `cd /root/godseye-repo && ./scripts/deploy.sh`. This is the **only** safe build path: it runs `npm run build` (wiping `dist/`) and then **restores** the plugin zip, `token-wrapped.png`, `token-visualization.html`, `token-wrapped.html`, `godseye-tiers.html`, `robots.txt`, `sitemap.xml`, the case-study `.md` proof docs, and the whole `dist/blog/` tree, then restarts `godseye-landing-api`. Verify with `systemctl is-active godseye-landing-api` and the deploy script's own URL checks.
**Touch risk:** this is where everything composes (see §3).

### Step 8 — Push to GitHub (single commit, ~5 min)
**File:** remote `git@github.com:digitalhustlerx/GodseyeHQ.git`, branch `main`.
**Change:** stage the edited files (`src/mockData.ts`, `src/pages/PricingPage.tsx`, `src/pages/StartPage.tsx`, `src/pages/LandingPage.tsx`, `src/components/Layout.tsx`), commit with a clear message, and `git push origin main`. This resolves the 🔴 HIGH item from AGENTS.md/HANDOFF (7+ commits unpushed) and guarantees the rebuilt `dist/` and source are in sync and durable.
**Touch risk:** none to the site. **Push only after a successful `deploy.sh`**, per AGENTS.md "Don't push without rebuilding first — stale dist/ breaks the live site."

**Total: ~80–90 min.** If the 20-min data-layer step (Step 3) overshoots, the copy-only steps (1,2,5,6) still stand alone and can be shipped as-is — they are each individually safe and mergeable.

---

## 3. WHAT MUST NOT BREAK

### 3a. The dist-wipe → deploy.sh restore workflow (**touches Steps 7**)
`npm run build` **wipes `dist/`**. Static organic/SEO assets that vite would destroy live only in `dist/` after a manual restore: `token-wrapped.png`, `token-visualization.html`, `token-wrapped.html`, `godseye-tiers.html`, `robots.txt`, `sitemap.xml`, the three case-study `.md` proof docs, and the entire `dist/blog/` tree. **Never run bare `npm run build`;** always `./scripts/deploy.sh`. This is the exact workflow AGENTS.md §Contract + the task briefing call out. Steps 1–6 are all pure `src/` edits and are invisible until Step 7 runs — so a failed/omitted Step 7 is harmless, but a bare build at Step 7 would silently break `/blog/`, the proof docs, and the PNG. **Rule: Step 7 is the only build, and it must be `scripts/deploy.sh`.**

### 3b. Plugin ↔ backend contract routes (**touches Step 3 only — via data**) — `server.ts` untouched
`server.ts` keeps the contract routes (verified present): `POST /api/sites/connect` (L1062), `POST /api/sites/verify` (L1097), `GET /api/referral/link` (L574). **None of these steps edits `server.ts`.** The only way Step 3 could break them is indirectly — and it cannot, because Step 3 edits `src/mockData.ts` only. Also preserve the live checkout chain used by `Layout.handleCreateCheckout`: `POST /api/create-checkout` (L851) → Polar `checkout_url` → `POST /api/polar-webhook` (L938) → `GET /api/plugin-download` (L1108). Keep every `polarProductId` value as-is in Step 3 or a plan's Buy Now button will 400 at checkout.

### 3c. WaitlistModal (**touches Steps 2, 5 — only labels/nav, not the modal**)
`WaitlistModal` (`src/components/WaitlistModal.tsx`) still posts to `POST /api/waitlist` and reads `GET /api/waitlist` + the referral token, and is conditionally rendered only on `LandingPage` when `?ref=` is present (L196-198, L623). **None of the steps removes or re-blocks it.** Do not add a global gate in front of CTAs (the plans' older "soft gate" wording is now obsolete — resetting it would *worsen* conversion). Keep `ref=` triggering intact so referral attribution still works.

### 3d. Polar checkout (**touches Steps 3, 4**)
Checkout rendering is gated on a **valid business profile + enabled payouts** on the Polar dashboard — flagged as an unresolved human check in BURST-EXEC-PACK §4E. A UI change cannot fix that, but a UI change can break the *button→product* mapping: ensure the Buy buttons in Step 4 pass `polarProductId` for the Starter/Pro/VPS products (recurring). Do not display a price that does not match a real Polar product (CONVERSION-BLUEPRINT §18: "Do not show a price unless the checkout product matches it exactly").

### 3e. `/blog` redirect + `activeView` — no longer applicable
`App.tsx` routes `/blog` through `BlogRedirect` to the static tree; Step 2 removes the nav *link* but must not touch that route. The old `activeView` single-file structure in AGENTS.md is obsolete — do not "fix" App.tsx toward it.

---

## 4. ONE METRIC TO WATCH AFTERWARDS

**Checkout-CTA → paid conversion on `/pricing` and `/start` (measure "Buy Now"/`godseyeCheckout` clicks that resolve to a paid Polar webhook), week-over-week.**

Concretely: instrument the `(window as any).godseyeCheckout` call sites (Steps 3–4) to fire an analytics event on click, and count distinct payments in the Polar webhook handler vs. those start events. The single number that proves the restructure worked is **checkout-initiation rate from the paid CTAs** (Buy Now / Hire buttons) — because Steps 1–6 all exist to remove the friction between "I want an agent" and "I reached a real checkout." If that number rises while page-CTA clicks hold steady, the Telegram-first + hours/hires convergence is doing its job. (Secondary, fallback sanity check: % of visitors on `/pricing` who scroll to any Buy button — the "credits" comparison table currently scares off the target audience.)

---

## 5. OPEN DECISION THE OWNER MUST MAKE BEFORE THIS SHIPS

**Adopt "hours + agent-on-retainer" as the ONE pricing model site-wide** — i.e., approve replacing the live "credits + WordPress sites" pricing (mockData `PRICING_PLANS`/`CREDIT_PACKS`, PricingPage FAQ, comparison table) with the `PRICING-DRAFT.ts` hourly/retainer model (`$0.30/day` framing, 1h trial $9, 10/50/100h packs, Starter $9/mo / Pro $29/mo / VPS $99/mo).

Every drafted plan (FULL-SITE-RESTRUCTURE, CONVERSION-BLUEPRINT §3+§18, both onboarding blueprints) already recommends this, and the landing page teaser already *says* it ("Hire by the hour. Or put it on retainer.") — but `/pricing` still *sells* credits/WordPress. Because Steps 3–4 re-render the entire pricing surface, this is a **judgment call only the owner can OK** (pricing = revenue model). It also carries one downstream pricing action outside this pack: **hour bundles / add-ons have no Polar products yet** — only the three recurring plans have `polarProductId`. Until the owner assigns product IDs to the hour bundles (or chooses to surface only recurring plans first), those "Buy Now" buttons cannot resolve. Owner decision: **lock the model and the hour-bundle→Polar product mapping** before Step 3, or scope Step 3 to render only the three recurring plans that are already purchasable.

---

*End of BUILD-EXEC-PACK-READY. Read-only plan — no src/, dist/, or server.ts modified; no build run.*
