# GODSEYE — DOMAIN-FIRST ONBOARDING ADDENDUM

> Draft proposal. No production changes made in this document.
> This revises the previous “website optional” language.

---

## 1. THE STRATEGIC CORRECTION

The website should not be presented as an optional integration hidden behind the product.

It should be the first visible business surface Godseye helps the customer create, improve, or manage.

### The real product promise

> **Tell Godseye what your business is. It helps you put that business online, then keeps improving it with you.**

This creates a much stronger journey than:

> “Connect a website if you already have one.”

### Why this is better

- A customer with a website gets immediate management value.
- A customer without a website gets a clear path to start one.
- The agent has somewhere visible to demonstrate its capability.
- The domain becomes the professional identity of the business.
- Paid hosting, domain setup, website management, and ongoing agent work become natural revenue paths.

---

## 2. TWO STARTING STATES

### State A — Customer already has a website/domain

```text
User tells Godseye what they run
  ↓
User provides domain
  ↓
Godseye reviews the public site safely
  ↓
Godseye reports what it found
  ↓
Godseye suggests improvements
  ↓
User sees proficiency
  ↓
Payment unlocks live changes, ongoing monitoring, and management
```

Before payment, Godseye may inspect public pages and produce a preview report.

Before payment, Godseye must not:

- accept or retain private credentials
- mutate the real site
- send messages on behalf of the business
- run recurring jobs
- connect private analytics or social accounts

### State B — Customer does not have a website

```text
User tells Godseye what they run
  ↓
Godseye explains why a professional domain helps
  ↓
Godseye creates a temporary preview/business page
  ↓
User sees their business taking shape
  ↓
Godseye recommends a proper domain
  ↓
Customer pays for setup/plan/domain path
  ↓
Temporary page becomes a real business site
  ↓
Agent manages and grows it continuously
```

The temporary page is not the final product. It is the demonstration and bridge to a professional online presence.

---

## 3. WHAT THE FREE PREVIEW SHOULD ACTUALLY DO

The free preview must show progress, not only explain potential.

### For an existing website

Godseye can safely produce:

- Public website summary
- What the business appears to offer
- Three obvious improvement opportunities
- Sample homepage rewrite
- Sample social post
- Sample customer reply
- Suggested next actions

### For someone without a website

Godseye can produce:

- Temporary business profile
- Business name and description
- Simple homepage preview
- Service/product list
- Contact call-to-action
- Sample social content
- Suggested domain naming ideas

### The deliberate stopping point

After doing visible work, Godseye should say:

> **Your first version is taking shape.**
>
> To put this on your real domain, keep it updated, connect your business tools, and let me continue working on it, choose a plan.

This is not a fake obstruction. The free user sees genuine progress. Payment unlocks real infrastructure and continuous execution.

---

## 4. DOMAIN PATHS WE CAN OFFER

### Path 1 — Bring your existing domain

Customer points their domain to the Godseye-managed site or connects an existing website.

Possible technical patterns:

- DNS records pointing to a Godseye-managed endpoint
- Reverse proxy with a per-customer identifier
- Managed hosting instance per customer or tenant
- WordPress connection when WordPress is the selected stack

Do not send every customer to one shared public IP without tenant isolation, SSL automation, routing, and abuse controls.

### Path 2 — Godseye helps create the site

For customers without a website:

- Select a business type
- Select a starter structure
- Enter business name, services, location, contact details
- Godseye generates the initial site
- Customer chooses a domain
- Godseye connects the domain and continues managing it

### Path 3 — Temporary Godseye address

For preview and early setup:

```text
business-name.godseye.site
```

This should be clearly labelled:

> **Preview address — connect your own domain when you are ready.**

The temporary address lets the customer see a real result without pretending it is their professional final identity.

---

## 5. ONBOARDING FLOW — REVISED

### `/start`

```text
👁️ Godseye.

Tell me what your business does and what you want off your plate first.

I’ll help you put the first useful version together, then we can connect your real domain and keep improving it.
```

### Question 1

> What do you run?

Examples:

- “I do hair and makeup.”
- “I sell skincare products.”
- “I run a tutoring business.”
- “I want to start a clothing store.”

### Question 2

> Do you already have a website or domain?

Buttons:

- **I have a website**
- **I have a domain but no website**
- **I need help starting one**
- **I’m just exploring**

### Question 3

> What should we work on first?

Buttons:

- Get my business online
- Improve my website
- Get more customers
- Manage clients
- Manage content and social
- Organize my business

### Preview output

Godseye creates a business workspace and prepares the relevant preview:

- Existing website → audit + sample improvements
- Domain only → starter site preview
- No domain → temporary business page + domain recommendation
- Exploring → safe example workspace

---

## 6. TELEGRAM GROUP ROLE

The Telegram group is the operating room, not merely a chat link.

### Group sections

- **Start Here** — business profile and current setup
- **Website & Presence** — pages, domain, content, branding
- **Tasks & Work** — active jobs and approvals
- **Customers** — messages, bookings, follow-ups
- **Content & Social** — posts, captions, campaigns
- **Numbers & Ideas** — analytics, insights, recommendations
- **Files & Results** — generated assets and deliverables
- **Settings** — connections, billing, permissions

### What the agent does inside the group

- posts the preview result
- asks for approvals
- reports what it changed
- suggests the next improvement
- keeps business decisions in the right section
- gives the owner one clear place to return to

The group is the product’s “living home.”

---

## 7. THE PAYMENT MOMENT

Payment should unlock visible business infrastructure, not an abstract quota.

### Free preview message

> I’ve prepared the first version of your business presence.
>
> To connect your real domain, publish changes, keep your site watched, and let me continue working, choose a plan.
>
> **Keep your agent on standby from $0.30 a day.**

Buttons:

- **Put my business online**
- **Keep my agent working**
- **Buy focused work**
- **Talk to me about setup**

### What the customer gets after payment

- real domain connection
- managed website or WordPress setup
- live changes with approval controls
- persistent business workspace
- recurring checks and suggestions
- more agent capacity
- business data and analytics connections
- ongoing Telegram support

This makes the subscription understandable:

> **You are paying for Godseye to keep working on the real business, not merely to answer questions.**

---

## 8. REVENUE LAYERS

### Entry

- Proposed `$9/month` plan
- Public positioning: **from $0.30/day**
- Includes a defined amount of active agent work and one starting business surface

### Setup revenue

- Domain setup
- Website setup
- Temporary-to-real-domain migration
- WordPress connection
- Store setup
- Social/email connection setup

### Recurring revenue

- Monthly agent plan
- Website management
- Proactive monitoring
- More connections
- More specialist agents

### Higher-value paths

- Agency workspaces
- Multiple websites
- Self-hosting
- Dedicated infrastructure
- Custom business workflows

Do not expose every revenue layer on the homepage. Let the customer discover the next relevant one during onboarding.

---

## 9. THE EDUCATION / BLOG LAYER

The model-cost explanation should not be mixed into the main sales flow.

Create a separate **“How Godseye Works”** or **Insights** page with articles such as:

- “Why you do not need to care which model is running underneath.”
- “What an agent actually does for a small business.”
- “Why managing your business through conversation is different from using a chatbot.”
- “Why a professional domain matters when you are building a business.”
- “From idea to live business presence.”
- “What happens when your agent brings in specialist agents.”

### Main customer-facing explanation

> You do not need to understand the model, the routing, or the machinery. You need to know that you asked for something, it did the work, and you can see the result.

The model-routing advantage is our economics and reliability story. It is not the main customer benefit.

---

## 10. WEBSITE PAGE STRUCTURE AFTER THIS CHANGE

### Homepage

Sell the dream and the first action:

1. Talk to your business agent.
2. It takes work off your plate.
3. It helps you create or improve your online presence.
4. It lives in Telegram.
5. It grows with your business.
6. Start free.

### `/use-cases`

Show business situations:

- service professionals
- stores
- creators
- consultants
- agencies
- new businesses without websites

### `/how-it-works`

Show the actual journey:

```text
Tell us what you run
→ Get a preview
→ Create your business space
→ Connect your domain
→ Pay to activate live work
→ Keep improving
```

### `/pricing`

Explain the two choices:

- Keep an agent on standby
- Buy focused work

Add setup options only after the primary choice.

### `/website-setup`

For people who do not have a website:

- temporary preview
- domain recommendation
- starter site
- professional setup
- ongoing management

### `/website-management`

For people who already have a website:

- audit
- improvements
- content
- analytics
- security
- ongoing work

### `/security`

Explain what is preview-only, what is paid, what requires approval, and what self-hosting changes.

### `/insights`

Explain the agent economy, model abstraction, business automation, and the shift from tools to workers.

---

## 11. THE NEXT TECHNICAL BUILD

### Immediate

1. Test the new `/start` flow with `@GodseyeXbot`.
2. Replace the simulated preview response with a real safe preview generator.
3. Add “website/domain” branching to onboarding.
4. Add a temporary preview output path.
5. Add the paid activation gate before credentials or live changes.
6. Add the payment continuation button.

### After that

7. Build the domain/website setup service.
8. Add business workspace persistence.
9. Add group configuration after the user adds the bot.
10. Link paid identity to Telegram ID.
11. Add proactive monitoring after activation.

---

## 12. MY EVALUATION

Your instinct is correct:

- The website is not just an integration.
- It is the visible proof of what the agent can build and manage.
- Customers without websites need a starter path, not rejection.
- Customers with websites need a safe audit before payment.
- Payment should unlock real infrastructure and continuous execution.
- Telegram should remain the operating home.
- Model routing should stay mostly behind the scenes.

The improved positioning is:

> **Godseye helps you put your business online, run the work behind it, and keep improving it — through a conversation in Telegram.**

That is broader, more understandable, and more monetizable than “connect your website if you have one.”
