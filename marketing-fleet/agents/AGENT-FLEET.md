# AUTONOMOUS AGENT FLEET

> The operational layer that RUNS the marketing fleet. Each agent = one purpose, one cron, pinned to `deepseek-v4-flash` (opencode-go provider).
> Model pin guidance changes — ALWAYS check the `hermes-cron-models` skill before creating/updating cron jobs.
> Build on the worked example: skill `autonomous-marketing-agent` → `references/godseye-leadgen-system.md`.

---

## THE FLEET

| # | Agent | Cadence | Job | Writes to | Chat ping |
|---|-------|---------|-----|-----------|-----------|
| 1 | **Lead Scout — Reddit** | daily | Scan Reddit for ICP buying signals | `/srv/godseye-leads/leads.tsv` | top-3 |
| 2 | **Lead Scout — HN + WP.org forums** | daily | Same ICP on HN Algolia + WP.org "custom-link" pain | `/srv/godseye-leads/leads.tsv` | top-3 |
| 3 | **Lead Synthesizer** | every 6h | Read TSV, dedup, score, turn newest into pitch pack | — | ≤5 report |
| 4 | **Social Poster** | every 4h | Draft platform-appropriate content (X/LinkedIn/Shorts) | `content/calendar` | draft post |
| 5 | **Competitor Scout** | every 24h | Track Polsia.com + WP/AI competitors, surface gaps | `analytics/competitor-updates/` | shifts only |
| 6 | **Content Idea Engine** | every 24h | SEO + thread + short ideas from pain points | `content/ideas/` | top 3 |
| 7 | **Self-Evaluator** | every 6h | QA the site/offers, flag broken things | `analytics/qa-reports/` | issues only |

**Shared lead DB schema** (works without a service — plain TSV):
```
/srv/godseye-leads/
├── AGENTS.md            # ICP, buying signals, scoring rubric, output format
├── leads.tsv            # date \t source \t score \t avatar \t handle_or_url \t quote \t pitch_angle
├── dedup.tsv            # handle_or_url \t source \t seen_date (checked before adding)
└── last_run_state.json  # angle rotation
```

---

## ICP (shared contract every scout references)
**Who we're hunting:** solopreneurs, indie hackers, new/bootstrap founders, non-technical WordPress site owners, people who want into web-building but are drowning in WP maintenance, people who explicitly *don't want to hire a developer*.

**Buying signals (last ~30 days):**
- "how do I build/manage a website"
- "WordPress too hard / keeps breaking / plugin hell"
- "I don't want to hire a dev"
- "AI tool to maintain/update my site"
- "I can't keep my blog/portfolio/store updated"
- "Wix/Squarespace too expensive"
- **HOT signal:** complaint + they paste their LIVE site URL (WP.org support forums = prime surface)

**Scoring:** HOT = strong ICP + explicit buying signal + public handle/URL. WARM = ICP fit + softer signal. COLD/SKIP = loose/anonymous/spam/customer.

---

## RESILIENT SOURCE RECIPES (zero-credit, beat Firecrawl 402s)
```bash
# HN Algolia — full text, last 30d
curl "https://hn.algolia.com/api/v1/search?query=<terms>&tags=story,comment&numericFilters=created_at_i><$(date -d '30 days ago' +%s)"
# Ask HN:
curl "...&tags=ask_hn..."

# WordPress.org forums — search (owners paste live site URLs while complaining)
curl -A "Mozilla/5.0" "https://wordpress.org/support/search/?query=<terms>"
```

---

## DELIVERY
- Lead-gen reports → the GodseyeHQ **Marketing & Growth** topic (thread 465). Verify thread ID before wiring.
- **Quiet-by-default:** scouts write TSV (primary job) and stay SILENT in chat when nothing new/hot. Persist = the job; the ping is bonus.
- **Cap ≈5 leads**, lead with the single best HOT lead.

---

## PITFALLS (hard-won on this VPS)
- **Every cron pinned to `deepseek-v4-flash`** via opencode-go. Unpinned jobs fail on config drift. Check `hermes-cron-models` skill for current name.
- **Reddit = bot-blocked from cron.** Needs residential/proxy IP. Use proxy or manual.
- **X API = credits depleted** (shared app). Use xurl oauth2 from local PC.
- **LinkedIn = interactive OAuth only** — no headless cron.
- **Cron prompts must VERIFY current state** before claiming a task is open (don't nag on finished work). Goal-stated > task-listed prompts.
- **Hardcoded paths in prompts go stale on rename** — grep `jobs.json` for old paths on any rename.
- **Never DM/message people unsolicited from an agent.**

---

## ESTIMATED FLEET COST (per day, deepseek-v4-flash)
7 agents, conservative cadence. Daily cost is small (sub-$1 at flash rates). Start with the 2 scouts + synthesizer + social poster (4 agents); add competitor-scout, idea-engine, self-evaluator once the funnel is proven.
