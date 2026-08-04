# GODSEYE — Per-Client Agent-Hour Cost Model

> **Built:** 2026-08-04 · **VPS:** Hivelocity 6-core AMD EPYC, 11GB RAM, 193GB NVMe @ 62.84.186.1  
> **LLM routing:** OpenCode Go ($10/mo flat, effectively free per-agent-hour at our scale)  
> **Based on:** actual VPS specs, live API pricing (OpenRouter), Browserbase pricing page, Polsia recon

---

## 1. LLM TOKEN COSTS (The Variable Core)

Our primary routing is via **OpenCode Go** — a flat $10/month subscription providing access to DeepSeek-V3.2, DeepSeek-V4-Flash, GPT-4o-mini, and other models. Since this is a fixed cost shared across all clients/agents, the **marginal LLM cost per agent-hour is effectively $0** for the base tier.

For fallback / self-hosted / premium-tier routing, here are real per-token costs from live API pricing:

| Model | Input ($/1M tok) | Output ($/1M tok) | Source |
|-------|-------------------|---------------------|--------|
| **DeepSeek V4 Flash** (primary via Go) | $0.09 | $0.18 | OpenRouter |
| **DeepSeek V3.2** (heavy reasoning) | $0.27 | $0.40 | OpenRouter |
| **GPT-4o-mini** (OpenAI direct) | $0.15 | $0.60 | OpenAI |
| **GPT-4.1-mini** | $0.40 | $1.60 | OpenAI |
| **DeepSeek V4 Pro** (premium) | $0.44 | $0.87 | OpenRouter |
| **DeepSeek R1** (reasoning-heavy) | $0.70 | $2.50 | OpenRouter |
| **Ollama (local)** — Llama/Qwen on VPS | $0.00 | $0.00 | Self-hosted (RAM cost only) |

### Tokens per Agent-Hour by Intensity

| Intensity | Tokens/hr | Typical Use Case |
|-----------|-----------|-------------------|
| **Light Chat** | ~5,000 | Simple Q&A, status checks, small edits |
| **Heavy Work-Loop** | ~50,000 | Multi-turn coding, debugging, research, content creation |
| **Ad Creative / Gen** | ~200,000 | Long-form content, image-gen prompts, creative iteration |

Token split assumption: 60% input / 40% output.

### Per-Hour LLM Cost by Model Tier

| Model Tier | Light (5K tok) | Heavy (50K tok) | Creative (200K tok) |
|------------|----------------|-----------------|----------------------|
| **OpenCode Go (free tier)** | $0.000 | $0.000 | $0.000 |
| **DeepSeek V4 Flash (fallback)** | $0.001 | $0.006 | $0.025 |
| **GPT-4o-mini (mid-tier)** | $0.002 | $0.017 | $0.066 |
| **DeepSeek V4 Pro (premium)** | $0.003 | $0.030 | $0.121 |
| **GPT-4.1-mini (premium)** | $0.005 | $0.046 | $0.184 |
| **Ollama local (self-host)** | $0.000 | $0.000 (RAM) | $0.000 (RAM) |

**Key takeaway:** With OpenCode Go as primary, LLM cost is **$0.00/agent-hour** at all intensity levels. Even at fallback API pricing, the cost is fractions of a cent per hour — LLM inference is NOT the cost driver.

---

## 2. VPS INFRASTRUCTURE COST

### Actual Server Specs (62.84.186.1)

```
CPU:    6-core AMD EPYC
RAM:    11 GB (5.3 GB available at idle)
Disk:   193 GB NVMe (184 GB used, 8.9 GB free — TIGHT)
OS:     Ubuntu 24.04 LTS
Swap:   8 GB
```

### Estimated Monthly Cost

Hivelocity doesn't publicly list exact pricing, but based on comparable providers:
- **Hetzner AX42** (6C/12T Ryzen, 64GB, 2×512GB NVMe): ~€50/mo (~$55)
- **Hivelocity VPS with these specs**: estimated **$45–65/month**

We'll model at **$55/month** (midpoint).

### Per-Client Infrastructure Allocation

| Concurrent Clients (N) | VPS Cost/Client/Month | VPS Cost/Client/Hour |
|------------------------|----------------------|---------------------|
| **5 clients** (light) | $11.00 | $0.015 |
| **10 clients** | $5.50 | $0.008 |
| **25 clients** | $2.20 | $0.003 |
| **50 clients** | $1.10 | $0.002 |
| **100+ clients** | $0.55 | $0.001 |

> **Note:** Current VPS has 8.9 GB free disk — this is the scaling bottleneck. At ~500MB/client (DB + media + agent memory), the current server caps at ~15-20 clients before needing storage expansion or migration. RAM (5.3 GB available) supports probably 3-5 concurrent heavy agents.

### Additional VPS Costs (if scaling)

| Resource | Upgrade Cost | Triggers At |
|----------|-------------|-------------|
| +50GB block storage | ~$5-10/mo | 10+ clients |
| +16GB RAM VPS upgrade | ~$25-40/mo more | 5+ concurrent heavy agents |
| Second VPS (load-balanced) | +$55/mo | 25+ concurrent clients |

---

## 3. EXTERNAL PASS-THROUGH COSTS

These are usage-based services that the agent consumes on the client's behalf. They're either **absorbed into Godseye pricing** (our margin covers them) or **passed through directly** (client pays).

| Service | Pricing | Per Agent-Hour Estimate | Absorption Strategy |
|---------|---------|------------------------|---------------------|
| **Browserbase** | $20/mo (100 browser hrs) → $0.20/hr overage | $0.05–0.50/hr | Absorb in premium tiers, pass-through on free |
| **Meta Marketing API** | Free (ad spend is client's) | $0 (client pays ad spend) | Pure pass-through |
| **Email (Postmark/SendGrid)** | ~$0.001/email | $0.001–0.01/hr | Absorbed (negligible) |
| **Social posting (Late.dev / X API)** | ~$0–0.01/post | $0.001–0.05/hr | Absorbed (negligible) |
| **Image gen (Fal.ai / Sora)** | $0.01–0.05/image | $0.01–0.50/hr | Absorbed or credit-pack |
| **Web search API** | $7/1K searches (Browserbase) | $0.01–0.07/hr | Absorbed (most via free tier) |
| **Whisper transcription** | Free (local whisper-server on VPS) | $0 | Already on VPS |

**Browserbase is the only significant pass-through risk** — heavy browser automation at $0.20/hr overage. A creative agent doing ad research could burn 1-2 browser hours per agent-hour. Mitigation: use local Chromium/CDP where possible, reserve Browserbase for stealth/proxy-required tasks.

---

## 4. STORAGE COSTS

| Item | Per-Client Size | Cost |
|------|----------------|------|
| DB row (Supabase/Postgres) | ~10-50 KB | Negligible |
| Uploaded media (screenshots, assets) | ~10-100 MB/month | ~$0.01/mo |
| Agent memory/context store | ~5-50 MB | Negligible |
| Session logs/transcripts | ~1-10 MB | Negligible |
| **Total per client** | ~50-200 MB | **~$0.02–0.05/month** |

Storage cost per agent-hour is effectively **$0.000** — not worth modeling.

---

## 5. TOTAL COST PER AGENT-HOUR (Summary Table)

### Conservative Model (VPS=$55/mo, 10 clients, OpenCode Go primary)

| Cost Component | Light (5K tok) | Heavy (50K tok) | Creative (200K tok) |
|---------------|----------------|-----------------|----------------------|
| **LLM (OpenCode Go)** | $0.000 | $0.000 | $0.000 |
| **VPS infra** | $0.008 | $0.008 | $0.008 |
| **Browser/pass-through** | $0.005 | $0.050 | $0.200 |
| **Storage** | $0.000 | $0.000 | $0.000 |
| **TOTAL COST/hr** | **$0.013** | **$0.058** | **$0.208** |

### Worst-Case Model (fallback API + heavy browser)

| Cost Component | Light (5K tok) | Heavy (50K tok) | Creative (200K tok) |
|---------------|----------------|-----------------|----------------------|
| **LLM (GPT-4o-mini API)** | $0.002 | $0.017 | $0.066 |
| **VPS infra** | $0.008 | $0.008 | $0.008 |
| **Browserbase (heavy use)** | $0.050 | $0.200 | $0.500 |
| **Image gen / media** | $0.000 | $0.010 | $0.100 |
| **Storage** | $0.000 | $0.000 | $0.000 |
| **TOTAL COST/hr** | **$0.060** | **$0.235** | **$0.674** |

### Self-Hosted Model (Ollama local + local Chromium)

| Cost Component | Light (5K tok) | Heavy (50K tok) | Creative (200K tok) |
|---------------|----------------|-----------------|----------------------|
| **LLM (Ollama local)** | $0.000 | $0.000 | $0.000 |
| **VPS infra (GPU/upgrade)** | $0.012 | $0.012 | $0.012 |
| **Browser (local CDP)** | $0.001 | $0.005 | $0.010 |
| **Storage** | $0.000 | $0.000 | $0.000 |
| **TOTAL COST/hr** | **$0.013** | **$0.017** | **$0.022** |

---

## 6. PRICING & MARGIN ANALYSIS

### Polsia's Pricing (Competitor Benchmark)

| Plan | Price | Effective $/hr |
|------|-------|-----------------|
| 1 hour God Mode | $19 | $19.00/hr |
| Week-long God Mode (~168 hrs) | ~$999 (est.) | ~$5.95/hr |
| Free tier | $0 | N/A (freemium hook) |

Polsia's margin at $19/hr: their cost is estimated at $0.50-2.00/hr (similar LLM arbitrage), giving them **~90%+ gross margin** at the hourly rate and ~80% at the weekly rate.

### Godseye Recommended Pricing (Telegram-first, hour-bundle model)

| Bundle | Price | $/hr | Our Cost/hr (conservative) | Gross Margin |
|--------|-------|------|---------------------------|--------------|
| **1-Hour Trial** | $15 | $15.00 | $0.06 (heavy) | **99.6%** |
| **10-Hour Pack** | $99 | $9.90 | $0.06 (heavy) | **99.4%** |
| **50-Hour Pack** | $349 | $6.98 | $0.06 (heavy) | **99.1%** |
| **100-Hour Pack** | $499 | $4.99 | $0.06 (heavy) | **98.8%** |
| **Creative 10-Hour** | $199 | $19.90 | $0.67 (worst-case) | **96.6%** |
| **Creative 50-Hour** | $749 | $14.98 | $0.67 (worst-case) | **95.5%** |

### Margin Scenarios

| Scenario | Cost/hr | Price/hr | Margin |
|----------|---------|---------|--------|
| 🟢 **Optimistic** (Go+light) | $0.013 | $9.90 | **99.9%** |
| 🟡 **Conservative** (Go+heavy) | $0.058 | $9.90 | **99.4%** |
| 🔴 **Worst-Case** (API+creative+browser) | $0.674 | $14.98 | **95.5%** |
| 🟢 **Self-hosted** (Ollama+local) | $0.017 | $6.98 | **99.8%** |

---

## 7. THE REAL ECONOMICS

### Why This Works

1. **LLM cost is a solved problem.** OpenCode Go at $10/mo removes the primary variable cost. Even fallback APIs are fractions of a cent per hour. LLM inference will continue getting cheaper.

2. **The real cost is infra, not intelligence.** At $0.01-0.06/hr all-in (conservative), a $5/hr price point gives 99%+ margin. This is sustainable indefinitely.

3. **Polsia's model works because of this arbitrage.** They openly discuss using open-source fallbacks to widen margins. Godseye can match or beat their pricing while being more profitable because:
   - No Render/Neon/Redis hosting fees (we own the VPS)
   - Telegram-first = lower infra overhead than web dashboard
   - OpenCode Go is cheaper than Anthropic primary

4. **The scaling constraint is not cost — it's concurrency.** Our current VPS has ~5GB free RAM and ~9GB free disk. At 500MB RAM per heavy agent session, we max at ~10 concurrent agents before needing a second VPS. At $55/mo per VPS supporting 10 clients, infrastructure at scale is $5.50/client/month — still negligible against $99-499/client/month revenue.

### Break-Even Points

| Clients | Monthly Revenue (avg $99/mo) | Monthly Cost | Profit |
|---------|------------------------------|-------------|--------|
| 5 | $495 | $55 (VPS) + $10 (Go) = $65 | **$430** |
| 10 | $990 | $55 + $10 = $65 | **$925** |
| 25 | $2,475 | $110 (2× VPS) + $10 = $120 | **$2,355** |
| 50 | $4,950 | $220 (4× VPS) + $20 = $240 | **$4,710** |
| 100 | $9,900 | $440 (8× VPS) + $40 = $480 | **$9,420** |

**Break-even is at 1 client** — the infrastructure is already paid for. Every additional client is ~99% margin at current costs.

---

## 8. COMPARISON TO POLSIA

| Dimension | Polsia | Godseye (Proposed) |
|-----------|--------|---------------------|
| **Price / hour** | $19 (single), ~$6 (week) | $15 (trial), ~$5-10 (bulk) |
| **Free tier** | Yes (no CC) | Yes (Telegram /start) |
| **LLM routing** | Anthropic primary + Bedrock fallback + open-source | OpenCode Go primary + DeepSeek fallback + Ollama local |
| **Hosting** | Render (PaaS, paid) | Own VPS ($55/mo fixed) |
| **Margin at $6/hr** | ~85-90% | ~99% |
| **Scaling cost** | Per-hour Render/Neon/Redis fees | Fixed VPS cost, scales in $55 increments |
| **Onboarding** | Web → Google OAuth | Telegram `/start` (lower friction) |
| **Browser infra** | Browserbase (pass-through) | Browserbase (pass-through) + local CDP fallback |
| **Ad management** | Meta API pass-through | Meta API pass-through |
| **Key advantage** | Established brand, 15K+ companies | Telegram-native, higher margin, simpler stack |

---

## 9. RECOMMENDATIONS

1. **Price at parity with Polsia but capture more margin.** $15/hr trial, bulk packs at $5-10/hr. Our cost structure supports it.

2. **Keep OpenCode Go as primary.** The $10/month flat fee is the single best cost optimization — it removes the only variable that could scale badly (LLM tokens).

3. **Deploy Ollama as fallback.** The VPS already has Ollama on port 11434. Load a Qwen-2.5-7B or Llama-3.1-8B for simple tasks, keeping premium API calls for heavy reasoning only.

4. **Use local Chromium before Browserbase.** Hermes already supports local CDP browser via `browser` toolset. Reserve Browserbase $0.20/hr for stealth/proxy-required tasks only.

5. **Expand disk before scaling past 15 clients.** Current 8.9GB free is the hard limit. Add a $10/mo 50GB block volume before onboarding client 10+.

6. **Hour-bundle pricing is superior to subscription.** Prepaid packs capture revenue upfront, reduce churn, and the "credits roll over" model creates sticky balances. Polsia does per-hour; bundles give us better cash flow.

---

*End of cost model. Numbers updated 2026-08-04 with live API pricing and VPS specs.*
