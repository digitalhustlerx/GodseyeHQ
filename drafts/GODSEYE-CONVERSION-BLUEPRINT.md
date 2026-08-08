# GODSEYE — CONVERSION BLUEPRINT

> **Status:** Draft only. No production files changed.
> **Purpose:** One coherent map for positioning, pages, sections, navigation, clicks, payment, onboarding, and Telegram delivery.
> **Pricing status:** All numbers below are proposals until explicitly approved.

---

## 1. THE PRODUCT IN ONE SENTENCE

**Godseye is a personal business agent that lives in Telegram, understands what you need, does the work, and brings in extra agents when the work grows.**

It can help someone manage a business, build an online presence, understand their numbers, support customers, manage a website or store, and keep important work moving.

### The simple explanation

> **You talk to it. It works for you.**

No dashboard-first language. No plugin-first language. No requirement that the customer already understands AI, WordPress, APIs, or automation.

### The product hierarchy

1. **Godseye** — the main personal business agent.
2. **Specialist agents** — optional workers it can bring in: content, social, support, leads, store, analytics, security.
3. **Connections** — services it can work with: Telegram, website, online store, email, social accounts, analytics.
4. **Plans and hours** — how the customer pays for access and work.
5. **Telegram workspace** — where the customer's business conversations, tasks, files, reports, and approvals live.

Do not present these as five separate products. They are five parts of one experience.

---

## 2. THE CORE CONVERSION IDEA

Every visitor should understand this sequence:

```text
I have too much business work.
        ↓
Godseye can take some of it off my plate.
        ↓
It works through a conversation I already understand.
        ↓
It can start with one job and grow into more.
        ↓
I can try it cheaply.
        ↓
I pay.
        ↓
I open Telegram and begin.
```

### The single primary CTA

**Hire your agent →**

This should lead to `/pricing`, not directly to a confusing plugin or legacy payment form.

### Secondary CTAs

- **See what it can handle →** → `/use-cases`
- **How it works →** → `/how-it-works`
- **Try it for $9 →** → `/pricing#trial`
- **Already paid? Open Telegram →** → `/start?success=true`

Do not use five different CTA labels for the same action. Different words make the site feel like different products.

---

## 3. PRICING LANGUAGE — PROPOSED MODEL

### The `$9/month` callout

Calculated values:

- `$9/month`
- `$0.30/day` using a 30-day month
- About `$0.30/day` when annualized over 365 days at 12 monthly payments
- `$108/year` before any discount

### Safe customer-facing phrasing

> **Hire an agent from $0.30 a day.**
>
> One simple monthly plan. Cancel anytime.

Do **not** say “24/7 unlimited work for $0.30/day” unless the plan actually includes unlimited usage. The price must describe access/standing-by service, while included hours or usage limits must be clear nearby.

### Recommended pricing architecture to test

Keep the customer-facing choice to two paths:

#### Path A — Keep an agent on standby
Recurring monthly plans.

- **Starter — proposed $9/month:** one agent, a defined included allowance, one core connection.
- **Pro — proposed $29/month:** more agents, more included work, more connections, proactive reports.
- **Self-host — proposed $99/month:** setup/management of a customer's own infrastructure; BYOK belongs here.

#### Path B — Hire work when needed
Prepaid hour bundles.

- **1-hour trial — proposed $9**
- **10-hour pack — proposed $69**
- **50-hour pack — proposed $249**
- **100-hour pack — proposed $399**

### Important distinction

Do not mix these messages on the same card:

- “$0.30/day” = monthly access/standing-by price.
- “Hours” = paid work allowance for tasks and agent activity.
- “Agent packs” = optional specialist configurations.

Explain this once on `/pricing`. On the homepage, show only the simple headline and one short clarification.

---

## 4. THE NAVIGATION MENU

### Primary navigation

```text
Godseye logo
What It Does
Use Cases
How It Works
Pricing
Docs

[Hire Your Agent →]
```

### Why this order works

1. **What It Does** answers “what is this?”
2. **Use Cases** answers “is it for someone like me?”
3. **How It Works** answers “how would I start?”
4. **Pricing** answers “what does it cost?”
5. **Docs** is for evaluation and existing customers, not the primary sales path.
6. **Hire Your Agent** stays visible at all times.

### Remove or hide for now

- Templates — unless the page is real and useful.
- Blog — unless at least a small, coherent set of articles exists.
- A large Agents dropdown — specialist agents belong inside the use-cases experience until the agent marketplace is real.
- Technical WordPress language in the primary nav.

### Footer navigation

```text
Product: What It Does · Use Cases · How It Works · Pricing
For customers: Docs · Open Telegram · Support
For builders: Security & Privacy · Self-Host · Open Source
Company: About · Blog (only when live)
```

---

## 5. HOMEPAGE `/` — THE SALES PAGE

The homepage should be persuasive but compact. It should not explain every feature. It should make the visitor understand, recognize their problem, trust the product, and choose a next step.

### Section 1 — Hero: immediate understanding

**Eyebrow:** AI AGENTS FOR YOUR BUSINESS

**Headline:**
> **Talk to your business agent. Get the work done.**

**Support line:**
> Godseye lives in Telegram, takes care of the work you keep putting off, and grows with your business. Start with one job. Add more help when you need it.

**Primary CTA:** Hire Your Agent → `/pricing`

**Secondary CTA:** See What It Can Handle → `/use-cases`

**Microcopy:** From $0.30/day · No technical skills required · Cancel anytime

#### Hero slider role
Use the slider for emotional variations, not five separate explanations. Each slide should reinforce the same promise:

1. **Simplicity:** “Talk to your business agent. Get the work done.”
2. **Relief:** “Stop carrying every task yourself.”
3. **Possibility:** “Build and manage more with the help you already have.”
4. **Scale:** “Start with one agent. Add specialists as you grow.”

Do not repeat Telegram, 24/7, clients, content, and orders in every slide. State each proof once.

---

### Section 2 — Immediate recognition: “What do you need help with?”

Six compact cards, one sentence each:

- **Clients:** Replies, bookings, reminders, and follow-ups.
- **Content:** Posts, captions, product descriptions, and publishing.
- **Social:** Scheduling, posting, and understanding engagement.
- **Orders:** Products, inventory, confirmations, and store tasks.
- **Admin:** Files, invoices, receipts, and reminders.
- **Numbers:** Plain-English answers about what is working and what to improve.

Each card has an optional link to the relevant `/use-cases/<slug>` page. Do not put long explanations here.

---

### Section 3 — The proof of difference: proactive help

**Heading:**
> **It does not just wait for instructions.**

**Support:** It stays in the loop and brings useful work to you.

Show three Telegram-style examples only:

- “Your best product is getting more attention. Want me to prepare a promotion?”
- “A customer has not returned in three weeks. Want me to send a follow-up?”
- “Your traffic dropped this week. I found a slow page and can fix it.”

**CTA:** See how it works → `/how-it-works`

This section owns the “proactive agent” idea. Do not repeat it in six other places.

---

### Section 4 — How it becomes useful

Three steps:

1. **Tell it what you do** — business, service, store, project, or personal workload.
2. **Connect what matters** — Telegram first; website, store, email, social, or analytics when useful.
3. **Ask, approve, and receive the result** — the agent does the work and brings you updates.

**CTA:** Start in Telegram → `/start`

This is the only homepage section that explains onboarding.

---

### Section 5 — One agent, more help when needed

**Heading:**
> **Start with one. Add the help your business needs.**

Explain the fleet in one short paragraph, then show six compact agents:

- Content
- Social
- Customer support
- Leads
- Analytics
- Website/store operations

**Body:** Your main agent coordinates the work. You do not need to understand the machinery. You ask for an outcome; Godseye brings in the right help.

**CTA:** Explore agent use cases → `/use-cases`

---

### Section 6 — Trust, privacy, and control

This deserves its own section because it reduces buying fear.

Three cards:

- **You stay in control:** Important actions can come to you for approval.
- **Your data is isolated:** Your business data is kept separate from other customers.
- **Self-host when you need maximum control:** Your own server and keys are available as a higher-level option.

Avoid unsupported absolute claims like “nothing ever leaves your infrastructure” for the managed cloud plan. Separate managed cloud privacy from self-host privacy.

**CTA:** Read security and privacy → `/security`

---

### Section 7 — Who it is for

Use four cards only:

- **Service professionals:** beauty, hair, makeup, tutors, consultants, and other client-based businesses.
- **Solopreneurs:** one-person businesses doing the work of several people.
- **Store owners:** online or physical businesses with products, orders, and customers.
- **Agencies:** teams managing several clients and looking to scale operations.

Do not include a developer card on the main homepage. Put developers on `/self-host` and `/open-source` so the main conversion path stays relatable.

---

### Section 8 — Price anchor and CTA

**Heading:**
> **Hire help from $0.30 a day.**

**Support:** Start with the monthly agent plan, or buy hours for a specific project.

Show only two choices:

- **Keep an agent on standby** — from proposed `$9/month`.
- **Buy focused work** — from proposed `$9 for one hour`.

**Primary CTA:** Compare plans → `/pricing`

Do not display six different plans, bundles, add-ons, credits, and BYOK details on the homepage.

---

### Section 9 — Final CTA

**Heading:**
> **Tell it what you need help with.**

**Body:** Your agent is ready in Telegram. Start small, see it work, and add more when you are ready.

**CTA:** Hire Your Agent → `/pricing`

**Secondary:** Already paid? Open Telegram → `/start?success=true`

---

## 6. USE-CASES HUB `/use-cases`

### Purpose
This page converts visitors who say: “I understand the idea, but how would it help my business?”

### Structure

1. Hero: **“What would you hand off first?”**
2. Short explanation: choose a situation, not a technical feature.
3. Six use-case cards.
4. Each card links to a detailed page or expandable example.
5. “Start with this job” CTA → `/pricing#trial`.
6. “Not sure?” CTA → `/start` with a guided selection.

### Use-case detail pages

#### `/use-cases/service-business`
For lash techs, hairstylists, makeup artists, tutors, consultants, and appointment-based businesses.

- Client replies
- Booking requests
- Reminders and follow-ups
- Social posts
- Customer history
- Daily admin

CTA: **Get help with my business → `/pricing#trial`**

#### `/use-cases/online-store`
For product sellers and online stores.

- Orders
- Inventory
- Product descriptions
- Promotions
- Customer questions
- Sales summaries

CTA: **Put my store agent to work → `/pricing`**

#### `/use-cases/content-social`
For creators, bloggers, brands, and businesses building an online presence.

- Content ideas
- Captions and posts
- Scheduling
- Repurposing
- Analytics explanations
- Recommendations

CTA: **Build my online presence → `/pricing`**

#### `/use-cases/leads-growth`
For businesses that need more customers.

- Find prospects
- Organize lead lists
- Follow up
- Research competitors
- Suggest campaigns
- Report what is working

CTA: **Start growing → `/pricing`**

#### `/use-cases/website`
For businesses with WordPress or another supported website.

- Content updates
- Store tasks
- Health checks
- Media and pages
- Analytics
- Ongoing maintenance

WordPress belongs here as a strong integration, not as the identity of the company.

CTA: **Connect my website → `/start`**

#### `/use-cases/personal-assistant`
For people who want one place to manage tasks and ideas.

- Reminders
- Research
- Files
- Planning
- Recurring work
- Personal organization

CTA: **Get my assistant → `/pricing`**

---

## 7. FEATURES `/features`

### Purpose
Proof of capability for interested visitors. Not the first page a normie needs.

### Section order

1. Hero: **“It does the work, not just the talking.”**
2. Capability groups:
   - Communicate
   - Create
   - Operate
   - Understand
   - Watch
   - Improve
3. Real command examples beside each group.
4. What requires approval vs what can run automatically.
5. Connections and integrations.
6. CTA: **Choose how to start → `/pricing`**.

### Avoid

- Repeating the six homepage use-case cards word-for-word.
- Making WordPress the first feature.
- Claiming every integration is already live if it is not.

---

## 8. HOW IT WORKS `/how-it-works`

### Purpose
Remove uncertainty before payment.

### Section order

1. **Choose your starting point** — trial, monthly agent, or focused work.
2. **Tell Godseye what you do** — guided questions in Telegram.
3. **Your business space is organized** — group and sections, only where the product actually supports this.
4. **Connect tools gradually** — Telegram first; domain, website, store, social, email as needed.
5. **Give a task** — natural-language request.
6. **Review and approve** — customer stays in control.
7. **Receive the result** — files, posts, replies, reports, or completed changes.
8. **Add more help** — specialist agents as workload grows.

CTA after every major stage: **Start for $9 → `/pricing#trial`**.

Do not promise “under 60 seconds” for a full business setup unless the actual onboarding supports it. Use “start in under a minute” for the first Telegram conversation and reserve full setup claims for verified flows.

---

## 9. PRICING `/pricing`

### Purpose
Turn intent into payment without confusion.

### Page flow

1. Hero: **“Choose how you want help.”**
2. Toggle or tabs:
   - **Keep an agent on standby**
   - **Buy focused work**
3. Monthly plans.
4. Hour bundles.
5. Short explanation of what hours mean.
6. Add-ons only after a plan is selected.
7. Pricing FAQ.
8. Final CTA.

### Payment data flow

```text
User selects plan/bundle
  ↓
Checkout modal receives product ID, name, amount, and customer email
  ↓
Backend creates Polar checkout session
  ↓
Polar handles payment
  ↓
Webhook confirms payment
  ↓
Account receives plan/hours
  ↓
User sees success page
  ↓
Success page opens Telegram
  ↓
Telegram bot links the payment to the user's account
  ↓
Onboarding begins
```

### Required payment states

- Loading: “Preparing your checkout…”
- Failure: clear error + retry button.
- Cancelled payment: return to pricing with selected option preserved.
- Paid: payment confirmation + Telegram button.
- Webhook pending: “Payment received. We are confirming it now.”
- Duplicate webhook: do not grant hours twice.
- Unsupported product: fail safely and show support path.

### Critical data fields

Every checkout must carry:

- product ID
- plan or bundle ID
- customer email
- account/user ID when available
- Telegram user ID when available
- referral token when available
- currency and amount
- source page and CTA

No checkout should rely only on a visible plan name or price typed by the browser.

---

## 10. START `/start`

### Purpose
A bridge between purchase and Telegram — not a second sales page.

### State A: visitor arrives without payment

Show:

> **Your agent starts in Telegram.**
>
> Choose a plan first, then we will take you straight to your agent.

CTA: **See plans → `/pricing`**

### State B: payment success

Show:

> **Payment confirmed. Your agent is ready.**

Primary CTA: **Open Godseye on Telegram → `https://t.me/GodseyeXbot`**

Secondary option:

> Have a website to connect? **Connect it after you meet your agent.**

Do not force plugin installation before the customer has experienced the core Telegram product.

### State C: existing customer

Show:

- Open Telegram
- View docs
- Manage plan
- Contact support

---

## 11. DOCS `/docs`

### Audience tabs

1. **Start Here** — talk to your agent, first tasks, approvals, files, reports.
2. **Connect a Website** — WordPress and other integrations.
3. **Use Your Agents** — specialist agents and examples.
4. **Self-Host** — VPS, BYOK, privacy, advanced setup.

Docs are for people who already chose to use the product. They should not dominate the sales navigation.

---

## 12. SECURITY `/security`

New page to answer trust objections.

Sections:

1. What data Godseye uses.
2. What the customer controls.
3. Approval boundaries.
4. Account isolation.
5. Managed cloud vs self-hosted comparison.
6. Connection security.
7. What happens when an agent makes a mistake.
8. Contact/support.

CTA: **Choose your setup → `/pricing`**.

Never promise absolute privacy or autonomous perfection. Explain the control model honestly.

---

## 13. SELF-HOST `/self-host`

### Audience
Developers, agencies, privacy-focused companies, and customers with their own infrastructure.

### Sections

1. Why self-host.
2. What is included.
3. BYOK explanation.
4. Infrastructure requirements.
5. Setup path.
6. Managed vs self-hosted comparison.
7. CTA: **Talk to us about self-hosting → `/pricing#self-host`**.

Keep this away from the main normie path so technical choices do not scare away ordinary buyers.

---

## 14. AGENCY `/agency`

### Audience
Agencies managing multiple clients.

### Sections

1. Hero: **“Give every client an agent without hiring a bigger team.”**
2. Dedicated workspace per client.
3. Client-specific agents and permissions.
4. Shared agency operations.
5. White-label/branding position only if actually available.
6. Bulk hours and management.
7. Example workflow.
8. CTA: **See agency options → `/pricing#agency`**.

Do not put agency language on the main hero. It is a separate high-value path.

---

## 15. BLOG / LEARNING CENTER

Do not add an empty blog just to fill navigation. When created, organize it into three content lanes:

1. **Business automation:** practical articles for non-technical owners.
2. **Agent playbooks:** how to use an agent for leads, content, support, and store operations.
3. **Website and WordPress:** SEO capture for the existing anchor market.

Every article must end with one relevant CTA:

- Service-business article → `/use-cases/service-business`
- Store article → `/use-cases/online-store`
- Website article → `/use-cases/website`
- Agent article → `/pricing`

---

## 16. CLICK MAP

### Main homepage

```text
Hero: Hire Your Agent → /pricing
Hero: See What It Can Handle → /use-cases
Use-case card → relevant use-case detail
Proactive section → /how-it-works
Fleet section → /features or /use-cases
Privacy section → /security
Pricing callout → /pricing
Final CTA → /pricing
```

### Pricing

```text
Select monthly plan or hour bundle
  ↓
Checkout modal
  ↓
Polar checkout
  ↓
Webhook confirmation
  ↓
Success page
  ↓
Open Telegram
  ↓
Agent onboarding
```

### Content pages

```text
Features → Pricing
Use case → Trial or relevant plan
How it works → Pricing
Security → Pricing / Self-host
Agency → Agency pricing
Docs → Telegram / account
```

No page should end with “learn more” without a next action.

---

## 17. WHAT TO BUILD FIRST

### Phase 1 — coherence before expansion

1. Make the homepage concise and non-repetitive.
2. Make `/pricing` match the actual offer and payment path.
3. Make `/start` a real post-payment bridge to Telegram.
4. Fix navigation and remove dead links.
5. Update `/features` so it no longer contradicts the homepage.

### Phase 2 — conversion support

6. Build `/use-cases` hub plus the first three detail pages:
   - service business
   - online store
   - content/social
7. Build `/how-it-works`.
8. Build `/security`.

### Phase 3 — expansion

9. Build `/agency`.
10. Build `/self-host`.
11. Build a real learning center/blog.
12. Add specialist agent pages only when each agent can actually be hired or meaningfully demonstrated.

Do not build seven new pages before the core payment → Telegram path is coherent.

---

## 18. FINAL QUALITY CHECK BEFORE ANY DEPLOYMENT

- Does the homepage explain the product in 10 seconds?
- Does a non-technical service professional understand it?
- Does every page use the same words: agent, work, Telegram, hire, hours?
- Are “credits” removed from customer-facing copy if hours are now the model?
- Does every primary CTA lead to `/pricing`?
- Does every successful payment lead to Telegram?
- Does a cancelled or failed payment have a clear recovery path?
- Does the product claim match what is actually live?
- Are WordPress and self-hosting available without dominating the main message?
- Are there fewer repeated promises and more distinct reasons to believe?

---

## CURRENT DECISION POINT

Approve or revise the blueprint before any code changes.

Suggested first approval scope:

> **Approve Phase 1 only:** homepage compression, pricing alignment, `/start` payment-to-Telegram bridge, navigation cleanup, and general Features page.

This creates one coherent product before adding more surface area.
