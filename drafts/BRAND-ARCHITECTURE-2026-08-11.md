# Living with Agents — Brand Architecture & Product Restructure

> **Owner:** DigitalHustlerX (Marvel Ikpasa)
> **Status:** PROPOSAL — pending DV approval before anything goes live for real payments
> **Date:** 2026-08-11
> **Scope:** Rebrands the Godseye ecosystem into a 3-page architecture + running binary (the "base agent"), a plugin marketplace, Telegram connectivity, referral links, and a storage/agents-file system.

---

## 1. The Three-Page Architecture

| Page | Role | Where it lives |
|------|------|----------------|
| **God's Eye** | Main official product page | `godseye.digitalhustlerx.com` (existing godseye-repo SPA) |
| **Living with Agents** | Open-source community page | New `/root/godseye-repo/living-with-agents/` (or hub/community) — this is where tips, hacks, and how-to content lives |
| **Personal brand page** | DV / DigitalHustlerX personal brand | `digitalhustlerx.com` hub / bio — personal face of the stack |

**Held up together.** All three link to each other. The community page is the growth engine; the product page is the thing that monetizes; the personal page is the personality that drives trust.

---

## 2. The Product Model (what the community + product ship together)

The base offer is **a running agent the user can converse with the moment they create an account.**

### 2.1 Account flow (the "running agent" moment)
On account creation, the user is NOT handed a dashboard first. They are handed **a live, running agent they can talk to immediately.**

Auto-included with every account:
- A running agent instance they can converse with.
- Their **plugin** (the user's own agent plugin).
- Their **LLM API keys** (the user can bring their own; or get cheap keys from us).

### 2.2 Referral links embedded in the flow
Two referral links are surfaced in the account/onboarding flow:
1. **OpenCode referral** — `https://opencode.ai/go?ref=PCC7NY4J9S`
2. **GLM referral** — (Z.AI / GLM-5.2) referral link

These are placed where the user configures their LLM keys. We resell cheap OpenCode keys and include our referral links into both.

### 2.3 Storage & the agents file
- **Storage, not inference**, is the sharing model. The agent's state/context stores where the user puts it.
- The system maps to **an "agents file"** that manages the user's **primary file**.
- Users can create **additional stores** where the system puts things.

(Implementation note: this is the data layer. We already manage customer design and operational files. The "agents file" = the config/state file that defines and manages their primary working file and any secondary stores.)

### 2.4 Telegram bot connection
- There is a **way for users to connect their own Telegram bots** so they can connect with the LLM through their own bot.
- This is a first-class connection, not an afterthought.

---

## 3. The Plugin Marketplace

### 3.1 What a plugin is
A **plugin = a directive to your LLM.** When you are plugged into the agents system, you can buy or install plugins that set up environments. Example: a plugin that sets up the **Telegram group environment**.

### 3.2 Recommended plugins section
The marketplace has a **"Recommended plugins"** section at the top. Plugins here set a very affordable base price.

### 3.3 Scarcity model (curated store)
- The store is **curated by DV**.
- Stock is marked **"Coming soon"** — people cannot buy the plugin right now.
- This creates scarcity.
- Users get a **vanilla base agentic system** for free and can fast-track with plugins when available.

### 3.4 The vanilla base system
The default/free agentic system = **the Hermes open-source instance** (we use it ourselves). Its system is **recursive** — that's the property that makes it a strong base.

> NOTE: "Hermes" (sometimes typed "Hemes"/"Hemis") = the Hermes Agent framework by Nous Research. When DV says a variant of "Hermes," it means Hermes Agent (the open-source instance we run). Never substitute a different product name.

---

## 4. Pricing Plan

> **IMPORTANT:** Per brand rule, all figures below are a **PROPOSAL** until DV explicitly approves. Nothing gets embedded into live payment flows (Polar) without sign-off. The `mockData.ts` file is the single source of truth — change numbers there once and they propagate.

### 4.1 Current state (to be replaced)
The existing `mockData.ts` has WordPress-centric tiers:
- Free $0 (50 credits, 1 WP site)
- Starter $9 (500 credits, 1 WP site)
- Pro $29 (2,000 credits, 3 WP sites)
- God Mode $99 (10,000 credits, 10 WP sites)
- Plus credit packs & a self-host matrix

**Problem:** too WordPress-first, credit-pile framing, doesn't reflect the running-agent + marketplace model.

### 4.2 Proposed model (REWRITE to this)
The offer should be framed as: **agent + connections + plugins**, not a pile of credits.

| Tier | Price | What unlocks |
|------|-------|--------------|
| **Free (Vanilla Base)** | $0 | The vanilla base agentic system (Hermes instance). Running agent via Telegram. Bring your own LLM keys or use shared cheap keys. Community support + curated plugin feed (view-only). |
| **Base** | PROPOSAL | Running agent + plugin marketplace access + Telegram bot connection + storage (agents file + primary store). |
| **Pro** | PROPOSAL | Multi-agent, multi-store, priority plugin library, recommended plugins unlocked, faster rate / more capacity. |
| **God Mode** | PROPOSAL | Everything unlimited, dedicated capacity, white-label, earliest plugin access. |

Plus: **Plugin purchases** priced at an "affordable base price" (proposal) under **Recommended plugins**.

### 4.3 Numbers TBD (PENDING approval)
The specific dollar figures for Base / Pro / God Mode / base plugin price are **pending DV approval**. I will not guess-and-lock. Once approved, update `/root/godseye-repo/src/mockData.ts`.

---

## 5. Domain & Routing Plan

| Current | Change |
|---------|--------|
| `godseye.digitalhustlerx.com` | stays = Main product page (reshape copy + marketplace + agent flow) |
| NEW community | "Living with Agents" community page — new folder + nginx server block (or integrate into hub/community) |
| `digitalhustlerx.com` hub | personal brand page (already exists, connect links) |
| `g4.62.84.186.1.sslip.io` | A/B variant staging — the pricing "between g4 and main domain" is reconciled in one place |

---

## 6. Mandatory Reminders (brand rules)

- **Hermes** = Hermes Agent (Nous Research) open-source framework. That's the vanilla base.
- **OpenCode referral:** `https://opencode.ai/go?ref=PCC7NY4J9S`
- **Zero em dashes (—) in customer-facing copy.**
- **DigitalHustlerX** is the top umbrella. Godseye, Living with Agents, and the personal page all sit under it.
- **Payment processors are tools**, not partners/brands.
- Pricing = PROPOSAL until DV approves.

---

## 7. Open Decisions for DV (one reply)

1. **Approve or set** the Base / Pro / God Mode dollar figures + base plugin price.
2. Confirm the **community page location**: new subfolder under godseye-repo, or the existing hub/community.
3. Confirm the **domain** for Living with Agents community page.
4. Confirm GLM referral link value (I have OpenCode; need the GLM/DeepSeek referral).

Once these are set, I execute the build, deploy, and verify.
