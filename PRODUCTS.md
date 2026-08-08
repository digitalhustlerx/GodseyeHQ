# Godseye — Product Surface (PRODUCTS.md)

> Single source of truth for every live deliverable/asset, what it is, and where it lives.
> Last updated: 2026-08-08. Kept in sync with `/root/.hermes/config/projects/godseye/AGENTS.md`.

## Web surfaces (all live, HTTPS)
| Page | URL | Purpose |
|------|-----|---------|
| Landing (SPA) | `godseye.digitalhustlerx.com` | Main storefront, Polar checkout |
| Templates | `/templates` | 8 niche profiles (solo dev, agency, e-com, real estate…) |
| Waitlist capture | `/waitlist.html` | Email form → `/api/waitlist` → founder code + welcome email |
| Tier guide (human) | `/godseye-tiers.html` | Plain-language Starter/Pro/God Mode (replaces old .md) |
| Insight report (human) | `/godseye-insight-report.html` | 30-day field report (replaces old .md) |
| Launch posts (human) | `/godseye-launch-posts.html` | Ready-to-post promos + per-post edit boxes |
| Token-wrapped (web) | `/token-wrapped.html` | The "2.47B tokens" numbers story |
| Token-wrapped (image) | `/token-wrapped.png` | Shareable PNG card |
| Token visualization | `/token-visualization.html` | Token usage visual |
| Blog | `/blog/**` | SEO articles (13 posts) |
| Tracking script | `/tracker.js` | Local behavior tracker (see below) |

## Legacy .md → HTML redirects (nginx, 301)
- `Godseye-Insight-Report.md` → `/godseye-insight-report.html`
- `Godseye-Tier-Matrix.md` → `/godseye-tiers.html`
- `Godseye-Case-Study.md` → `/godseye-tiers.html`
- Raw `.md` files removed from `dist/` (redirect-only now).

## Local behavior tracker (self-hosted, own infra)
- **Script:** `seo-assets/tracker.js` → served at `/tracker.js`
- **Events:** pageview, click, scroll (25/50/75/100% depth), time-on-page (5/30/60s), submit
- **Transport:** batches → POST `/api/track` → stored in `track_events` table (`data/godseye.db`)
- **Injected into:** index (dist), waitlist.html, godseye-tiers.html, godseye-insight-report.html, godseye-launch-posts.html
- **Why:** PostHog abandoned (ClickHouse ~4GB+ won't fit 6.6G RAM/20G disk). Tracker is ~2.3KB, zero deps, zero third-party.

## Brand kit (standard — use for ALL visuals)
See skill `godseye-brand-kit` + `/root/.hermes/skills/creative/godseye-brand-kit/`.
- bg `#0A0A0A` · surface `#121212` · gold `#C4A484` · gold-hover `#b39272` · gold-dim `#8a6f50` · text `#F2F2F2`
- Headings = **Georgia** serif (weight 300) · wordmark/buttons = **Space Grotesk** · body = **Inter** · mono = JetBrains Mono
- Email = inline styles only (Gmail strips `<style>`).

## Email (Resend, LIVE)
- Sender: `newsletter@digitalhustlerx.com` (DNS verified, SPF + DKIM live)
- Key: SENDING-ONLY (can't verify/list/register domains via API). Full-access key still needed for multi-domain + API verification.
- Test recipients: marvzplug@gmail.com, officialvendet@gmail.com (branded test sent OK)
- Module: `/srv/digitalhustlers/email/`

## Backend / deploy
- landing-api: `node dist/server.cjs`, port 3000. Serves checkout, waitlist, /api/track.
- server.ts edits → rebuild server.cjs (esbuild) + `systemctl restart godseye-landing-api`.
- Deploy: `scripts/deploy.sh` (wipes/rebuilds dist → restores all HTML + tracker + plugin zip + server.cjs).
- DB: SQLite at `/root/godseye-repo/data/godseye.db` (waitlist, referrers, purchases, track_events).
