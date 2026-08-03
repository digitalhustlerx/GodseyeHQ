# GodsEye — Tier Capability Matrix

> What each GodsEye tier can **actually do**, based on the live plugin bridge (`godseye-bridge` v1.0.0). This defines the product ladder and what buyers get at each level.

---

## The Ladder (pricing model)

| Tier | Name | Price | What you get |
|------|------|-------|--------------|
| **1** | **Starter** (mini) | $9–12/mo | Agent connects to **your hosted site** via REST bridge. Your WP stays on your hosting. |
| **2** | **Pro** (full agent) | TBD | Beyond REST limits — deeper site control with extended bridge actions. |
| **3** | **God Mode** (managed) | Premium | **We host + manage everything** — agent, VPS, installs, updates. You hand over the stack; we run it. |

---

## TIER 1 — Starter: What the REST Bridge does TODAY (verified in `rest.php`)

The plugin exposes these WordPress REST routes, each authenticated via HMAC signature:

### ✅ Content
| Action | Endpoint | Notes |
|--------|----------|-------|
| List posts | `GET /posts` | filter by limit/status/search |
| List pages | `GET /pages` | |
| Create post | `POST /posts` | **Draft only** (publish is blocked by design — safety) |
| Create page | `POST /pages` | draft only |
| Update page | `POST /pages/{id}` | title/content/excerpt |

### ✅ Media
| Action | Endpoint |
|--------|----------|
| List media | `GET /media` |

### ✅ Comments (moderation)
| Action | Endpoint |
|--------|----------|
| List comments | `GET /comments` |
| **Approve / unapprove / trash** | `POST /comments/{id}` |

### ✅ Taxonomy
| Action | Endpoint |
|--------|----------|
| List categories + tags | `GET /taxonomy` |
| Create term | `POST /taxonomy` |

### ✅ WooCommerce
| Action | Endpoint |
|--------|----------|
| List products | `GET /woocommerce/products` |
| Update product | `POST /woocommerce/products/{id}` |

### ✅ SEO / Site Health / Maintenance
| Action | Endpoint |
|--------|----------|
| SEO status (Yoast/RankMath) | `GET /seo` |
| Plugin status list | `GET /plugins` |
| Theme status | `GET /themes` |
| Flush cache | `POST /cache/flush` |
| Cron status | `GET /cron` |
| Site info + capabilities | `GET /site` |

### 🔒 Tier 1 Security Model
- **Signed, timestamped, HMAC-auth'd requests** (anti-replay, 5-min expiry)
- **Draft-only publishing** — the agent can't accidentally publish to a live site without approval
- **Capability detection** — plugin reports what it *can* do based on active plugins/permissions

---

## TIER 2 — Pro: What extends BEYOND the REST bridge

The REST bridge hits WordPress's public API layer. A **full agent** (direct server/DB access, or extended bridge actions) unlocks what REST can't safely do:

| Capability | Tier 1 (REST) | Tier 2 (Full Agent) |
|-----------|---------------|---------------------|
| Create drafts | ✅ | ✅ (+ **publish** with approval) |
| Edit raw post content | ⚠️ via sanitized fields | ✅ full Gutenberg/blocks |
| **Install/activate plugins** | 🔴 status-only | ✅ install + activate |
| **Install/switch themes** | 🔴 status-only | ✅ install + switch |
| **Edit theme/Child CSS** | 🔴 no | ✅ |
| **Elementor / page-builder edits** | 🔴 no | ✅ (deep DOM/builder access) |
| **Direct server config** (php.ini, .htaccess) | 🔴 no | ✅ |
| **Database queries/admin** | 🔴 no | ✅ (via WP-CLI/DB) |
| **Full cron management** | 🔴 status-only | ✅ create/schedule |
| **Backup + restore** | 🔴 no | ✅ |
| **Security hardening** (active blocking) | 🔴 detect-only | ✅ enforce |
| **Scheduled autonomous tasks** | 🔴 no | ✅ agent-initiated cron |

**The Pro value:** Tier 1 *reads and drafts safely*; Tier 2 *executes, installs, and maintains*. That's the jump from "assistant" to "operator."

---

## TIER 3 — God Mode (managed hosting)

We don't just connect — **we are the backend**:
- Godseye hosts + provisions the VPS
- Installs WordPress, the bridge, required plugins/theme
- Buyer hands over access keys (host/SFTP/DB/app passwords) under a managed-agreement
- We run the agent + keep the stack updated, hardened, and healthy
- Buyer gets "your site has a full-time AI operations team" as a service

> **Pricing note:** This tier is a **managed service**, not just software — bill it to include the support burden (on-call, updates, incidents). Charge premium; don't price it like the $9 plugin or support overhead erodes margin.

---

## Risk / Gating (kept honest for buyers)

- **Tier 1 is intentionally safe** — draft-only writes, signed requests. Lower risk, lower power.
- **Tier 2 increases power = increases risk** — publishing/installing/DB access on a live site. Needs an approval gate (human confirms high-impact actions).
- **Tier 3 is trust + liability** — you hold customer production credentials. Requires a clear managed-services agreement defining what you run vs. where their liability begins.

---

## What to build next (to sell Tier 2/3 with proof)

1. **Extend the bridge** with Tier 2 endpoints (publish w/ approval, plugin install, Elementor, WP-CLI wrappers) — gated by an explicit "Pro permissions" flag.
2. **Build the approval flow** — high-impact actions require in-Polar/Telegram confirm.
3. **Stand up a Tier 3 reference stack** (one managed VPS instance) to prove the "we host it" claim.

---

*Source: verified against `godseye-bridge` v1.0.0 `includes/rest.php` (23 KB bridge).*
