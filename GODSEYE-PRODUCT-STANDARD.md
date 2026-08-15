# Godseye Product Standard

> **Status:** Working product standard — strategy and UX source of truth
> **Owner:** DigitalHustlerX
> **Product:** Godseye
> **Last updated:** 2026-08-15
>
> **Canonical status note:** Product strategy in this document is authoritative for customer experience and licensing. Runtime/URL/payment facts are authoritative in `PRD.md`; where older sections mention Supabase, placeholder Polar wiring, legacy waitlist gating, or `godseye.shop` as a primary surface, follow `PRD.md` and the live system instead.

This document standardises the Godseye offer across the Telegram bot, dashboard, licensing, checkout, onboarding, website, documentation, and blog content.

It exists to prevent each surface from inventing a different product.

---

## 1. The Product in One Sentence

**Godseye is one agent you hire to run work for your business, from Telegram.**

It can coordinate specialised agents for websites, content, leads, store operations, customer support, marketing, and administration.

**WordPress is the first concrete capability and the first activation path. It is not the whole identity of the product.**

### Short customer version

> **Hire one agent. Give it work. Steer it from Telegram.**

### WordPress wedge version

> **Talk to your agent on Telegram and let it run your WordPress site — posts, pages, store, and site health — without code.**

### What Godseye is not

- Not a collection of disconnected AI features.
- Not a free WordPress plugin that secretly provides a free hosted service.
- Not a dashboard people must learn before they can see value.
- Not a one-time credit purchase that bypasses the core subscription.
- Not positioned as a generic chatbot or an "AI tool" with no job to do.

---

## 2. The Commercial Principle: Access Is Not Permission to Operate

Godseye has three separate concepts that must never be confused:

1. **Account access** — the person can enter the product, see their workspace, and understand what is available.
2. **Preview access** — the person can experience Godseye through examples, guided demos, and a safe sandbox.
3. **Licensed execution** — Godseye is allowed to connect to and act on the customer's real domain or external business systems.

The first two can be free. The third requires an active subscription.

### Hard rule

> **No active subscription, no real-domain connection and no live business execution.**

This is the licensing gate. It is not a soft suggestion and it cannot be bypassed by buying top-up credits, installing the plugin, or using an alternate route through Telegram.

### Why this is the right model

- The free experience remains generous enough to create desire.
- The real value — persistent access to a customer's domain and business — is reserved for paying customers.
- It prevents support and infrastructure costs from being created by users who have not subscribed.
- It makes the subscription easy to understand: *the subscription licenses Godseye to work on your business.*
- It protects the open-source/plugin story from becoming a free hosted-service loophole.

---

## 3. Licensing Model

### 3.1 Hosted Godseye subscription

This is the normal customer path.

An active hosted subscription grants:

- A Godseye account and dashboard workspace.
- Telegram access to the customer's Godseye agent.
- Connection of an approved real domain/site.
- The included level of work, agent capacity, sites, or usage defined by the plan.
- Billing, usage, connection, and cancellation controls.

A subscription is **active** when the billing system reports it as paid and not cancelled, expired, suspended, or in a grace-period failure state.

### 3.2 Free account / preview licence

A free account grants:

- Dashboard access.
- A preloaded example workspace.
- Guided product tour and safe demo tasks.
- Telegram conversation with Godseye about what it can do.
- Sample outputs and simulated or Godseye-owned demo data.
- The ability to choose a plan and begin checkout.

A free account does **not** grant:

- Connection to the user's real domain.
- WordPress Application Password submission.
- Live WordPress mutations.
- Live store, email, ads, social, CRM, or other business integrations.
- Background work or recurring jobs on the user's behalf.
- A route around the subscription through credit top-ups.

### 3.3 Open-source/self-hosted licence

The AGPL/commercial licensing model governs software that a customer runs themselves. It is separate from the hosted subscription.

- AGPL-3.0 applies where the customer's use complies with its terms.
- A commercial licence is required for use cases outside those terms.
- Self-hosting does not silently include Godseye's hosted infrastructure, hosted agent pool, or managed Telegram service.
- Hosted customers must not be told that installing the open-source plugin gives them the hosted service for free.

All licence copy must use the current Godseye domain and contact details. Legacy `godseye.shop` references must not appear in new customer-facing material.

---

## 4. Account and Entitlement States

Every user and every connection must have an explicit state.

### Account states

| State | Meaning | Can enter dashboard? | Can connect real domain? |
|---|---|---:|---:|
| `preview` | Account exists, no paid entitlement | Yes | No |
| `checkout_pending` | User started checkout but payment is not confirmed | Yes | No |
| `active` | Subscription confirmed | Yes | Yes |
| `grace_period` | Payment issue, temporary recovery window | Yes | Existing connections: read-only or policy-defined limited mode |
| `suspended` | Entitlement removed or payment failure unresolved | Yes, billing only | No execution |
| `cancelled` | Subscription ended at period boundary | Yes, export/billing only | No execution |
| `self_hosted` | Customer operates their own instance | Separate path | Governed by self-host licence, not hosted entitlement |

### Connection states

| State | Meaning | Allowed actions |
|---|---|---|
| `unconnected` | No real site submitted | Demo only |
| `awaiting_subscription` | User tried to connect while free | Show upgrade gate; store no credentials |
| `pending_verification` | Paid user began setup | Verify URL and credentials safely |
| `connected` | Connection tested and approved | Licensed actions according to plan |
| `paused` | User or system paused the connection | No mutations; status visible |
| `revoked` | Credentials invalidated or access removed | No access; require reconnect |

**Security rule:** never accept or retain real WordPress credentials from a free user. The gate must appear before credential collection, not after.

---

## 5. The Standard Onboarding Flow

Godseye is **Telegram-first, dashboard-supported**.

The bot is the front door. The dashboard is the persistent home for account, billing, usage, connections, and deliverables.

### Stage 0 — Discover

User arrives from the website, blog, referral, or a direct Telegram link.

Primary CTA everywhere:

> **Start free on Telegram**

Secondary CTA:

> **See how it works**

Do not lead with a complicated plan comparison or force account setup before the user has seen the offer.

### Stage 1 — `/start` in Telegram

The bot should immediately:

1. Introduce Godseye in plain language.
2. Explain that the user can talk to their agent from Telegram.
3. Ask what they run and what they want off their plate first.
4. Create or locate the user's preview workspace.
5. Show the next three choices:
   - `See my workspace`
   - `Try a safe demo`
   - `Connect my real domain`

The third choice must explain that a paid subscription is required before a real domain can be connected.

### Standard `/start` copy

```text
👁️ Godseye.

I'm your agent. You can talk to me right here on Telegram.

I can run work for your business — your website, content, store, leads, and more — while you steer me from chat.

First, what do you run, and what's the one thing you want off your plate?
```

After the answer:

```text
Got it. Your Godseye workspace is ready.

You can look around, try a safe demo, and see what I can do for your business now.

When you're ready for me to work on your real domain, choose a plan. An active subscription unlocks live connections and execution.
```

### Stage 2 — Preview workspace

The workspace should already exist immediately after `/start` or account creation. It should not be an empty dashboard.

Preload:

- A sample business profile based on the user's stated business.
- Example agents/modes relevant to that business.
- Example task history.
- Example deliverables.
- A visible setup checklist.
- A clear subscription status card.

The user should feel: *"My operation is already laid out. I am deciding whether to activate it."*

### Stage 3 — Safe first value

The first free interaction must be useful but safe. Examples:

- Generate a sample homepage improvement for a fictional/demo site.
- Draft a blog post without publishing it.
- Explain what Godseye would check on a WordPress site.
- Turn a business description into a simple work plan.
- Show a sample weekly content calendar.

The first session should not be a dead tour. It should produce one visible result.

### Stage 4 — Real-domain gate

When the user taps `Connect my real domain` or asks to connect a site:

```text
Your workspace is ready, but live work on your domain requires an active Godseye subscription.

That subscription licenses your agent to connect to your site, keep it available, and do approved work for you.

Choose a plan to continue.
```

Buttons:

- `Choose a plan`
- `See what's included`
- `Keep exploring`

Do not ask for the domain URL, Application Password, API key, or other secret before this gate is passed.

### Stage 5 — Subscribe

The bot and dashboard must point to the same checkout and the same entitlement source.

After confirmed payment:

1. Account changes to `active`.
2. The user receives a confirmation in Telegram.
3. The dashboard changes from Preview to Activated.
4. The connect flow unlocks.
5. The user is guided to install/configure the correct connector/plugin.
6. The bot returns to finish the connection.

### Stage 6 — Connect and activate

Only now collect the minimum required connection details.

For WordPress:

1. Ask for the site URL.
2. Explain the connector/plugin installation.
3. Ask for the approved credential using a secure mechanism.
4. Test the connection.
5. Show the exact site being connected.
6. Ask for confirmation before the first live mutation.
7. Run one small, reversible task.
8. Show the result in Telegram and the dashboard.

The activation moment is:

> **The user sees Godseye complete one approved task on their real domain.**

### Stage 7 — Expansion

After activation, offer more work, not more product education:

- Add another site.
- Add a content or store agent.
- Schedule a recurring task.
- Ask for a weekly report.
- Invite a team member.
- Upgrade when the current plan becomes limiting.

---

## 6. Standard Telegram Command Surface

Commands are shortcuts. Natural language remains the main interface.

| Command | Standard meaning |
|---|---|
| `/start` | Create/resume preview workspace and begin onboarding |
| `/workspace` | Open dashboard and show current setup state |
| `/demo` | Run or select a safe preview task |
| `/plans` | Show subscription plans and what live access they unlock |
| `/connect` | Start connection flow; enforce active-subscription gate first |
| `/work` | Start licensed work, or explain which subscription is needed |
| `/status` | Show account, subscription, connections, active work, and usage |
| `/agents` | Show available and activated work modes |
| `/deliverables` | Show recent outputs and links |
| `/billing` | Open billing, subscription, invoices, and cancellation |
| `/help` | Show short command guide and support path |
|
| Natural message | Route to Godseye; if the requested action needs a real connection, apply the entitlement gate |

### Gate behavior in every channel

If a free user asks for live work:

```text
I can show you how that works in your preview workspace.

To do it on your real site, you need an active Godseye subscription. That unlocks the connection and live execution.
```

Never reply as if the task succeeded. Never simulate a live mutation as a completed action.

---

## 7. Dashboard Standard

The dashboard is not the product's front door. It is the user's control room after the bot has created it.

### Required dashboard areas

1. **Overview** — what is active, what needs attention, and one next action.
2. **Agents** — available modes and active hires.
3. **Connections** — domains and external systems, with entitlement status.
4. **Work** — active jobs, queue, progress, pause/stop controls.
5. **Deliverables** — files, drafts, reports, screenshots, and links.
6. **Usage** — included capacity, consumed capacity, and limits.
7. **Billing** — plan, payment state, invoices, renewal, cancellation.
8. **Settings** — profile, notifications, security, and account deletion.

### Preview dashboard state

The preview dashboard must clearly say:

- `Preview workspace`
- `Live domain connection: Locked`
- `Next step: Choose a plan to activate your agent`

It may show the full dashboard structure, but locked areas must be honest and useful. Do not blur the entire product or pretend that a screenshot is an active result.

### Activated dashboard state

The first screen should prioritise:

- The connected domain.
- The last completed task.
- Current work.
- A primary `Tell Godseye what to do` action.
- A secondary `Open Telegram` action.

---

## 8. Pricing and Offer Language Standard

Until unit economics are formally approved, prices in strategy documents remain proposals. Customer-facing prices must come from one live source of truth.

The offer should be explained in this order:

1. **Subscription = licence to have Godseye connected and working for you.**
2. **Plan = the amount of work, number of connections, and agent capacity included.**
3. **Top-ups/add-ons = extra capacity, never a replacement for the subscription.**
4. **Self-hosting = separate licence and infrastructure path.**

Avoid presenting the product as a pile of credits. If an internal metering unit remains necessary, expose it as usage/capacity, not as the main emotional promise.

### Pricing gate rules

- A top-up cannot activate an unlicensed real-domain connection.
- A cancelled or suspended subscription cannot continue background work.
- A free user can buy a plan from Telegram or the dashboard.
- Checkout confirmation, not a client-side flag, controls entitlement.
- All plan cards, bot buttons, dashboard banners, checkout pages, and blogs must use the same plan names and current figures.

---

## 9. Content and Blog Standard

Every blog post, landing page, ad, social post, email, and help article must reinforce the same product model.

### Editorial job

Content should move the reader through this sequence:

1. Recognise a business task or pain.
2. See Godseye as the agent that can take responsibility for that work.
3. Understand that Telegram is the control surface.
4. See a concrete example or result.
5. Understand that preview is free but live domain work requires a subscription.
6. Start on Telegram.

### Blog categories

Use a small, durable set:

- **Workflows** — how Godseye handles a real business job.
- **WordPress** — the anchor use case: posts, pages, stores, maintenance, health.
- **Business Operations** — leads, content, support, scheduling, reporting.
- **Agent Playbooks** — how to structure recurring work and steer an agent.
- **Product Notes** — shipped capabilities and honest changes.
- **Guides** — practical education for the target customer.

### Standard article structure

1. Specific problem in the reader's words.
2. Why the old manual process is expensive or slow.
3. The Godseye workflow.
4. What the user still controls and approves.
5. What is available in preview versus what requires activation.
6. A concrete CTA: **Start free on Telegram**.

### Blog CTA standard

Primary:

> **Start free on Telegram**

Supporting line:

> Explore the workspace for free. An active subscription is required before Godseye can connect to or work on your real domain.

Never claim that a free user can publish, edit, monitor, or manage a real site unless that entitlement is genuinely active.

### Voice rules

- Say **agent**, **work**, **domain**, **workspace**, and **subscription**.
- Say **talk to your agent on Telegram**, not "text an AI".
- Show a task and result instead of listing vague capabilities.
- Keep the tone calm, premium, direct, and human.
- Do not use fake scarcity, invented customer counts, or unapproved prices.
- Do not make WordPress the only definition of Godseye.
- Do not use legacy names or domains: Djini, Dante, OpenClaw, `godseye.shop`.

---

## 10. Security, Trust, and Approval Rules

Godseye works on real business systems. Trust is part of onboarding, not a footer paragraph.

- Subscription status is checked server-side before every live action.
- Credentials are collected only after entitlement is confirmed.
- The user sees which domain and system an action targets.
- Destructive or external actions require explicit approval unless the user has enabled a clearly defined automation rule.
- Every live action creates an auditable event.
- Users can pause, revoke, disconnect, export, and delete.
- Demo data must be visibly marked as demo data.
- Godseye must never report a live action it did not actually perform.

---

## 11. Metrics That Define a Healthy Funnel

Track the funnel as:

```text
Telegram start
→ preview workspace created
→ safe demo completed
→ plan viewed
→ subscription active
→ real domain connected
→ first approved live task
→ second task / recurring work
```

Primary metrics:

- `/start` to preview workspace creation.
- Preview to safe-demo completion.
- Preview to plan view.
- Plan view to paid subscription.
- Paid subscription to domain connection.
- Domain connection to first live task.
- First task to second task within seven days.
- Subscription retention and expansion.
- Attempts to bypass the licence gate.

The most important activation metric is **first successful approved task on the customer's real domain**, not account creation.

---

## 12. Implementation Order

This standard should be implemented in this order:

1. **Entitlement model:** server-side subscription states and connection gate.
2. **Telegram `/start`:** preview workspace, clear buttons, and honest gate messaging.
3. **Dashboard:** preview versus active state, billing status, and one next action.
4. **Checkout handoff:** bot and dashboard use one source of truth and one confirmation path.
5. **Connection flow:** collect credentials only after active entitlement.
6. **First live task:** approval, execution, audit, and result delivery.
7. **Content migration:** align landing page, blogs, guides, ads, and help copy.
8. **Analytics:** instrument the funnel and monitor gate failures, activation, and retention.

Do not polish blogs or add more modes before the entitlement boundary and first live-task path are reliable. The licence gate is the commercial spine of the product.

---

## 13. Final Product Rule

> **Let people see Godseye before they pay. Let them feel the workspace before they pay. But the moment Godseye must touch their real domain, the subscription must already be active.**

That is the standard across Telegram, the dashboard, checkout, the plugin, the website, and every blog post.
