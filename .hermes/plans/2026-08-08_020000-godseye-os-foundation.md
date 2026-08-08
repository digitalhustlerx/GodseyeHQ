# Godseye OS Foundation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn Godseye into a clear, no-screen business/life management platform with secure account connections, persistent hosted workspaces, reusable agents, transparent plans, and an implementation path from the current VPS to stronger isolation.

**Architecture:** Keep Telegram as the primary operating surface and the web UI as the visual control center for billing, connections, permissions, usage, outputs, and optional visualizations. Treat each customer as an isolated workspace with explicit account/connection states, server-held credentials, scoped capabilities, persistent memory stored outside the agent runtime, and approval-gated side effects. Keep provider/API complexity behind Godseye’s managed routing layer; expose only plain-language outcomes to customers.

**Tech Stack:** Existing React/Vite/Express/TypeScript app, static SEO blog, Telegram bot, SQLite/current backend, WordPress bridge, existing billing/waitlist flow; add schema-backed entitlements, encrypted secrets, connection adapters, audit events, quotas, background jobs, and restricted worker/container execution only when required.

---

## 1. Product decisions to lock before implementation

### Canonical product language

- **Godseye** = company and customer-facing brand.
- **Godseye OS** = the platform layer: the customer’s personal/company operating environment.
- **Godseye Agent** = the primary conversational worker.
- **Specialist agents** = website manager, store manager, customer support, content manager, social analyst, personal/life manager, etc.
- **Connections** = linked accounts/resources.
- **Skills** = reusable know-how and behavior.
- **Tasks** = one-off work.
- **Automations** = recurring or event-triggered work.
- **Workspace** = the customer’s private business/life environment.
- **HQ chat** = optional Telegram topic/group area for notices, reminders, approvals, and operational updates.

Avoid exposing: isolate, worker, container, Durable Object, Gatekeeper, MCP, orchestrator, token routing, VPS, model fleet, and internal infrastructure on the primary marketing surface. Use these terms only in technical documentation, security pages, or enterprise/self-hosting material.

### Product promise

> **Godseye OS is the no-screen operating layer for running your business and life through one trusted conversation.**

Customer-facing version:

> Connect the tools you already use. Tell Godseye what needs to happen. It remembers, follows up, and keeps important actions under your control.

Do not position Godseye as a software-building company. Position it as a **business and life management company powered by software and agents**. Generated apps/custom tools can be a later add-on, not the first identity.

### Commercial recommendation

Use one central `/pricing` page. Make the middle plan the default recommendation. Charge for persistent availability, managed routing, workspace scope, automation capacity, connected resources, team sharing, and support—not for arbitrary jargon-heavy features.

Recommended initial ladder (prices require owner approval before implementation):

| Plan | Purpose | Recommended limits/capabilities |
|---|---|---|
| Free Preview | Experience the product safely | Demo workspace, sample data, guided Telegram conversation, no real credentials, no live business execution |
| Personal/Starter | One person, one important system | One workspace, one primary connection, basic agent, one active automation, summaries/drafts, approval-first live work |
| Growth/Business | Run the business | Multiple connections/sites, website management, store management, customer support workflows, social analytics/integration, more automations, shared partner/team access, managed model routing |
| Scale/Implementation | Teams, agencies, and enterprise | More users/workspaces, shared skills, custom integrations, advanced permissions, higher limits, implementation services, optional dedicated environment/self-hosting |

Proposed price anchor to validate: approximately `$9–12` Starter and `$19–29` Growth, with Scale/custom. Do not publish conflicting prices; resolve the existing pricing schemes first.

Social media should be a Growth differentiator, but third-party API/developer charges must be labelled and paid by the customer. Do not promise Godseye absorbs X/Twitter or other provider billing.

---

## 2. Target architecture

```text
Telegram / optional web UI / API clients
                    |
             Identity + entitlements
                    |
            Godseye workspace boundary
        _________/    |       \_________
       /              |        \
Connections      Memory/state    Usage/billing
(OAuth/secrets)  (DB/files)      (credits/quotas)
       |              |             |
   Scoped tools   Agent context   Approval policy
       \______________|_____________/
                      |
             Task/automation router
              /        |          \
        simple code  agent work   scheduled jobs
                      |
             approval + audit events
                      |
              provider/API adapters
```

### Security model

- Never collect real credentials before entitlement checks.
- Store provider secrets server-side, encrypted at rest, with key material outside the database where possible.
- Expose typed, narrow actions to agents; never give agents raw API keys.
- Default every new connection to least privilege and read-only where possible.
- Require confirmation for sending, publishing, deleting, refunds, purchases, price changes, permission changes, and destructive site actions.
- Every connection, action, approval, denial, failure, and disconnect creates an audit event.
- Separate tenant/workspace IDs in every database row, file path, job, memory record, and log query.
- Do not run generated/untrusted code in the main Node process.
- Use a temporary restricted process/container for risky code only after the threat model and limits are documented.
- Add backups, restore tests, secret rotation, revoke/disconnect flows, and incident procedures before onboarding real paying customers.

### Workspace/file layout

Do not treat the filesystem as the only authorization system. Use database ownership and authorization first, then filesystem permissions as defense in depth.

```text
/data/godseye/
  tenants/<tenant_id>/
    workspace/<workspace_id>/
      files/
      outputs/
      imports/
      exports/
      temp/
    logs/                 # non-secret operational logs
    backups/              # encrypted/controlled backups
/secrets/                 # encrypted provider material; never agent-readable
```

Use opaque IDs, not customer email or brand names, in paths. Resolve customer-facing names through authorized database lookups.

---

# Phase 0 — Safety baseline and project control

**Outcome:** A safe implementation boundary exists before new integrations or ports are introduced.

### Task 0.1: Read the current source-of-truth documents

**Files:** `AGENTS.md`, `GODSEYE-PRODUCT-STANDARD.md`, `PRD.md`, `HANDOFF.md`, `COST-MODEL.md`, `src/pages/PricingPage.tsx`, `src/components/WaitlistModal.tsx`, `telegram-bot/src/index.js`, `server.ts`.

- Reconcile conflicts before coding.
- Treat `GODSEYE-PRODUCT-STANDARD.md` as the current entitlement/onboarding baseline unless explicitly superseded.
- Record decisions in `TRACKER.md`.

### Task 0.2: Perform the required port and runtime scan

Run before assigning any new port:

```bash
ss -tlnp
docker ps --format 'table {{.Names}}\t{{.Ports}}'
grep "port:" /root/.port-registry.yml
```

Do not assign a new port until all three outputs are reviewed. Register any new port in `/root/.port-registry.yml` before starting a service. Prefer existing ports and in-process/background jobs to avoid unnecessary services.

### Task 0.3: Create the project tracker

**Create:** `TRACKER.md`

Include:

- Current milestone and owner
- Phase/task checklist
- Progress log
- Decision log
- Blockers
- Next actions
- Links to the canonical pricing and product documents

### Task 0.4: Create the session watcher before the implementation sprint

**Create:** `scripts/session-watcher.py`, `session-logs/`

The watcher must read `TRACKER.md` and write timestamped checkpoints to `session-logs/YYYY-MM-DD.md`. Use it for sessions expected to last 30+ minutes or create 5+ files.

### Task 0.5: Commit only planning/control documents

Expected verification:

```bash
npm run lint
npm run build
```

Commit message:

```bash
git add TRACKER.md scripts/session-watcher.py session-logs .hermes/plans/
git commit -m "docs: establish Godseye OS implementation control"
```

Do not mix unrelated existing working-tree changes into this commit.

---

# Phase 1 — Product and pricing source of truth

**Outcome:** Every surface describes one product and routes commercial actions to one pricing page.

### Task 1.1: Write the Godseye OS product brief

**Create:** `docs/GODSEYE-OS-PRODUCT-BRIEF.md`

Document:

- Product promise
- Target users: solo operators, couples/partners, small teams, agencies, implementation customers
- No-screen philosophy
- WordPress-first activation
- Business/life management expansion boundary
- Terminology map
- What is hidden from customers
- What is never promised
- Differentiation from Cloudflare OS and generic chatbots

### Task 1.2: Write the canonical pricing specification

**Create:** `docs/PRICING-SOURCE-OF-TRUTH.md`

For each plan define:

- Monthly price
- Workspace count
- Account/user count
- Site count
- Connection count
- Active automations
- Agent actions/credits
- History/memory retention
- Social capabilities
- Customer support capability
- API access
- Custom agent/add-on eligibility
- Third-party cost disclosure
- Upgrade/downgrade behavior
- Grace period and suspension behavior

Use “people/users” to mean individuals sharing a workspace. A partner plan should explicitly include two named users and shared workspace memory, subject to per-user privacy controls. Team plans should define 4–5 seats rather than vaguely saying “multiple users.”

### Task 1.3: Reconcile current pricing code and legacy pricing documents

**Modify after approval:**

- `src/pages/PricingPage.tsx`
- `src/mockData.ts` if plan data is duplicated there
- `src/pages/AccountPage.tsx` where plan entitlements are displayed
- `src/components/WaitlistModal.tsx` if CTA/offer copy conflicts
- `src/pages/LandingPage.tsx`, `src/pages/FeaturesPage.tsx`, `src/pages/TemplatesPage.tsx`
- `dist/godseye-tiers.html` source counterpart if customer-facing
- `GODSEYE-TIER-MATRIX.md`, `COST-MODEL.md`, `GODSEYE-PRODUCT-STANDARD.md`

Remove or clearly archive the competing pricing schemes. The Pro/Growth price must never be blank.

### Task 1.4: Standardize CTA routing

All conversion CTAs should have one destination map:

- `Start free on Telegram` → Telegram `/start`
- `See Pricing` / `View Plans` / `Get Started` → `/pricing`
- `Join the Waitlist` → waitlist modal only while the product is waitlist-gated
- `Explore use cases` → templates/use-case page
- `Read the guide` → relevant blog article
- `Connect a real account` → entitlement-aware onboarding

Add a route-level test or static audit so no pricing CTA points to multiple obsolete destinations.

### Task 1.5: Add the central pricing FAQ and cost disclosures

Explain in plain language:

- Subscription pays for the managed workspace, availability, routing, memory, and included work.
- AI usage is governed by the plan’s included allowance and visible limits.
- Third-party API/developer charges remain the customer’s responsibility.
- Social accounts may require approval/billing from the platform.
- Upgrading adds scope/capacity; it does not secretly transfer account ownership.

Validation:

```bash
npm run lint
npm run build
```

Manual checks: direct `/pricing`, all homepage/feature/blog CTAs, mobile layout, waitlist state, referral state, and back-button behavior.

---

# Phase 2 — Identity, workspace, and entitlement model

**Outcome:** Every customer has an explicit account, workspace, plan, and connection state.

### Task 2.1: Inventory current persistence and schema

**Inspect/modify:** `server.ts`, `src/types.ts`, database initialization/migrations, existing waitlist/purchase tables.

Document current tables, indexes, auth assumptions, and where plan entitlement is currently derived. Do not add duplicate entitlement logic.

### Task 2.2: Add tenant/workspace/seat entities

**Create or modify:** the existing migration location; use a new timestamped migration rather than editing applied migrations.

Minimum entities:

- `tenants` / accounts
- `workspaces`
- `workspace_members` with roles: owner, admin, member, viewer
- `plans`
- `subscriptions`
- `entitlements`
- `usage_counters`
- `connections`
- `approval_policies`

Every tenant-owned table needs a tenant/workspace foreign key and indexes for the normal authorization query.

### Task 2.3: Define privacy behavior for partner/team workspaces

Document and test:

- Shared business memory visible to workspace members according to role.
- Personal memory private by default.
- Shared connection access is explicit.
- Owner can revoke a member without deleting shared business assets.
- Private messages are not silently exposed to partners.

### Task 2.4: Implement entitlement checks before credential collection

Use the existing states from `GODSEYE-PRODUCT-STANDARD.md`:

- `preview`
- `checkout_pending`
- `active`
- `grace_period`
- `suspended`
- `cancelled`
- `self_hosted`

Connection states:

- `unconnected`
- `awaiting_subscription`
- `pending_verification`
- `connected`
- `paused`
- `revoked`

The check must happen before accepting a real credential, API key, or OAuth authorization request.

### Task 2.5: Add entitlement tests

Test:

- Preview cannot submit real credentials.
- Checkout pending cannot execute live work.
- Active can connect only resources permitted by plan.
- Grace period is read-only or policy-defined.
- Suspended/cancelled cannot execute.
- Self-hosted follows the separate licence path.

Run the project’s existing test/lint/build commands and record results in `TRACKER.md`.

---

# Phase 3 — Secure connections and managed provider access

**Outcome:** Users connect accounts through a labelled, queryable, revocable system without exposing raw keys to agents.

### Task 3.1: Build the connection registry specification

**Create:** `docs/CONNECTION-REGISTRY-SPEC.md`

For each provider/resource define:

- Stable provider key (`google_gmail`, `wordpress_site`, `x_social`, etc.)
- Human label
- Category
- OAuth/API-key method
- Required scopes
- Read actions
- Write actions
- Destructive actions
- Platform-owned costs
- Godseye plan requirement
- Verification method
- Disconnect/revoke behavior
- Data retention behavior

The stable key is what lets the user ask, “What accounts do I have connected?” and receive a reliable answer.

### Task 3.2: Create server-side secret handling

**Create/modify:** `server.ts` or a dedicated backend module under `src/lib/`.

Rules:

- Never log secrets.
- Never return secrets to React, Telegram, or the model.
- Encrypt secrets before persistence.
- Use a key supplied by environment/secret management, never committed.
- Store only provider metadata and an opaque secret reference in normal application rows.
- Provide rotation and revocation paths.
- Fail closed if encryption configuration is absent in production.

Add a development-only fixture path that uses fake credentials, never production keys.

### Task 3.3: Add scoped adapter interfaces

Define a common adapter contract:

```ts
interface ConnectionAdapter {
  providerKey: string;
  verify(connectionId: string): Promise<VerificationResult>;
  listCapabilities(): CapabilityDefinition[];
  execute(input: ScopedActionInput): Promise<ScopedActionResult>;
  revoke(connectionId: string): Promise<void>;
}
```

Adapters receive an authorized connection reference and approved capability, not raw credentials.

### Task 3.4: Implement WordPress as the first complete adapter

Use the existing bridge contract:

- `wp-plugin/godseye-bridge/godseye-bridge.php`
- `wp-plugin/godseye-bridge/includes/rest.php`
- `server.ts`

Expose human capabilities:

- Website management
- Content publishing/drafts
- Store management
- Site health
- Customer support via approved message channels

Do not market “WooCommerce Summary” as a top-level capability; call it **Store Management**.

### Task 3.5: Implement a safe Google/Gmail read-only connection next

Before requesting send permissions:

- Connect one account/workspace.
- Request minimum read scopes.
- Support summaries, search, and task extraction.
- Add approval before sending.
- Add disconnect verification through the provider’s security page.

### Task 3.6: Define social connection as a paid-capability/add-on boundary

Social capabilities should be represented separately from the base connection:

- Analytics/read-only
- Drafting
- Scheduling
- Publishing
- Messaging

Growth may include a defined social allowance. High-volume publishing, extra profiles, or advanced analytics can be an add-on. The UI must show third-party API/developer charges before authorization.

### Task 3.7: Add connection lifecycle tests

Test:

- Label and query by stable provider key.
- Scope denial blocks action.
- Disconnect revokes action immediately.
- Secret never appears in logs/API responses/model context.
- Plan downgrade pauses disallowed capabilities without deleting user data.
- Reconnect creates a new auditable authorization event.

---

# Phase 4 — Agent behavior, memory, tasks, and automations

**Outcome:** Godseye feels like one remembered entity while internally routing work safely.

### Task 4.1: Define memory layers

**Create:** `docs/MEMORY-AND-DATA-BOUNDARIES.md`

Define:

- Personal memory
- Workspace/business memory
- Connection metadata
- Task state
- Automation configuration
- Conversation history
- Temporary execution data
- Audit records

State who can read each layer and how a member can delete/export it.

### Task 4.2: Add first-class tasks

A task needs:

- Owner/workspace
- Natural-language title
- Status
- Due time/timezone
- Reminder policy
- Optional connection/resource
- Agent instructions
- Completion evidence
- Stop/pause controls

The user should be able to say: “Remind me every weekday at 9 to check the pending tasks,” and the system should create a visible task/automation rather than an invisible promise.

### Task 4.3: Add automations with explicit limits

Use plan limits such as:

- Free preview: none on real accounts
- Starter: one active automation
- Growth: several active automations
- Scale: higher/custom limits

Each automation must have:

- Name
- Trigger/schedule
- Action scope
- Connection scope
- Budget/usage policy
- Last run
- Next run
- Recent result
- Pause/stop control

### Task 4.4: Add safe follow-up behavior

The agent may nudge the user until:

- Task is completed
- User says stop
- Due date expires
- User pauses the automation
- Plan/connection becomes inactive

Never create indefinite noisy reminders without a visible stop control.

### Task 4.5: Add deterministic execution behind plain language

Customer-facing phrase: **“Godseye handles the routine work.”**

Internal implementation:

- Use direct code for predictable reads/writes.
- Use model reasoning only for ambiguity or synthesis.
- Cache/reuse stable context.
- Start a new session/context when an unrelated task begins.
- Track cost and completion evidence.

Do not expose “deterministic workflow” as the primary marketing term.

### Task 4.6: Add usage meter and fair limits

Track separately:

- Agent reasoning usage
- Provider/API calls
- Scheduled runs
- Storage usage
- Automation count
- Active connections
- Agent/task count

Show a human-facing usage bar with plain labels. Define overage, pause, or upgrade behavior before customers hit a silent wall.

---

# Phase 5 — User-facing control center and no-screen experience

**Outcome:** Telegram remains the daily interface while the web UI makes control and safety easy.

### Task 5.1: Define the Telegram first-run journey

Conversation sequence:

1. Welcome and plain-language promise.
2. Ask whether the user is managing personal work, a business, a store, or a team.
3. Ask for the first outcome they want.
4. Create preview workspace.
5. Show safe demo.
6. Explain the paid boundary before real connection.
7. Route to pricing/checkout when they choose live work.
8. After payment, return to guided connection setup.
9. Confirm scope and first safe action.
10. Offer one starter task and one optional automation.

### Task 5.2: Build the connection center

**Modify/create:** React page under `src/pages/` and supporting components.

Show:

- Connected account label
- Provider/resource
- Current scope
- Last verified time
- Last used time
- Plan/add-on requirement
- Pause
- Disconnect
- Reconnect
- View activity

Do not show raw keys or internal infrastructure.

### Task 5.3: Build approvals and activity history

Show:

- Proposed action
- Affected account/resource
- What will change
- Who/what requested it
- Approve
- Reject
- Approve once / always for this narrow action
- Result and timestamp

### Task 5.4: Add optional HQ chat/topic setup

Offer a guided setup for an optional Telegram HQ space/topic:

- Morning summary
- Pending approvals
- Automation results
- Failed connection alerts
- Usage notices
- Stop/mute controls

Do not force users into a complex Telegram group if a private chat is enough.

### Task 5.5: Add visualizations only as optional control surfaces

A dashboard, graph, account map, or workspace map is secondary. It should help users understand activity and permissions, not become required for normal operation.

---

# Phase 6 — Customer-created agents and API access

**Outcome:** Introduce platform extensibility only after core safety, entitlements, and usage accounting work.

### Task 6.1: Define the custom-agent product boundary

**Create:** `docs/CUSTOM-AGENTS-AND-API-SPEC.md`

A customer-created agent must have:

- Name/description
- Owner/workspace
- Allowed connections
- Allowed capabilities
- Memory scope
- Budget
- Rate limit
- Approval policy
- Brand/voice settings
- Logs
- Pause/delete controls

Do not initially allow unrestricted customer code execution.

### Task 6.2: Define API access as a paid add-on or Scale capability

API access should include:

- API key creation/revocation
- Scoped project/workspace access
- Per-key rate limits
- Usage reporting
- Webhook/event subscriptions
- Budget/credit policy
- Documentation and examples

Never expose internal provider keys through the customer API.

### Task 6.3: Define the agent marketplace/reseller path separately

Long-term business model:

- Customer builds an agent template.
- Customer sets their own service price.
- Godseye charges platform/infrastructure/API usage fees.
- Customer controls branding and customer-facing instructions within policy.
- Godseye retains platform safety, billing, abuse monitoring, and provider terms.

Do not build revenue sharing until the hosted core has stable metering, abuse controls, terms, refunds, and support processes.

### Task 6.4: Add API and custom-agent tests

Test:

- Key scope cannot cross workspaces.
- Revoked key fails immediately.
- Budget/rate limits are enforced.
- Agent cannot use undeclared connections.
- Private memory is not exposed to shared agents.
- Usage is attributed to the correct owner/workspace.

---

# Phase 7 — Open-source, content, and implementation services

**Outcome:** Open source creates trust and attention without exposing the commercial moat.

### Open-source candidates

Open source:

- Connection/permission concepts and educational examples
- Agent prompt/skill templates
- Safe onboarding guides
- Blog guides and documentation
- Example WordPress bridge patterns
- Local demo workspace
- Non-sensitive CLI/API client
- Generic task/automation schemas
- Security checklists
- Voice-input workflow guides

Keep private or commercial:

- Managed routing and model selection logic
- Provider credentials and secret handling
- Abuse detection
- Customer isolation operations
- Billing/metering infrastructure
- Internal orchestration and prioritization
- Proprietary memory/behavior tuning
- Production deployment automation
- Customer-specific implementation playbooks

### Content series

Create a structured content map:

1. Godseye OS explained without jargon
2. Why a personal agent is different from a chatbot
3. Connect Gmail safely
4. Connect WordPress and manage a site by message
5. Store Management through conversation
6. Customer support that can act
7. Social analytics and why API costs are separate
8. Create your first useful automation
9. How to save tokens with fresh sessions
10. How Godseye remembers and follows up
11. How to run a business from voice notes
12. Partner workspace: two people, one shared operating environment
13. Build your own personal agent
14. How to analyse your own data instead of handing it all to platforms
15. What Godseye does not access by default
16. Godseye for solo operators
17. Godseye for couples/partners
18. Godseye for agencies
19. Godseye implementation for companies
20. Voice-input tools and no-screen workflows

### Newsletter recommendation

Use a dedicated **Godseye publication** for product, agent, and business-operation content. Cross-post selected founder notes to the personal Substack rather than making the company publication dependent on a personal brand. Keep the founder voice visible, but preserve Godseye as an owned media asset.

### Implementation services

Offer enterprise/implementation work as a separate commercial path:

- Workflow mapping
- Integration setup
- Permission design
- Shared skills/context
- Team onboarding
- Reporting and governance
- Custom agents
- API integration

Do not expose VPS details in marketing. Sell “managed operating environment,” “private workspace,” or “implementation,” depending on the actual entitlement.

---

# Phase 8 — Infrastructure growth and isolation

**Outcome:** Grow from one controlled VPS to separate customer capacity without pretending the first architecture is enterprise isolation.

### Stage A: Personal/dev VPS

- Keep development and personal experiments separate from paying customer data.
- Remove unused services.
- Enable host firewall, SSH hardening, automatic security updates, monitoring, backups, and alerting.
- Keep secrets out of repositories and logs.

### Stage B: First paying customer VPS

- Dedicated customer environment or a clearly isolated production namespace.
- Separate database, uploads, secrets, logs, and backups.
- Document capacity and recovery procedures.
- Monitor CPU, RAM, disk, I/O, database size, job queue, API errors, and model spend.
- Define the threshold for provisioning another VPS.

### Stage C: Multi-customer hosting

- Per-tenant authorization at every request.
- Per-tenant job queues and budgets.
- Separate encryption/key strategy.
- Restricted execution for risky jobs.
- Tested backup/restore and incident response.
- Capacity model based on real observed usage, not guesses.

Do not claim “your own computer in the cloud” unless the plan actually provides a private environment. For standard plans say “your private Godseye workspace.” Reserve dedicated/private infrastructure claims for a verified Scale/implementation offering.

---

# Phase 9 — Metrics, ads, and commercial experiments

### Metrics to expose publicly

Use honest, non-sensitive aggregate signals:

- Workspaces active
- Tasks completed
- Automations running
- Connections supported
- Guides published
- Uptime/service status

Avoid fake scarcity or unverifiable financial/usage claims. Do not expose customer data, exact token spend, or detailed infrastructure topology.

### Ads recommendation

Do not put ads in the paid product or Telegram experience now. Ads would weaken the trusted personal-agent relationship and create privacy concerns. Revisit only for a genuinely free, clearly labelled educational/free tier, with strict non-intrusive placement and no use of private customer data for targeting.

Prioritize subscription revenue, add-ons, API/platform revenue, and implementation services first.

---

# Phase 10 — Release and validation gates

Before accepting real customer data:

- [ ] One pricing source of truth published.
- [ ] Entitlement gate occurs before credential collection.
- [ ] Secrets encrypted and absent from logs/model context.
- [ ] Tenant/workspace authorization tests pass.
- [ ] Disconnect/revoke works.
- [ ] Approval flow works for high-impact actions.
- [ ] Usage limits and upgrade behavior are visible.
- [ ] Backup and restore tested.
- [ ] Monitoring and alerts active.
- [ ] Security review completed.
- [ ] Privacy/terms/refund language reviewed.
- [ ] Production data separated from personal/dev data.
- [ ] Live pricing and onboarding paths tested on mobile and Telegram.
- [ ] All customer-facing copy avoids unsupported infrastructure promises.

Run:

```bash
npm run lint
npm run build
npm run test:drip
bash scripts/deploy.sh
```

Then verify:

- `/`
- `/pricing`
- `/blog/`
- `/blog/connect-your-accounts-to-an-ai-agent/`
- `/blog/save-tokens-with-fresh-agent-sessions/`
- Telegram `/start`
- Preview → pricing → paid → connection
- Connection → approval → action → audit event
- Pause/disconnect/reconnect
- Upgrade/downgrade/grace/suspension behavior

---

# Risks and decisions requiring explicit approval

| Risk/decision | Recommendation |
|---|---|
| Rename everything to Godseye OS immediately | Do not perform a wholesale rename first; introduce Godseye OS as the platform layer and migrate wording gradually. |
| Let users run arbitrary generated code on the VPS | No; use restricted containers only after a threat model. |
| Put all customer data in files | No; database authorization first, files as controlled storage. |
| Accept API keys in Telegram | No; route users to a secure web/OAuth flow or server-side labelled secret vault. |
| Give every plan social publishing | No; include social analytics/basic capability in Growth and gate higher-volume/publishing features deliberately. |
| Add a partner plan | Yes; define two named members, shared business workspace, private personal memory, and shared usage policy. |
| Allow unlimited agents | No; cap active agents/tasks/automations by plan and enforce budgets. |
| Add ads now | No; protect trust and focus on subscription/add-on revenue. |
| Sell a “private cloud computer” | Only for verified dedicated/private infrastructure tiers. |
| Build marketplace now | No; document the future reseller model and ship core agent/API safety first. |
| Dedicated Godseye newsletter or founder Substack | Use a dedicated Godseye publication, with selected cross-posts to the founder publication. |

---

# Definition of done for the first implementation sprint

The sprint is complete when:

1. Product vocabulary and pricing are approved in source-of-truth documents.
2. `/pricing` is the only pricing destination.
3. Preview users cannot submit real credentials.
4. Active users can connect WordPress through a labelled, auditable flow.
5. Secrets are never returned to clients, logs, or models.
6. One safe task and one automation can be created, viewed, paused, and stopped.
7. Usage is visible and plan limits are enforced.
8. A partner/team workspace model is documented and tested.
9. The Telegram-first onboarding path is coherent.
10. The live deployment passes build, route, and security validation.
11. Public copy sells the outcome and trust, not internal infrastructure jargon.
12. The next isolation/infrastructure step is based on observed usage metrics.

**Plan status:** Ready for review; no implementation performed in plan mode.

**Recommended execution method:** Implement Phase 0 and Phase 1 first using fresh sessions per task; review entitlement and secret-handling changes before adding new integrations or custom-agent APIs.

> Plan complete and saved. Ready to execute using subagent-driven-development — dispatch a fresh subagent per task with spec-compliance and code-quality review after each task.

---

## Research sources

- Cloudflare OS official announcement: https://blog.cloudflare.com/cloudflare-os/
- Cloudflare OS repository: https://github.com/cloudflare/cloudflare-os
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers architecture: https://developers.cloudflare.com/workers/reference/how-workers-works/
- Cloudflare workerd: https://github.com/cloudflare/workerd
- Existing Godseye source-of-truth: `GODSEYE-PRODUCT-STANDARD.md`
- Existing onboarding and pricing code: `src/pages/PricingPage.tsx`, `src/components/WaitlistModal.tsx`, `telegram-bot/src/index.js`

## Current known repository conditions

The working tree already contains unrelated modified/untracked files. Before implementation, separate intentional changes from prior work; do not blanket-add the repository. Existing static blog additions should be reviewed and committed separately from the product/security sprint.

## Prompting/continuity recommendation

For each future implementation session, start with a fresh context and provide:

- The exact phase/task
- The relevant file paths
- Current acceptance criteria
- What must not change
- Verification commands
- The handoff/commit from the prior task

Use `/new` between unrelated tasks to reduce context drift and token waste.

## Review checklist for this plan

- [ ] No user credentials/API keys are requested in chat.
- [ ] Secret storage and OAuth flows are explicit.
- [ ] Entitlements precede connection collection.
- [ ] Plan restrictions are tied to real costs/complexity.
- [ ] Partner/team privacy is explicit.
- [ ] No-screen UX remains the default.
- [ ] Browser UI is a control plane, not a requirement for daily work.
- [ ] Open-source boundary protects the commercial moat.
- [ ] Ads are deferred.
- [ ] Infrastructure claims match actual deployment.
- [ ] First sprint is small enough to execute and verify.

## Next action after approval

Implement **Phase 0, Tasks 0.1–0.5**, then stop for a review before modifying pricing or credential-handling code.

Do not begin custom agents, API monetization, marketplace, voice product, or customer multi-tenancy until the Phase 0–3 security and entitlement foundations are approved.

---

## Execution handoff

**Plan complete and saved. Ready to execute using subagent-driven-development — I’ll dispatch a fresh subagent per task with two-stage review (spec compliance, then code quality). Shall I proceed?**

---

*End of plan.*
