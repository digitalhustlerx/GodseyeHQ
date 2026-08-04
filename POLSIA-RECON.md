# POLSIA RECON — synthesis blueprint for Godseye
> Research date: 2026-08-03 · Source: polsia.com + blog + about + terms + subprocessors (live recon, browser)

**What called was "polsia.ai" → actual company is POLSIA.COM.** (`polsia.ai` redirects to `polsia.com`; `www.polsia.ai` is a separate Render app. `procia.ai` does NOT resolve — dead domain.)

---

## 1. THE PITCH (one-liner they win with)

**"Polsia — AI That Runs Your Company While You Sleep."**

Supporting lines:
- **"NEVER HIRE AGAIN"** — "You're a founder, or you should be. Polsia is your first employee. Never sleeps. The solo founder's standing army."
- **"Polsia is your team"** — plans roadmap, ships code, runs ads, replies to customers, closes deals, posts tweets. "One name. Every role."
- **"Start a company tonight"** — NO CREDIT CARD REQUIRED · FREE TO START.

Positioning = **an AI employee/cofounder, not a tool.** They deliberately frame it as hiring a human, not subscribing to software. This is the emotional core: replace the fear of staffing/ops with "hire the standing army that never sleeps."

---

## 2. FOUNDER & ORIGIN (Ben Cera — the persona engine)

- Full name **Victor-Benjamin, goes by Ben Cera**. Wrote the About page as a first-person monologue ("my name is Victor-Benjamin, everybody calls me Ben"). Lives Paris/LA/SF.
- Story: At 38-39 (~2024-25) built apps with AI in **~2 hours each, "7-8 apps,"** staying up all night writing code with AI. Believed the future = "make products think for themselves."
- Realized he already knew the **Agent SDK** → ran **agents in loops, connected MCPs, synced to production apps** → that became Polsia.
- Founding creed: "Once you free your mind about what it means to build a company 'the right way,' you can do whatever you want. Nobody told me what to build."
- **Company:** Polsia, Inc., 556 Sutter St, San Francisco. Inc'd, has Terms/ToS/AUP/Arbitration + DMCA agent (real legal scaffold).

**Lesson for Godseye:** the founder IS the brand. First-person product voice ("Hi. It's Polsia.") is the entire marketing engine. Not corporate — a living entity talking to you.

---

## 3. THE PRODUCT & HOW IT BEHAVES

### Core model: **God Mode** = autonomous agent work sessions.
- You set a **timer (1 hour → 7 days)**. Polsia plans a task, does it, plans the next, keeps looping until timer ends or you stop it.
- **No check-ins, no "what should I do next." Just work on a loop.**
- You can: **pause anytime**, **steer it in chat** ("if I'm chasing the wrong thing, say so — I'll adjust and keep going"). "God Mode means I stop waiting — not that I stop listening."
- Physical dashboard tasks exist (drag-and-drop: "You can now physically grab tasks and move them around").

### What it does for you (multi-role team):
1. **Plans your roadmap**
2. **Ships your code** (GitHub integration, repository automation)
3. **Runs your ads** — Meta Marketing API: creates campaigns, ad sets, individual ads; **generates AI images/video creatives** (Sora 2, Fal.ai); manages budgets; **auto-pauses if payment fails or policy issue**; Pixel/CAPI for attribution
4. **Replies to customers** (Postmark inbound email)
5. **Closes your deals** (cold outreach / follow-through)
6. **Posts your tweets** (Late.dev social posting/scheduling)
7. Browser automation for anything else (Browserbase cloud browser)

### Scale (marketing numbers, live counter):
- Homepage: **"WATCH POLSIA WORK ON 15,1XX COMPANIES LIVE →"** — real-time counter that ticks (14k → 15,109 across my session) = projected active companies.
- Blog: **"1.5 million tasks executed across 6,500 companies"** (Apr 20, 2026).
- **"3,000 hours of God Mode bought in 7 days"** (Apr 16, 2026).
- Goal stated by founder: **100,000 companies running on Polsia at once.**

---

## 4. PRICING — HOW THEY'RE "AFFORDABLE BUT PROFITABLE" (THE KEY SECTION)

### God Mode pricing (from blog):
> "The more time you give me, the less I cost per hour. **$19 for an hour. Under $6/hr if you let me run for a week.** Bulk discount on focus."

**The model = pay-per-hour of autonomous agent time, with volume discount on commitment.** Same "hiring an employee" frame → but priced in hours, so it feels like paying a freelancer an hourly rate, low barrier ($19 to try).

### Free tier:
- "**NO CREDIT CARD REQUIRED · FREE TO START**" — frictionless, zero-CC onboarding is a headline feature.

### Referral program:
- Referral credits for referring users ("referred users receive credits or other incentives"). Growth loop baked into billing.

### Revenue moat (the profitability engine):
1. **Agent-hours at $6-19/hr** — but their real COGS drops via **cheap/fallback LLM routing**. Their own words: "every hour you buy is an hour I'm thinking, and thinking costs money. I've been testing different brain models, **including open-source ones**, to figure out which is sharpest, fastest, and cheapest." → They arbitrage model costs (Anthropic primary, AWS Bedrock fallback, open-source) to widen margin per paid hour.
2. **Meta ad management** — they pass ad SPEND through to Meta, charged **daily via Stripe** ("daily ad spend charges"). So the platform itself plus margin rides on top of ad spend, and customers fund their own customer-acquisition. This is the flywheel: they run ads for you to get YOUR customers; they bill you the ad spend + their management fee.
3. **SaaS subscriptions/billing portal** (Stripe) for recurring platform.

### Tech stack profitability levers:
- **Render** for hosting (cheap PaaS), **Neon Postgres** + **Redis** (serverless/cheap at idle), **Cloudflare R2** (objects), **Expo** (mobile builds), **Sentry**. All-low-CAPEX modern infra. Only heavy spend = LLM inference + Media gen + Browserbase, all usage-based.

---

## 5. FULL TECH STACK (from subprocessors page — blueprint to copy)

**Hosting/DB:** Render · Neon (PostgreSQL) · Redis (queue/pub-sub) · Cloudflare R2 (media) · Expo (mobile app)
**AI brains:** Anthropic (primary LLM) · AWS Bedrock (fallback/routing) · OpenAI (incl. Sora 2 video) · Fal.ai (video/image/audio gen)
**Autonomy/connectivity:** Browserbase (cloud browser automation) · GitHub · Google OAuth/Gmail · Slack · Late.dev (social posting)
**Ad engine:** Meta Marketing API + Meta Pixel/CAPI (campaigns, creatives, budget, attribution)
**Ops/mail:** Postmark (transactional/inbound email) · Hunter.io (email verification)
**Payments:** Stripe (checkout, subscriptions, billing portal, daily ad-spend charges)
**Reliability:** Sentry (errors) · IPinfo (geolocation)

---

## 6. GAPS / OPPORTUNITY FOR GODSEYE (what Polsia does NOT do)

- **NO TELEGRAM onboarding.** Their funnel is: web lander → Google OAuth / email login → web dashboard. Support = email. Integrations = Slack, not Telegram.
- Product voice is strong (email "Hi, it's Polsia"), but **not** embedded in a chat-first messenger channel for onboarding/first-touch.
- No obvious phone-number/WhatsApp/Telegram payment-link flow.

**→ This is exactly the wedge Digital Viking called:** Godseye = the same "AI that runs your company" model, but **onboarded through Telegram** — commands, and **easy payment links** inline. That's a differentiated front-end + acquisition channel Polsia doesn't occupy.

---

## 7. SYNTHESIS BLUEPRINT FOR GODSEYE (Telegram-first clone/improvement)

### Positioning
- Adopt the **"hire an AI employee, not subscribe to software"** frame: "Never hire again / Your standing army."
- Founder-persona voice (like "Hi, it's Polsia") instead of neutral SaaS copy. Give Godseye an identity that "speaks" to the user.
- Live-proven scale play: a **live company/task counter** on the homepage = instant social proof.

### Pricing (mirror + own it)
- **Free to start, no CC** → frictionless Telegram first message.
- **Pay-per-hour God Mode**: $19/hr, ~$6/hr on week-long commit. *Godseye twist:* sell via **prepaid hour-bundles** (e.g. 10/50/100hr packs) → better margin capture & less churn than pure metered.
- **Referral credits** for growth.
- **Ad-management pass-through** (Meta/Google) charged on top — the share-of-ad-spend revenue line.
- Model-routing / open-source fallbacks to crush cost-per-hour → profitable at low price.

### Telegram onboarding (the build the user asked about — later phase)
1. `/start` → persona intro + value pitch (no-wall, no CC).
2. `/new` (or "start a company") → guided command wizard: name idea → picks niche → builds roadmap.
3. `/work [hours] [task]` → dispatch God Mode timer session, pay-per-hour.
4. **Inline payment links** — generate a Stripe checkout link right in chat for bundles (`/buy 50h` → pay link). No leaving Telegram to start.
5. `/status` → task queue / what's running / hours left.
6. `@mentions`/steering in-chat ("stop", "change direction") — the "steer me in chat" loop Polsia uses, done natively in Telegram.
7. Bring-your-own connectors: GitHub, Meta Ads, email, social — all steered from Telegram commands.

### Recommended Godseye stack (copy Polsia's, Telegram-first)
| Layer | Pick |
|------|------|
| Hosting | VPS already owned (62.84.186.1) — cheaper than Render → better margin |
| DB | SQLite/Postgres local (LOCAL-FIRST per user) |
| LLM | Model-routing: primary + open-source fallback (cost arbitrage) |
| Autonomy | Terminal + browser-exec on VPS; Telegram Bot API as the control plane |
| Payments | Flutterwave (user preference) or Polar — generate inline checkout links |
| Ads | Meta Marketing API pass-through (the shared-revenue line) |
| Email | Postmark-class transactional |
| Monitoring | Sentry-class |

---

*(This recon file lives at /root/godseye-repo/POLSIA-RECON.md.)*
