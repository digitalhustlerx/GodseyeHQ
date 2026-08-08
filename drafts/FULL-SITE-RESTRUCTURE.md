# GODSEYE — FULL SITE RESTRUCTURE DRAFT
> Every page. Every click path. Every section. Nothing changed until you approve.

---

## PART 1: THE PROBLEMS (what's broken right now)

### Problem A: The landing page repeats itself 4-6 times
"From Telegram" appears 6x. "Never sleeps / 24/7" appears 5x. "Clients, content, orders" appears 4x. People tune out.

### Problem B: The pages don't connect
- Landing page says "Plug It In →" but sends you to `/start` which is a Flutterwave payment+download flow for a WordPress plugin — completely different experience from what the copy just sold.
- Features page (`/features`) is 100% WordPress-focused ("WooCommerce", "wp-admin", "plugin conflict") — contradicts the new "business agent" positioning.
- Pricing page (`/pricing`) still talks about "credits" — contradicts the landing page which now says "hours" and "hire".
- Docs page (`/docs`) is a WordPress plugin install guide — doesn't match "just talk to it in Telegram."
- Nav has `/templates` and `/blog` links that go to dead/broken pages.
- Nav has an "Agents" dropdown (Lead Gen, Chief of Staff, Home & Life) that may or may not have real pages.

### Problem C: The checkout flow is disconnected
1. User reads landing page → clicks "Plug It In →"
2. Lands on `/start` → sees Flutterwave payment form + plugin download
3. No bridge between "hire an agent" (the pitch) and "buy a plugin" (the reality)
4. User gets confused: "I thought I was hiring an agent, why am I downloading a plugin?"

### Problem D: Top banner is stale
"👁️ GodsEye v2.0 — From Private Beta to Public Release" — old messaging, contradicts new positioning.

---

## PART 2: THE FIX — UNIFIED NARRATIVE FUNNEL

### The golden rule:
**Every page, every section, every button must pull the user toward ONE action: hiring an agent.** No page exists in isolation. Each one feeds the next.

### The conversion funnel (user journey):

```
LANDING (/)
  "Hire an agent" pitch
  ↓ clicks "Plug It In →" or "See Pricing"
  ↓
PRICING (/pricing)
  Hours + monthly hires, side by side
  ↓ clicks "Hire Starter" or "Buy 10h"
  ↓
CHECKOUT (modal or /start simplified)
  Email → Polar checkout → paid
  ↓ redirected after payment
  ↓
ONBOARDING (/start after payment)
  "Open Telegram. Your agent is waiting."
  → Links to @GodseyeXbot
  → If they have WordPress: shows plugin install steps
  → If they don't: skips straight to Telegram
  ↓
TELEGRAM BOT
  Agent creates group → deploys → starts working
```

**Every other page supports this funnel, never distracts from it:**

```
/features → "Here's what your agent can do" (deep-dive, convinced them to go to /pricing)
/docs → "How to connect your site / use commands" (for existing users, post-purchase)
```

---

## PART 3: PAGE-BY-PAGE REWRITE SPEC

### PAGE 1: LANDING (`/`) — COMPRESSED FROM 12 → 7 SECTIONS

#### Section 1: HERO (4 slides, not 5 — cut the Power slide, merge into fleet)

**Slide 1 — SIMPLICITY**
Badge: IT'S JUST A CHAT
H1: It's just another chat on your phone.
H2: That runs your entire business.
Body: You already know how to chat. This is the same thing — except the person on the other end is your AI agent. You tell it what you need. It does it. No website required. No computer required.
*(Cut: "Clients, content, orders, analytics" — that's the use-case section's job.)*
*(Cut: "Just plug your domain in and start" — premature, that's the how-it-works section.)*

**Slide 2 — RELIEF**
Badge: NEVER GETS TIRED
H1: You're tired of doing everything yourself.
H2: Here's someone who never gets tired.
Body: The replies. The follow-ups. The content. The admin. Your agent takes all of it — works 24/7, and handles the load you've been carrying alone. It learns how you like things done and gets better every day.
*(Cut: "lives in your Telegram" — already established in slide 1.)*

**Slide 3 — GREED**
Badge: LESS THAN A PHONE BILL
H1: Everything your business needs.
H2: For less than a phone bill.
Body: It manages your clients. Posts your content. Tracks your orders. Reads your numbers and explains them in plain English. Hiring one person costs thousands. This costs $9. And it works 365 days a year.
*(Cut: "lives in your Telegram" again.)*

**Slide 4 — BELONGING**
Badge: REGULAR PEOPLE USE THIS
H1: Regular people are running businesses
H2: with an AI agent in their pocket.
Body: Not coders. Not tech bros. Lash techs, hairstylists, shop owners, consultants. People who were drowning in the business side. They hired an agent. Now they focus on their craft. The agent handles the rest.

*(Slide 4 POWER is DELETED — merged into Section 5 fleet reveal.)*

CTA buttons (all slides): **"Hire My Agent →"** (links to /pricing) + **"How It Works"** (scrolls to section 3)
Microcopy: "No website required · Just Telegram · Cancel anytime"

---

#### Section 2: "WHAT DOES IT HANDLE?" (6 cards, COMPRESSED — icon + title + ONE line only)

Heading: What does it handle?
Subtext: Point it there. It starts immediately.

| Icon | Title | ONE line (no body paragraph) |
|------|-------|------|
| 📱 | Clients | Replies, bookings, reminders, follow-ups — handled. |
| 📸 | Social | Posts your work, writes captions, schedules, tracks engagement. |
| 📦 | Orders | Processes orders, updates products, manages stock — from a chat. |
| 🧾 | Admin | Files, invoices, receipts, reminders. Nothing falls through the cracks. |
| 📊 | Numbers | Ask a question. Get a plain-English answer about your business. |
| 🛡️ | Watching | Monitors 24/7. Fixes problems before they cost you. |

*(Cut: the body paragraph from each card — it repeated the hero copy. One punchy line per card.)*

---

#### Section 3: "HOW IT WORKS" (3 steps, COMPRESSED)

Heading: How it works
Subtext: Three steps. Under 60 seconds.

Step 1: **Plug your domain in** — Got a website? Connect it. Don't have one? Skip this. Your agent works from Telegram alone.
Step 2: **It sets up your space** — Creates a group chat for your business, organized into sections. Deploys the right agents. Gets to work.
Step 3: **Just talk to it** — Text it like a person. Tell it what you need. Approve its suggestions. That's it.

*(Cut: "Takes 30 seconds" / "Automatic" / "That's it, you're running" microcopy — unnecessary padding.)*
*(Cut: "24/7, 365" from step 3 — already in hero.)*

---

#### Section 4: "IT THINKS AHEAD" (nudges — UNCHANGED, this is the differentiator)

Heading: It doesn't just answer.
Subtext: It thinks ahead.

4 nudge bubbles (unchanged):
- "Your top product got 40 new views today. Want me to run a 10% promo?"
- "Sarah booked 3 weeks ago and hasn't been back. Reminder with a discount?"
- "Your last 3 posts got 2x engagement. I drafted 3 more in that style."
- "Store traffic dropped 20%. Your homepage is slow. I can fix it now."

Closing line: "You approve. It's done."

*(This section stays exactly as-is. It's the strongest differentiator.)*

---

#### Section 5: "SPAWN MORE AGENTS" (fleet + power concept MERGED)

Heading: Start with one. Spawn more when you grow.
Subtext: Your agent brings in help when the workload demands it.

6 agent cards (unchanged): Content Writer, Social Manager, Lead Finder, Support Rep, Analyst, Security Watch.

Closing line: "You're the boss. They're your team."
*(Cut: "They work inside your group chat. Report back to you. Coordinate with each other. All from Telegram." — redundant.)*

---

#### Section 6: "WHO IS THIS FOR?" + COST (MERGED into one section)

Heading: Built for anyone who runs anything.
Subtext: One agent replaces all of this.

**Left: 5 audience cards (COMPRESSED — icon + title + quote only, no body)**
- 🧑‍🎨 Craftsperson — *"I do lashes. I don't do spreadsheets."*
- 💼 Solopreneur — *"I'm a one-person army."*
- 🏪 Store Owner — *"I sell things. Online and off."*
- 🏢 Agency — *"I manage multiple clients."*
- 💻 Developer — *"I want to self-host."*

*(Cut: body paragraphs — they repeat use cases.)*

**Right: Cost comparison table (COMPRESSED — 4 rows not 6)**
| What you pay for now | Cost | With Godseye |
|---------------------|------|-------------|
| Virtual assistant | $200-500/mo | ✓ Included |
| Social media tools | $15-50/mo | ✓ Included |
| Analytics + support tools | $25-130/mo | ✓ Included |
| **Total** | **$240-680/mo** | **$9-29/mo** |

*(Merged from 6 rows to 4 — tighter, same impact.)*

---

#### Section 7: PRICING + CTA + FAQ (MERGED into one closing section)

**Pricing cards** (3 plans, unchanged from current):
Starter $9 · Pro $29 · VPS $99
+ Hour bundle chips: 1h $9 · 10h $69 · 50h $249 · 100h $399

**CTA** (immediately below pricing):
"Hire My Agent →" → links to /pricing for full checkout

**FAQ** (CUT from 10 → 5 — only the ones that block conversion):
1. Do I need a website? → No.
2. Do I need to be technical? → No. It's just a chat.
3. How is this different from ChatGPT? → ChatGPT talks. Godseye does.
4. Is my data safe? → Yes. Self-host option available.
5. Can I cancel anytime? → Yes. No contracts.

*(Cut 5 FAQ questions that were nice-to-have but didn't block purchase.)*

---

**NET RESULT: 12 sections → 7. Each says ONE thing once. Zero redundancy.**

---

### PAGE 2: PRICING (`/pricing`) — REWRITE TO MATCH NEW MODEL

**Problem now:** Still says "credits" everywhere. Contradicts landing page.

**New structure:**

#### Hero: "Hire by the hour. Or put it on retainer."

#### Section A: Hour Bundles (primary — the "try it" path)
| Bundle | Price | $/hr | Best for |
|--------|-------|------|---------|
| 1-Hour Trial | $9 | $9.00 | "Try it tonight" |
| 10-Hour Pack | $69 | $6.90 | "One project done" |
| 50-Hour Pack | $249 | $4.98 | "Ongoing operations" |
| 100-Hour Pack | $399 | $3.99 | "Agency / power user" |

Each card: **"Buy Now →"** → triggers checkout modal (Polar)

#### Section B: Monthly Hires (recurring — the "keep an agent" path)
| Plan | Price | Agents | Hours included |
|------|-------|--------|---------------|
| Starter | $9/mo | 1 | 5 hours |
| Pro | $29/mo | 3 | 20 hours |
| VPS / Self-Host | $99/mo | Unlimited | BYOK |

Each card: **"Hire →"** → triggers checkout modal (Polar)

#### Section C: Add-ons strip
"+5 hours ($35) · Site migration ($49) · Agent packs ($29) · Domain setup ($19)"

#### Section D: FAQ (pricing-specific, 4 questions)
1. Do hours expire? → No. Ever.
2. Can I switch between hours and monthly? → Yes, anytime.
3. What payment methods? → Card via Stripe (Polar). More coming.
4. Refunds? → If it doesn't work, we refund. Simple.

#### Section E: CTA
"Not sure? Start with a 1-hour trial for $9. No commitment."

---

### PAGE 3: FEATURES (`/features`) — REWRITE FROM WP-SPECIFIC → GENERAL

**Problem now:** 100% WordPress language ("WooCommerce", "wp-admin", "plugin conflict"). Contradicts landing page.

**New structure:**

#### Hero: "Here's what your agent can do."

#### Section A: The 6 core capabilities (SAME as landing Section 2 but expanded)
Each card gets a real example:
- 📱 Clients → "Reply to Sarah's booking request and confirm Tuesday 2pm"
- 📸 Social → "Post my latest lash set on Instagram with a caption about summer trends"
- 📦 Orders → "Show me today's orders and flag anything that needs shipping"
- 🧾 Admin → "Organize my invoices from last month and remind me about the overdue one"
- 📊 Numbers → "How's my store doing compared to last month?"
- 🛡️ Watching → "Check if my site is healthy and fix anything broken"

#### Section B: "It thinks ahead" (reuse the nudge section — proven strong)

#### Section C: "Spawn more agents" (reuse the fleet section)

#### Section D: Integrations grid (where WordPress lives)
🌐 WordPress · 🛒 Online Store · 📊 Analytics · 📧 Email · 🐦 Social · 💬 Support · 🔌 MCP

#### Section E: Privacy callout
"🔒 Self-host on your own VPS with your own keys."

#### Section F: CTA → "See Pricing →"

---

### PAGE 4: START (`/start`) — SIMPLIFY INTO 2 PATHS

**Problem now:** Assumes you bought a WordPress plugin. Shows Flutterwave payment status. Doesn't match "hire an agent" flow.

**New structure:**

#### Hero: "Your agent is ready."

#### Path A: "I want to hire an agent"
→ Shows pricing cards (links to /pricing)
→ After payment: "Open Telegram. Your agent is waiting." + link to @GodseyeXbot

#### Path B: "I already paid — where's my agent?"
→ "Open Telegram and message @GodseyeXbot"
→ If they have WordPress: collapsible "Connect your WordPress site" (the old plugin install steps, hidden by default)
→ If they don't: "You're all set. Just start chatting."

#### Post-purchase state (`/start?success=true`):
→ "✅ Payment confirmed. Your agent is ready."
→ Big button: "Open Telegram →" (links to https://t.me/GodseyeXbot)
→ Below: "Using WordPress? Connect your site →" (collapsible)

---

### PAGE 5: DOCS (`/docs`) — SPLIT INTO 2 AUDIENCES

**Problem now:** Only for WordPress plugin installation.

**New structure:**

#### Tab 1: "Getting Started" (for everyone)
- How to talk to your agent (command examples)
- What it can do (capability list)
- How hours/billing works

#### Tab 2: "Connect WordPress" (optional, collapsible)
- The 6-step plugin install guide (existing content)
- How to generate Application Passwords
- How to use /connect command

#### Tab 3: "Self-Hosting" (for developers)
- VPS setup
- BYOK configuration
- MCP integration

---

### PAGE 6: NAV BAR — CLEAN UP

**Current nav:** Features · Templates · Pricing · Docs · Blog + Agents dropdown
**Problems:** `/templates` and `/blog` are dead/broken. Agents dropdown pages may not exist.

**New nav:** Features · Pricing · Docs + "Hire →" CTA button (gold, prominent)

*(Remove: Templates, Blog, Agents dropdown — these don't exist yet or are broken. Add them back when the pages are built.)*

---

### PAGE 7: TOP BANNER — UPDATE

**Current:** "👁️ GodsEye v2.0 — From Private Beta to Public Release"
**New:** "👁️ Hire AI agents for your business — from $9"

*(Or remove entirely. The hero is strong enough.)*

---

## PART 4: THE COMPLETE CLICK MAP

### Every button, where it goes, and why:

```
LANDING (/)
├── Hero CTA "Hire My Agent →"  →  /pricing
├── Hero CTA "How It Works"     →  scrolls to Section 3
├── Use-case cards              →  no link (informational)
├── Nudge section               →  no link (informational)
├── Fleet section               →  no link (informational)
├── Audience cards              →  no link (informational)
├── Pricing cards "Hire X"      →  /pricing
├── Hour bundle chips           →  /pricing
├── CTA "Hire My Agent →"       →  /pricing
└── FAQ                         →  no link (informational)

PRICING (/pricing)
├── Hour bundle "Buy Now →"     →  checkout modal (Polar)
├── Monthly plan "Hire →"       →  checkout modal (Polar)
├── Add-ons                     →  checkout modal (Polar)
├── "Start with $9 trial"       →  checkout modal (Polar)
└── After payment redirect      →  /start?success=true

START (/start)
├── "Hire an agent"             →  /pricing
├── "Open Telegram →"           →  https://t.me/GodseyeXbot
├── "Connect WordPress"         →  expands install steps
└── Post-purchase               →  "Open Telegram →" button

FEATURES (/features)
├── All CTAs                    →  /pricing
└── Integrations                →  no link (informational)

DOCS (/docs)
├── Getting Started tab         →  informational
├── Connect WordPress tab       →  informational
└── Self-Hosting tab            →  informational

NAV BAR (every page)
├── Features                    →  /features
├── Pricing                     →  /pricing
├── Docs                        →  /docs
└── "Hire →" gold button        →  /pricing
```

**Rule: NO dead ends. Every page has a clear next step. Every CTA leads to /pricing or Telegram.**

---

## PART 5: WHAT GETS DELETED

| Element | Why |
|---------|-----|
| Hero slide 4 (Power) | Merged into fleet section |
| Use-case body paragraphs | Repeated hero copy |
| Audience body paragraphs | Repeated use cases |
| Cost comparison rows 5-6 | Padding, 4 rows is enough |
| 5 FAQ questions (of 10) | Didn't block conversion |
| `/templates` nav link | Dead page |
| `/blog` nav link | Dead page |
| Agents dropdown | Pages may not exist |
| "v2.0 Private Beta" banner | Stale messaging |
| Flutterwave payment polling on /start | Being replaced by Polar checkout modal |
| "credits" language everywhere | Replaced by "hours" |

---

## PART 6: BUILD ORDER (what I touch, in sequence)

| Step | What | Files | Time |
|------|------|-------|------|
| 1 | Compress LandingPage.tsx (12→7 sections) | LandingPage.tsx | 20 min |
| 2 | Rewrite PricingPage.tsx (hours + hires) | PricingPage.tsx | 20 min |
| 3 | Rewrite FeaturesPage.tsx (WP→general) | FeaturesPage.tsx | 15 min |
| 4 | Simplify StartPage.tsx (2 paths) | StartPage.tsx | 15 min |
| 5 | Split DocsPage.tsx (3 tabs) | DocsPage.tsx | 15 min |
| 6 | Clean Layout.tsx nav (remove dead links) | Layout.tsx | 5 min |
| 7 | Update top banner | Layout.tsx | 1 min |
| 8 | Build + deploy | — | 2 min |

---

*This is the draft. Nothing is changed. Read it, think about the flow, tell me what to adjust.*
