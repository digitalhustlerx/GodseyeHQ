# GODSEYE — MASTER BUILD MAP
> The complete mind map. Every workstream. Every deliverable. Source of truth for the build.
> Created: 2026-08-04 · Status: ACTIVE BUILD

---

## THE VISION (one paragraph)

Godseye is an entity you hire that runs your business. It lives on Telegram — you converse with it natively, it creates a group for your business, pre-configures it with topics, bots, and settings, and becomes the living home of your operations. It spins up sub-agents on demand: one manages your WordPress site, one handles content, one finds leads, one runs ads. You don't need another dashboard. You need an entity that gets things done — one you trust. WordPress is the anchor vertical (massive existing market, easy first value), but the entity is not limited to it.

---

## WORKSTREAM A — POSITIONING & COPY (the narrative)

### A1. Hero rewrite
- **Current:** "WordPress, managed by AI. No more logging into wp-admin."
- **New:** "Hire an agent that runs your business. You steer from Telegram. It never sleeps."
- Slider/carousel hero with 3 slides:
  1. "Hire one agent. It spins up a team." (the vision)
  2. "Your business lives on Telegram." (the channel)
  3. "It manages your site, your content, your leads." (the proof)
- **Voice rule:** No "AI" jargon. No "credits." Conversational, like talking to a person. "You hire it. You text it. It runs. You sleep."

### A2. Use-case blocks (the "plug it in" section)
4 relatable blocks, each with a "Plug this in" button:
1. 🛒 **Running a store?** → orders, products, coupons, abandoned-cart emails, WooCommerce
2. ✍️ **Running a content site?** → drafts, schedules, SEO, auto-posts to social
3. 📈 **Need leads?** → scrapes, enriches, exports CSVs, cold outreach sequences
4. 🧑‍💼 **Just need an assistant?** → tasks, reminders, research, scheduling, file handling

### A3. The "Why" section (sci-fi honesty, leaned into)
- "This agent never sleeps. It never has an attitude. It fixes itself when something breaks. It gets smarter the longer you use it."
- "You're not buying software. You're hiring an entity that works 24/7/365 and does exactly what you tell it."

### A4. Proof section
- Screenshots/GIFs of real Telegram chats producing real results
- The live company counter (like Polsia's): "X businesses running on Godseye right now"

### A5. Pricing section
- **Hour bundles** (primary): trial → pack → bulk (volume discount)
- **Monthly hires** (secondary): $9 Starter, $29 Pro, $99 VPS/BYOK
- **Add-ons** at checkout: infrastructure slots, site migration, preset agent packs, extra seats

---

## WORKSTREAM B — PRICING & ECONOMICS (the money)

### B1. Hour-bundle pricing (replaces credits as primary unit)
Based on cost model (COST-MODEL.md): our cost is $0.01-0.06/hr. Price at 99% margin.

| Bundle | Price | $/hr | Target |
|--------|-------|------|--------|
| 1-Hour Trial | $9 | $9.00 | Hook — "try it tonight" |
| 10-Hour Pack | $69 | $6.90 | "one project done" |
| 50-Hour Pack | $249 | $4.98 | "ongoing operations" |
| 100-Hour Pack | $399 | $3.99 | "agency / power user" |

### B2. Monthly hire plans (recurring revenue)
| Plan | Price | What you get |
|------|-------|-------------|
| Starter | $9/mo | 1 agent standing by (WP Operator or Assistant), 5 hours included |
| Pro | $29/mo | 3 agents, 20 hours included, lead-gen + social + analytics |
| VPS/Self-Host | $99/mo | Unlimited agents on your own VPS, BYOK, full server control |

### B3. Add-ons (upsell at checkout)
- Extra hours: $5-10/hr depending on plan
- Site migration: $49 one-time
- Preset agent packs: $29 each (Store-Bot, Content-Calendar-Bot, Lead-Finder-Bot)
- Infrastructure slot (dedicated VPS): $20/mo
- Domain management setup: $19 one-time

### B4. Revenue model
- Hours = cash flow (prepaid, non-refundable, roll over)
- Hires = retention (sticky monthly)
- Add-ons = margin expansion
- Connections (Meta/ads/social) = billable hours + premium hires
- Referral links in open-source docs = affiliate revenue

---

## WORKSTREAM C — TELEGRAM NATIVE EXPERIENCE (the differentiator)

### C1. The guided onboarding (bot creates the "living home")
When a user hires Godseye, the bot:
1. `/start` → warm welcome, persona intro
2. Asks: "What's your business about?" → user describes it
3. **Bot creates a Telegram group** for the user's business
4. **Bot sets up forum topics** inside the group:
   - 📋 Tasks & Work
   - 📊 Analytics & Reports
   - 💬 Customer Interactions
   - 🔧 Settings & Config
   - 📁 Files & Deliverables
5. **Bot adds itself as admin** with the right permissions
6. **Bot deploys initial agents** based on what the user described (WP operator, assistant, etc.)
7. **Bot sends a welcome message** to the group: "I'm your agent. This is our home. Text me anytime."

This makes the group the **living home of the business** — not a dashboard, not a webpage. An authentic entity living where the user already is.

### C2. Command set
| Command | What it does |
|---------|-------------|
| `/start` | Welcome + persona + "what's your business?" wizard |
| `/hire [mode]` | Spin up a specific agent (store, content, leads, ads, assistant) |
| `/work [hours] [task]` | Start a work loop on a task |
| `/buy [bundle]` | Inline payment link (Polar/Flutterwave) right in chat |
| `/status` | What's running, hours left, agent queue |
| `/agents` | List active agents, add/remove |
| `/connect [service]` | Connect WP site, Meta, social accounts (via Composio/OpenConnector) |
| `/keys` | (VPS tier only) Manage BYOK |
| `/help` | Full command reference |

### C3. In-chat steering
- User can always type natural language to steer: "stop", "change that to X", "do it faster"
- Agent acknowledges and adjusts — "God Mode means I stop waiting, not that I stop listening"
- Deliverables posted directly in chat (files, links, screenshots)

### C4. Connection monetization
- Every connection (Meta, social, email) = the agent can now do MORE billable work
- Premium hires (Ad Runner, Social Manager) = higher monthly
- Composio/OpenConnector integration = we control the API access, user pays for hours used through those APIs

---

## WORKSTREAM D — LANDING PAGE REBUILD (the storefront)

### D1. Page structure (single scroll, conversion-optimized)
1. **Hero slider** (3 slides, 4s rotation): vision → channel → proof
2. **"What can it handle?"** — 4 use-case blocks with "Plug this in" buttons
3. **"Why you need it"** — the sci-fi honesty section (never sleeps, fixes itself, gets smarter)
4. **"See it work"** — proof carousel (Telegram chat screenshots/GIFs)
5. **Pricing** — hour bundles + monthly hires, side-by-side, add-ons below
6. **"Plug it in"** — form: domain/email + choose your hire → checkout → Telegram link
7. **Footer** — referral links, open-source pointer, support

### D2. Design tokens (unchanged from AGENTS.md)
```css
bg: #0A0A0A
text: #F2F2F2
accent: #C4A484 (gold)
surface: #121212
border: rgba(255,255,255,0.1)
heading: Georgia, serif (300 weight)
body: system sans-serif
radius: rounded-2xl (cards), rounded-full (buttons)
```

### D3. Multiple landing pages (for different audiences)
- `/` — Main (vision-first, broad)
- `/wordpress` — WP-specific (anchor market, SEO-optimized for "WordPress AI")
- `/store` — WooCommerce store owners
- `/leads` — Lead generation use case
- `/agency` — Agency management package

---

## WORKSTREAM E — OPEN SOURCE STRATEGY (the moat)

### E1. What's open-source (public repo)
- Agent foundation code (how to spin up, loop, connect MCPs)
- Documentation (getting started, commands reference)
- Self-host guide (for VPS/BYOK tier)
- WordPress plugin (the connector)

### E2. What's private (closed repo)
- Onboarding flow + wizard logic
- Dashboard/analytics logic
- Pricing/billing engine
- Strategy/psychology/marketing copy
- The group-creation guided setup

### E3. Monetization of open-source users
- Embedded referral links (OpenCode Go subscription, API providers)
- "Starter pack" requirement: to get an agent running, you need X (which has our affiliate link)
- Self-host tier ($99/mo or one-time) = the "I want it fully managed" upgrade path
- Open-source users who scale = natural conversion to managed plans

---

## WORKSTREAM F — DISTRIBUTION & GROWTH (the engine)

### F1. Lead generation (already started)
- Reddit/HN scout agents (money-scanner pattern)
- WordPress.org support forum monitoring (people with WP problems = warm leads)
- Outreach file at /srv/godseye-leads/OUTREACH.md (8 leads already curated)

### F2. Content marketing
- @godseyehq on X (connected via Composio, needs API credits)
- Blog at /blog/ (SEO: "how to start AI company", "WordPress AI agent", etc.)
- Build-in-public content on Telegram channel

### F3. Referral program
- Both referrer + referee get 50 credits / 5 free hours
- Embedded in billing system
- Growth loop baked into checkout

---

## WORKSTREAM G — TECHNICAL ARCHITECTURE (the stack)

### G1. Current stack (already running)
- **Frontend:** React/Vite SPA at /root/godseye-repo/
- **Backend:** OpenSaaS (Node/Postgres) for auth/billing/dashboard
- **Payments:** Polar (primary, live), Flutterwave (backup)
- **Bot:** @GodseyeXbot via Composio
- **WP Plugin:** godseye-agent.php (REST API bridge)
- **LLM:** OpenCode Go ($10/mo flat, DeepSeek-class)
- **Local fallback:** Ollama (Qwen-3.5 4B already on VPS)
- **VPS:** Hivelocity 6-core, 11GB RAM, $55/mo

### G2. What needs building
1. **Bot group-creation logic** (Telegram Bot API: createGroup, setForumTopics, addAdmin)
2. **Hour-bundle checkout** (Polar products for $9/$69/$249/$399 bundles)
3. **Bot command handlers** (/hire, /work, /buy, /status, /agents, /connect)
4. **Agent loop engine** (God Mode: plan → execute → plan next → loop until timer)
5. **Connection system** (Composio/OpenConnector: Meta, social, email, WP)
6. **Deliverable system** (post files/results directly in Telegram chat)

### G3. Scaling plan
- Current VPS: ~10-15 concurrent clients
- At 10+ clients: add $10/mo block storage
- At 15+ clients: second $55 VPS
- At 50+ clients: dedicated server ($120/mo)
- Revenue at 50 clients ($99/mo avg): $4,950/mo. Cost: ~$240/mo. Profit: $4,710/mo.

---

## BUILD ORDER (what gets done first)

| Priority | Workstream | Task | Est. Time |
|----------|-----------|------|-----------|
| 🔴 1 | A | Hero rewrite + use-case blocks (copy draft) | 30 min |
| 🔴 2 | B | Hour-bundle pricing into mockData.ts (code draft) | 20 min |
| 🔴 3 | D | Landing page restructure (code draft) | 45 min |
| 🟡 4 | C | Bot command spec + group-creation flow doc | 30 min |
| 🟡 5 | C | Bot `/start` handler implementation | 45 min |
| 🟡 6 | B | Polar products for hour bundles | 20 min |
| 🟢 7 | F | X content + blog setup | 30 min |
| 🟢 8 | E | Open-source repo split + docs | 60 min |

---

*This is the master map. Every agent dispatched references this. Every change logged here.*
