# GODSEYE — FREE EXPERIENCE & BUSINESS ONBOARDING BLUEPRINT

> Draft only. No production code changed.
> Purpose: turn the Telegram group into the product demo, while keeping the free experience bounded and useful.

---

## 1. THE DECISION

### Do not give away the entire product as free education

That creates three problems:

- People understand the idea but never experience it.
- The website becomes a long explanation instead of a product.
- We spend money doing work for people who have not shown buying intent.

### Do give away a small real experience

The free experience should let someone see Godseye behave like a business assistant:

- It asks what they do.
- It creates a guided setup path.
- It helps them choose their first job.
- It performs one or two bounded actions.
- It shows what else it could manage.
- It asks them to pay when they want ongoing work, more connections, or more agents.

**The free product is the proof. The paid product is continuity, depth, and autonomy.**

---

## 2. THE REAL TELEGRAM ARCHITECTURE

### Important platform constraint

A standard Telegram Bot API bot cannot independently create a brand-new group through a normal `createGroup` Bot API call. Therefore the first safe version should not promise:

> “Godseye automatically creates your group.”

Instead promise:

> **“Godseye helps you create your business space, then organizes it for you.”**

### Recommended first-version flow

```text
Website or Telegram DM
  ↓
/start
  ↓
Godseye asks what the user does
  ↓
User chooses: Create my business space
  ↓
Bot gives a guided group setup action
  ↓
User creates a Telegram group and adds Godseye as admin
  ↓
Bot detects the group
  ↓
Bot configures topics, permissions, welcome message, and first agent
  ↓
User runs a free demonstration task
  ↓
Godseye offers paid continuation
```

### Later advanced option

A Telegram user-account/MTProto service could create groups on behalf of users, but this requires:

- explicit account authorization
- secure session handling
- careful abuse prevention
- user trust and revocation controls
- a separate technical product decision

Do not build that before the simple bot-admin flow proves demand.

---

## 3. FREE ONBOARDING EXPERIENCE

### What the free user receives

**Free Business Starter Experience**

- One Telegram business workspace
- One guided business profile
- One primary agent role
- One or two bounded demonstration tasks
- One sample insight or recommendation
- A clear view of what paid Godseye unlocks

The free user should not receive unlimited autonomous operation, unlimited monitoring, unlimited external API use, or unrestricted agent spawning.

### Free onboarding questions

Keep it to five questions maximum:

1. **What do you do?**
   - “I do hair/lashes/makeup”
   - “I sell products”
   - “I run a service business”
   - “I create content”
   - “I manage clients”
   - “Something else”

2. **What takes most of your time?**
   - Client replies
   - Content and social
   - Orders and admin
   - Finding customers
   - Understanding business numbers
   - Website/store work

3. **Where should Godseye work first?**
   - Telegram only
   - Website
   - Online store
   - Email
   - Social media

4. **What should we call your business space?**

5. **What should your first agent help with?**

Do not ask for API keys, domains, payment details, or complex configuration before the first useful experience.

---

## 4. THE BUSINESS SPACE

### Group setup after the user adds the bot

Godseye configures:

- Group title: `{Business Name} · Godseye`
- Group description: short explanation of the business and the agent
- Forum topics, if the group supports topics:
  - **Start Here**
  - **Tasks & Work**
  - **Customers**
  - **Content & Social**
  - **Numbers & Ideas**
  - **Files & Results**
  - **Settings**
- Welcome message
- Basic permissions
- User identity/owner mapping
- Agent role and business profile

### Why this sells

The group becomes visible proof that the product is alive:

- It has a name.
- It has a home.
- It has organized sections.
- It responds.
- It produces results.
- It can suggest the next move.

This is more persuasive than explaining twenty integrations on a webpage.

---

## 5. FIRST FREE DEMO TASKS

The first task must be fast, visible, and low-risk.

### Service professional

> “Write a friendly reply to a customer asking about my availability.”

### Store owner

> “Help me write a product description for this item.”

### Content creator

> “Give me three post ideas for this week.”

### General business

> “Look at what I told you about my business and suggest three things I should handle this week.”

### Website owner

> “Explain what Godseye could manage on my website.”

The free system can provide a draft, recommendation, or simulated workflow first. Actions that send messages, change prices, publish content, or alter a website should require connection and approval.

---

## 6. THE CONVERSION MOMENT

After the first useful result, Godseye should say:

> **That was the easy part. I can keep this business space active for you.**
>
> I can monitor your work, follow up with customers, prepare content, read your numbers, and bring in specialist agents when you need them.
>
> **Keep your agent on standby from $0.30 a day.**

Buttons:

- **Keep my agent working →** monthly plans
- **Buy focused work →** hour bundles
- **See what else it can handle →** use cases
- **Not now** → continue limited free mode

This makes payment feel like continuing something already useful, not buying an abstract promise.

---

## 7. WHAT PAYMENT UNLOCKS

Do not say only “more credits.” Explain the business benefit.

### Free

- Guided business setup
- Limited demonstration work
- One basic agent role
- Limited history and connections

### Starter — proposed $9/month

- One agent kept on standby
- Defined monthly work allowance
- One core business connection
- Basic proactive reminders and suggestions
- Telegram business space

### Pro — proposed $29/month

- Multiple specialist agents
- More included work
- Website/store/social/email connections
- Business insights and recurring reports
- More proactive monitoring

### Hour bundles

For customers who want a project completed without a monthly commitment:

- 1-hour trial
- 10-hour focused project
- 50-hour operations pack
- 100-hour agency/power-user pack

### Self-host

Separate premium path for people who want their own server, their own keys, and infrastructure control.

---

## 8. HOMEPAGE FLOW AFTER THIS DECISION

The homepage should not explain every configuration detail. It should sell the experience:

1. **Hero:** “Talk to your business agent. Get the work done.”
2. **Recognition:** “What do you need help with?”
3. **Demonstration:** show a Telegram conversation/result.
4. **Workspace:** show the organized business group.
5. **Autonomy:** show useful proactive suggestions.
6. **Fleet:** explain that the main agent can bring in specialists.
7. **Trust:** data, approvals, privacy, self-hosting.
8. **Price:** “Keep an agent on standby from $0.30/day.”
9. **CTA:** “Create my business space.”

### Homepage does not need

- A giant integration list
- Full technical documentation
- Every agent type
- Every pricing add-on
- Long explanation of Telegram commands
- Developer/self-host details above the first CTA

Those belong on inner pages.

---

## 9. INNER PAGE SYSTEM

### `/use-cases`

Answers: **“What can this do for someone like me?”**

Sections:

1. Choose your kind of work.
2. Choose the task that drains you.
3. See a sample Telegram conversation.
4. See the result Godseye produces.
5. Start a free business space.

Detail paths:

- `/use-cases/service-business`
- `/use-cases/store-owner`
- `/use-cases/content-social`
- `/use-cases/leads`
- `/use-cases/website`
- `/use-cases/personal-assistant`

Every page ends with **Create my business space → `/start`**, not “Learn more.”

### `/how-it-works`

Answers: **“What happens after I click?”**

Sections:

1. Choose a starting job.
2. Meet Godseye in Telegram.
3. Create/add the business group.
4. Godseye organizes the workspace.
5. Try a bounded task.
6. Connect tools only when useful.
7. Pay to continue and expand.

### `/features`

Answers: **“What can the system do once I am interested?”**

Organize features by outcomes:

- Get work done
- Stay organized
- Understand the business
- Grow the business
- Protect the business
- Add specialist help

### `/pricing`

Answers: **“Which way should I start?”**

Two choices only:

- **Keep an agent on standby**
- **Buy focused work**

Then show exact inclusions, limits, payment, cancellation, and what happens after purchase.

### `/security`

Answers: **“Can I trust this with my business?”**

Explain cloud, self-host, permissions, approvals, data isolation, and connection security honestly.

### `/docs`

For customers after they understand or buy:

- Start here
- Manage your business space
- Connect a website/store
- Add agents
- Billing and hours
- Self-hosting

### `/agency`

High-value page for multi-client operators. Keep away from the first-time customer path.

---

## 10. DESIGN SYSTEM RULES

Every page must use the same tokens and components:

```text
Background: #0A0A0A
Surface: #121212
Text: #F2F2F2
Muted text: rgba(255,255,255,0.60)
Gold: #C4A484
Borders: rgba(255,255,255,0.10)
Headings: Georgia, light weight
Body: existing system sans font
Buttons: rounded-full, same height, same tracking
Cards: rounded-2xl, same padding and border treatment
```

### Typography guardrails

- No page invents a different heading font.
- No page uses heavy block headings if the landing page uses light Georgia.
- No page uses different button shapes or uppercase rules.
- No page introduces a new color system.
- Shared `Layout`, `Button`, `Card`, `SectionHeading`, and `PriceCard` components should control visual consistency.

### Content guardrails

- One section = one job.
- One primary CTA per page.
- No repeated claim more than twice on one page.
- No unsupported “unlimited,” “never makes mistakes,” or “fully autonomous” claims.
- Do not show a price unless the checkout product matches it exactly.

---

## 11. THE COMPLETE CUSTOMER PATH

### Free path

```text
Landing page
  ↓ Create My Business Space
Telegram /start
  ↓ answer 3–5 questions
Choose a starting job
  ↓
Create group + add Godseye as admin
  ↓
Godseye configures the space
  ↓
One bounded free task
  ↓
Useful result + proactive suggestion
  ↓
Paid continuation offer
```

### Paid path

```text
Free result or pricing page
  ↓ Keep My Agent Working
Choose monthly plan or hour bundle
  ↓
Checkout modal
  ↓
Polar checkout
  ↓
Webhook confirmation
  ↓
Payment success page
  ↓
Open Telegram
  ↓
Account/payment linked to Telegram ID
  ↓
Existing business space upgraded
  ↓
More work, connections, monitoring, and agents unlocked
```

### Recovery paths

- Payment cancelled → return to selected plan.
- Payment pending → show confirmation-in-progress, do not charge again.
- Payment failed → retry same product.
- Telegram not connected → show link/code path.
- User has no group → guided group creation instructions.
- Bot not admin → explain exactly what permission is missing.
- User wants WordPress → connect it after the basic experience.

---

## 12. WHAT SHOULD BE BUILT FIRST

### First priority: prove the core experience

1. Make `/start` explain the free business-space experience.
2. Make the bot onboarding questions work.
3. Let the user create a group and add Godseye.
4. Make Godseye configure the group.
5. Deliver one safe free result.
6. Show the paid continuation button.

### Second priority: align the website

7. Rewrite homepage around the free-to-paid experience.
8. Rewrite pricing around standby vs focused work.
9. Rewrite Features around outcomes.
10. Build `/how-it-works` and `/use-cases`.
11. Unify typography and components.

### Third priority: revenue expansion

12. Specialist agent packs.
13. Agency management.
14. Self-hosting.
15. Learning center and SEO pages.

---

## FINAL RECOMMENDATION

**Do not sell Godseye as a library of explanations. Sell it as a business space that comes alive.**

The customer should be able to say:

> “I told it what I do, it helped organize my business, it did something useful, and now I understand why I would keep paying for it.”

That is the product demonstration. The website only needs to get them into that experience.
