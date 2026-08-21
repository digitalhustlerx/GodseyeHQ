# Graph Report - /root/godseye-repo  (2026-08-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 360 nodes · 555 edges · 31 communities (23 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fdf153c2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.js
- drip.ts
- rest.php
- server.ts
- App.tsx
- AccountPage.tsx
- types.ts
- wrong_answer_agent.py
- PRICING-DRAFT.ts
- god9-rewards-test.mjs
- prisma-hero.tsx
- god9-account-check.mjs
- god9-test.mjs
- GitHubContributions.tsx
- PricingPage.tsx
- onboarding-smoke.mjs
- polar-wire-benefit.sh
- tracker.js
- backup.sh
- deploy.sh
- godseye-site-guard.sh
- polar-webhook-guard.sh
- restore-seo-assets.sh
- wire-polar-webhook.sh

## God Nodes (most connected - your core abstractions)
1. `startServer()` - 22 edges
2. `handleCommand()` - 15 edges
3. `handleMessage()` - 14 edges
4. `getConfig()` - 11 edges
5. `api()` - 11 edges
6. `handleCallback()` - 10 edges
7. `flushDue()` - 9 edges
8. `enqueueDrip()` - 8 edges
9. `telegram()` - 8 edges
10. `setConfig()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `startServer()` --calls--> `enqueueDrip()`  [EXTRACTED]
  server.ts → src/lib/drip.ts
- `startServer()` --calls--> `flushDue()`  [EXTRACTED]
  server.ts → src/lib/drip.ts
- `startServer()` --calls--> `getConfig()`  [EXTRACTED]
  server.ts → src/lib/drip.ts
- `startServer()` --calls--> `setConfig()`  [EXTRACTED]
  server.ts → src/lib/drip.ts
- `startServer()` --calls--> `startDripWorker()`  [EXTRACTED]
  server.ts → src/lib/drip.ts

## Import Cycles
- None detected.

## Communities (31 total, 8 thin omitted)

### Community 0 - "index.js"
Cohesion: 0.08
Nodes (52): ACTION_PLAN_KYBD, activatedLicenses, answer(), api(), API_BASE_URL, BACK_TO_PLAN_KYBD, businessRooms, CHAT_MODE_KYBD (+44 more)

### Community 1 - "drip.ts"
Cohesion: 0.07
Nodes (42): afterClear, afterSet, afterSlip, cfgDefaults, ctx, db, e1, e3txt (+34 more)

### Community 2 - "rest.php"
Cohesion: 0.10
Nodes (22): godseye_bridge_defaults(), godseye_bridge_get_settings(), godseye_bridge_render_admin_page(), godseye_bridge_authorize_request(), godseye_bridge_capabilities(), godseye_bridge_connect_site(), godseye_bridge_create_page(), godseye_bridge_create_post() (+14 more)

### Community 3 - "server.ts"
Cohesion: 0.11
Nodes (29): ai, bridgeSecretMatches(), clearSession(), createSession(), DATA_DIR, db, ensureUserWorkspace(), FOUNDER_BONUS_TOKENS (+21 more)

### Community 4 - "App.tsx"
Cohesion: 0.07
Nodes (14): AGENT_PAGES, AgentPage(), AgentPageConfig, benefits, paths, features, AGENT_FLEET, AUDIENCES (+6 more)

### Community 5 - "AccountPage.tsx"
Cohesion: 0.15
Nodes (23): Layout(), WaitlistModal(), WaitlistModalProps, WaitlistSession, AccountData, getAccount(), getMe(), jsonFetch() (+15 more)

### Community 6 - "types.ts"
Cohesion: 0.11
Nodes (18): LivePlaygroundProps, WordPressDashboardProps, CREDIT_PACKS, INITIAL_WP_STATE, SAMPLE_COMMANDS, SELF_HOST_PLANS, TEMPLATES, ActiveView (+10 more)

### Community 7 - "wrong_answer_agent.py"
Cohesion: 0.24
Nodes (9): ask_voice(), _chat(), judge(), main(), Return list of (label, base_url, api_key, [models])., # NOTE: moonshotai/kimi-k2.6 and mistralai/mistral-large-2-instruct are, Ask one voice one question. Returns answer text or None on failure., One judge pass over all (question, truth, answer) triples for this voice. (+1 more)

### Community 8 - "PRICING-DRAFT.ts"
Cohesion: 0.22
Nodes (8): AddOn, ADDONS, FREE_TIER, HOUR_BUNDLES, HourBundle, MONTHLY_HIRES, MonthlyHire, REFERRAL

### Community 9 - "god9-rewards-test.mjs"
Cohesion: 0.31
Nodes (8): check(), main(), require, results, server, SERVER_CJS, waitReady(), work

### Community 10 - "prisma-hero.tsx"
Cohesion: 0.25
Nodes (4): navItems, Segment, WordsPullUpMultiStyleProps, WordsPullUpProps

### Community 11 - "god9-account-check.mjs"
Cohesion: 0.25
Nodes (7): db, inv, require, rRef, server, SERVER_CJS, work

### Community 12 - "god9-test.mjs"
Cohesion: 0.32
Nodes (7): check(), main(), results, server, SERVER_CJS, waitReady(), work

### Community 13 - "GitHubContributions.tsx"
Cohesion: 0.29
Nodes (7): ContributionDay, GitHubContributions(), GitHubContributionsProps, LEVEL_COLORS, monthName(), ResponseData, WEEKDAY_LABELS

### Community 14 - "PricingPage.tsx"
Cohesion: 0.29
Nodes (6): Cell, COMPARISON_ROWS, CREDIT_PACKS, FAQ, PricingPage(), renderCell()

### Community 15 - "onboarding-smoke.mjs"
Cohesion: 0.47
Nodes (4): api(), check(), main(), results

## Knowledge Gaps
- **127 isolated node(s):** `WordsPullUpProps`, `Segment`, `WordsPullUpMultiStyleProps`, `navItems`, `HourBundle` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PRICING_PLANS` connect `AccountPage.tsx` to `App.tsx`, `types.ts`, `PricingPage.tsx`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `startServer()` connect `server.ts` to `drip.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `WordsPullUpProps`, `Segment`, `WordsPullUpMultiStyleProps` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07547169811320754 - nodes in this community are weakly interconnected._
- **Should `drip.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06938775510204082 - nodes in this community are weakly interconnected._
- **Should `rest.php` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._
- **Should `server.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11264367816091954 - nodes in this community are weakly interconnected._