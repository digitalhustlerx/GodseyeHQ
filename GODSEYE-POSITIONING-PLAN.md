# GODSEYE — POSITIONING & BUILD PLAN (v1 — DRAFT FOR APPROVAL)

> **Status:** DRAFT — NOTHING edited yet. Every page/write-up change below ships only after your OK.
> Author: Hermes · Date: 2026-08-03 · Source: your brief + Polsia recon + Godseye current state (PRD/mockData).

---

## 0. THE ONE-LINE (what we're building)

**Godseye = your company running on autopilot, and you steer it from Telegram.**
One agent you hire that spins up more agents to run your business, build your ideas, or work beside you. WordPress is one thing it supports — not the thing it is.

---

## 1. THE POSITIONING SHIFT (same product, new frame)

### What it is NOW (PRD line):
> "WordPress, managed by AI. No more logging into wp-admin for routine tasks."

### What it becomes:
> "Hire one agent. It spins up the agents that run your company — sites, stores, content, leads, ads — all steered from Telegram."

**Rule you set — hold me to it:** **Godseye *supports* WordPress**, it is not *built around* WordPress. WordPress stays the anchor/onboarding wedge (huge existing market, easy first value), but the offer widens to *running your business*, not *managing a website*.

**Frame swap (you called this).** NOT "hire a human who sleeps / costs a salary / has attitude." Instead:
> **You're paying for ONE agent that can spin multiple agents** — to stand by, start your business, run your business, support you, build your ideas, or work with you. It can even be plain old a personal assistant.

### Why this sells to a normie (and to an AI):
- It's one easy decision. One hire. One payment. Low fear.
- "Spin up agents" already *literal* for devs/AI-literate people — they get it instantly.
- For normies it reads as: *"I pay one thing and my business basically runs; it's on standby for me; I talk to it in Telegram like a person."*

---

## 2. THE PRODUCT — MODES, NOT FEATURES

Your thesis, restated so we're aligned: **There are no moats in features. The moat is branding + distribution + onboarding.** Everyone can build an agent. Almost nobody makes it *feel like starting a business with someone on standby*.

### So the package is a **starter kit** ("hire the agent, it comes with everything it needs"):
When someone hires Godseye, the backend isn't a static app — it's us **configuring a specific set of agents, instructions, controls, and cron jobs** for what they chose. That's the real "onboarding" (later section).

### Mode examples (the "hires" you buy):
| "Hire" | What the spun-up agents do |
|--------|--------------------------|
| **Standby Assistant** | Personal/business assistant, always on, steered in chat |
| **WordPress Operator** | Your site/store — posts, WooCommerce, plugins, health, edits (Android anchor) |
| **Content & Social** | Writes + posts across platforms (Late.dev-class scheduling) |
| **Lead Generator** | Searches the web for qualified leads, fills your pipeline |
| **Ad Runner** | Meta/Google campaigns, budget, creatives, auto-pause on failure |
| **Support Rep** | Replies to customers (email/chat) |
| **Deal Closer** | Cold outreach + follow-through |
| **Scheduler/Operations** | Handles cron jobs, reminders, recurring tasks |

**Lead-gen in particular** — you flagged this: DigitalHustlerX Money Scanner already has lead-gen agent logic. That's proof the "spin up an agent to SEO for leads" dimension is real and we already own a piece of it.

All of these = **the same engine**. One brain, N job-cards. That's how "another client is just the same thing" works and why costs stay low.

---

## 3. PRICING — THE PART WE MUST GET RIGHT

### Your directive:
- **$9 is the entry.** Good. Keep that as the hook.
- We have to know the **real economic cost of running one client's full setup**, then optimize knowing a 2nd client costs ~nothing extra (same infra, more agents).
- Use **open-source / cheaper models (DeepSeek-class) + model routing** to crush cost-per-agent-hour → affordable AND profitable.
- **Do NOT go "bring-your-own-keys" as the main model** — you're right, it destroys the business (no margin if they bring their own API keys). BYOK is only a *premium* option on the VPS/self-host tier, where we're selling the setup, not the tokens.

### My proposed model (mirror Polsia's structure, our framer):

**A. HOURS (the real engine — like Polsia's "God Mode" but branded as hiring)**
Buy agent-hours. The agent runs a loop on your chosen task and spins sub-agents as needed.
- Volume discounts on commitment: more hours = cheaper/hr.
- This is how someone "buys 20 hours" and gets something real (see Section 4).

**B. MONTHLY PLAN (the easy hook — keep current tiers)**
Keep the existing credit-within-subscription frame but rename toward "hiring":
- **Starter $9** — 1 hire standing by (e.g. WordPress Operator). Keeps the $9 entry.
- **Pro $29** — multiple hires + lead-gen + social.
- existing God Mode $99 → becomes the **VPS / self-host unlimited** premium tier (BYOK makes sense HERE, not on cloud).

**C. HOUR BUNDLES + ADD-ONS (upsell on first purchase)**
This is the money lever you asked for ("detailed add-ons people don't think of"):
- Refundable top-up / extra hours
- **Infrastructure add-ons**: a hosted VPS slot, custom domain DNS, site migration, extra site seats
- **Pre-set agent packs**: "Already-built" presets people don't know they need (e.g. *Store-Bot for WooCommerce*, *Content Calendar Bot*, *Lead-Finder*)
- Buy them as line items at signup → average order value up without raising the headline price.

---

## 4. ANSWERING THE "$20 HOURS" QUESTION (the real gap you caught)

> "Someone just comes and buys 20 hours — what do they really get? How do they plug into their business?"

This is the part Polsia's hype hides and we must make concrete, or we get refunds/confusion.

**When you "hire" Godseye for hours, the agent takes over a SPECIFIC job and works a loop.** Real outcomes:
- **Give it a domain/job** (e.g. "run my blog + social"): it picks the task, does it, plans the next, iterates until the timer ends or you steer it. Not "20 hours of vague chat" — 20 hours of a specific recurring job running.
- **Deliverables are real files/actions**, not talk: drafted posts, a redesigned page, a filled lead list (CSV), a Meta campaign launched, site edits applied.
- **"Get the domain managed on Godseye and that's it"** — you said the retention hook is getting the *domain/site permanently managed*. So: hours = the trial/toehold; the *managed recurring job on your domain* = what holds people. Cheap to run (cron + same infra), high retention.

**So the pitch sequence is:**
1. **Buy hours** (low effort, $9+ to try) → see real deliverables fast.
2. **Get your domain managed** (recurring, the hook that keeps them) → steady revenue.
3. **Add more hires** (spin up agents: leads, ads, social) → expanding revenue.

---

## 5. BRAIN ARBITRAGE & OPEN SOURCE (your strategy, confirmed)

**On "brain arbitrage" — you weren't wrong, they just phrased it grandly.** Polsia means: *the model running each paid hour costs real money, so they route to the cheapest capable brain (incl. open-source/Chinese models) to widen margin.* That IS what you're already doing with OpenCode + DeepSeek-class. We're not at a disadvantage — we run the same play, arguably cheaper on our own VPS.

**Your deeper move (I rate it): open-source as a loss-leader that wins.**
- **There is no edge in models anymore** — everyone's everyone's competitor. You said it, and it's correct.
- **Open-sourcing Godseye's guts doesn't lose, it outpaces.** Competitors can steal the code — they can't copy your onboarding, psychology, marketing, or distribution. Those stay private in your repo.
- **Profit even on the open-source users via embedded referral links** (e.g. an OpenCode/AI-subscription ref link) — you get a cut of whoever they bring. "You can't get an agent without this thing — unless you go full self-host on your own server, which is the high-level add-on."
- **Closed-source**: the strategy, the onboarding flow, the psychology, the dashboard logic. **Open-source**: how to get started, documentation, the agent foundations, the "splatter referral links everywhere."

---

## 6. TELEGRAM ONBOARDING — THE COMMAND FLOW (initial draft for approval)

This is the differentiator (Polsia has NO Telegram). First-person, zero web friction, payment links inline. Draft commands to send the official bot:

| Command | What it does |
|---------|-------------|
| `/start` | Warm welcome. "I'm your agent. I can spin up a team to run your site/business — from here." + 3 buttons (Hire me · See modes · Free trial) |
| `/hire [mode]` | Sets up that hire (WordPress, Content, Leads, Ads, Assistant...). Guided 2-3 question wizard. |
| `/work [hours] [task]` | Starts a work loop on a task. *e.g.* `/work 5 "fill my lead pipeline with NFT marketers"` |
| `/buy [plan\|bundle]` | **Inline payment link** right in chat. *e.g.* `/buy 20h` → Stripe/Flutterwave checkout link, never leaves Telegram. |
| `/status` | What's running, hours left, queue. |
| `/agents` | List your spun-up agents + add more. |
| `/keys` | (On VPS/self-host tier only) bring-your-own-keys. |
| steering | In-chat steering always works: "stop", "change that to X", "faster". Godseye stops waiting, not listening. |

**Free trial** = first 50 credits / few hours free, no card → the freemium funnel (already in the plan: `Free $0 · 50 credits`).

---

## 7. OPEN QUESTIONS FOR YOU (so I don't guess)

1. **Anchor mode:** launch with Godseye = "WordPress Operator + Assistant" (uses our existing plugin/anchor), and offer the other modes as announced/coming? OR full menu now?
2. **WordPress anchor naming:** keep "Godseye" flat across all modes, or introduce mode sub-brands (e.g. the Operator is still just Godseye)?
3. **Hours vs credits:** keep the current credit system for WP actions AND add hour-bundles, or standardize everything on hours? (I lean hours as the single unit — simpler to explain, matches "hiring.")
4. **The 20-hours deliverable:** confirm Section 4's framing (hours = jobs done, not vague chat) so I write the landing copy accordingly.
5. **Pricing numbers** for hour bundles (e.g. $9 intro · $X/5h · discount/20h · more discount/100h) — I have a proposal, but you asked to nail the unit economics first. Do you want me to model that cost on paper (costs of OUR stack per agent-hour) before committing numbers?

---

## 8. WHAT I WON'T TOUCH UNTIL YOU APPROVE (explicitly)

- No edits to `src/`, `mockData.ts`, `PRD.md`, or any landing-page copy.
- No new pages, no new commands wired into the bot.
- No pricing changed live.
- This document is the contract. You approve section-by-section; I only touch what you green-light.

---

*Next: tell me which of the 5 open questions to lock, and which section(s) you approve. I hold here — nothing destructive.*
