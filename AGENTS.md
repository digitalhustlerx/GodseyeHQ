# GodsEye — Agent Operating Guide

> **Canonical project instructions. Updated: 2026-08-15.**

## Identity

GodsEye is a Telegram-first AI business operator. The customer hires an agent, gives it work in Telegram, and approves what it ships. WordPress is the first integration and activation path, not the entire identity.

Canonical promise: **Your business, run by an AI agent.**

Display brand: `GodsEye`. Keep lowercase `godseye` only in domains, slugs, paths, and technical identifiers.

## Source of truth

Edit only:

```text
/root/godseye-repo
```

Read first:

1. `PRD.md` — canonical product, architecture, current state.
2. `GODSEYE-PRODUCT-STANDARD.md` — licensing, entitlement, customer experience.
3. `HANDOFF.md` — short operational handoff.
4. `docs/PRE-LAUNCH-LANDING-MILESTONE-PRD.md` — canonical landing acceptance criteria.
5. `drafts/COPY-7-DECISIONS-CARD.md` — copy recommendation/approval card.
6. `drafts/CONSOLIDATED-COPY-ANGLE.md` — long-form rationale, not a live config.

When documents conflict, update the conflicting document. Do not create a third interpretation.

## Control-plane session protocol

The VPS-wide operating control plane is `/root/dhx-operating-system/`. It maps work but does not replace this repository's source of truth.

At the start of a meaningful GodsEye session:

1. Read `/root/dhx-operating-system/MASTER-INDEX.md`.
2. Read `/root/dhx-operating-system/ACTIVE-PRIORITIES.md`.
3. Read the relevant project card and Job card.
4. Continue with this file and the canonical documents listed above.

Before producing work, load the relevant Job's `READ BEFORE WORKING` context. At the end of any session that changes a decision, file, priority, or durable procedure, update the appropriate control-plane daily note and read the written change back. A daily note is an index, not the only home for durable knowledge.

Anti-drift rules: evidence before claims; full reads for audits; one source of truth; no loose ends; scope before action; no destructive cleanup during discovery; distinguish facts, decisions, proposals, and hypotheses.

Legacy/reference-only paths:

- `/root/godseye`
- `/root/godseye-waitlist`
- `/root/godseye/dashboard`
- `/root/godseye-test-wp`

Do not edit those unless explicitly requested.

## Canonical URLs

| Surface | URL |
|---|---|
| Public landing | `https://godseye.digitalhustlerx.com/` |
| Signup | `https://app.digitalhustlerx.com/signup` |
| Login | `https://app.digitalhustlerx.com/login` |
| Password reset | `https://app.digitalhustlerx.com/forgot-password` |
| Authenticated app | `https://app.digitalhustlerx.com` |
| Waitlist variant | `https://godseye.digitalhustlerx.com/waitlist.html` |
| API | `https://api.godseyes.digitalhustlerx.com` |
| Telegram bot | `@GodseyeXbot` |

The root is the multi-hero landing. The waitlist page is an explicit alternate route, not a fallback for `/`.

## Runtime map

| Component | Runtime |
|---|---|
| Landing/API | `godseye-backend.service`, `godseye-landing-api.service` |
| Telegram bot | `godseye-telegram-bot.service` |
| GodsEye Node API | localhost `3000` |
| Primary OpenSaaS/Wasp server | `opensaas.service`, localhost `3101` |
| Separate customer backend | `godseye-customer-backend.service`, localhost `3107` |
| OpenSaaS frontend build | `/root/open-saas/template/app/.wasp/out/web-app/build` |
| GodsEye database | `/root/godseye-repo/data/godseye.db` (SQLite) |
| Web server | nginx |

SQLite is the active GodsEye data source. Supabase is not the current source of truth.

## Product and copy rules

Use the approved copy direction:

1. Whole-business agent; WordPress as proof/use case.
2. Calm, plain, human voice.
3. Hero: **Your business, run by an AI agent.**
4. Free workspace/sample; live execution requires subscription.
5. Telegram-first, with website/store support.
6. Agent thinks ahead; customer approves everything.

Pricing is not final until the checkout/store and landing agree. Do not publish exact prices, credits, founder discounts, or hours/hire pricing as final without owner approval.

## Polar rules

Use one active webhook only:

```text
https://api.godseyes.digitalhustlerx.com/api/polar-webhook
```

Do not create duplicate webhooks or poll Polar aggressively. The handler supports signature validation and `checkout.completed`, `order.created`, and `order.paid`. Fulfilment must be idempotent.

## Gemini rule

`GEMINI_API_KEY` exists in `/root/godseye-repo/.env` and `.env.local`, but both values return `API_KEY_INVALID` from `generativelanguage.googleapis.com` (verified live 2026-08-16) — a likely contributor to the Telegram bot chat 403. The bot service env (`/etc/godseye/telegram.env`) contains no GEMINI variable at all. Report the key as present-but-invalid; do not claim it is "configured and working" without live verification of the specific key.

## OpenSaaS rule

OpenSaaS has mixed uncommitted changes. Never blindly commit all of `/root/open-saas`.

The auth first-paint boot shell is intentional. Before restarting after a Wasp build, verify both generated artifacts:

```bash
ls -la /root/open-saas/template/app/.wasp/out/web-app/build/index.html
ls -la /root/open-saas/template/app/.wasp/out/server/bundle/server.js
```

Wasp regeneration has previously removed expected output. If either artifact is missing, do not restart production until recovery is complete.

## Safe workflow

1. Read-only diagnosis.
2. Back up the exact file.
3. Make the smallest change.
4. Run syntax/type checks.
5. Build carefully.
6. Verify generated artifacts.
7. Restart only the required service.
8. Verify live HTTP routes and behavior.
9. Report evidence, not assumptions.
10. Do not expose secrets.

## Commands

```bash
cd /root/godseye-repo
npm run build
./scripts/deploy.sh
nginx -t && systemctl reload nginx

systemctl is-active godseye-backend.service godseye-landing-api.service godseye-telegram-bot.service opensaas.service
curl -sk -o /dev/null -w '%{http_code}\n' https://godseye.digitalhustlerx.com/
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/signup
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/login
```

For OpenSaaS:

```bash
cd /root/open-saas/template/app
wasp build
ls -la .wasp/out/web-app/build/index.html .wasp/out/server/bundle/server.js
systemctl restart opensaas.service
```

## Agent roles

- Completion loops: actively push unfinished work when explicitly enabled.
- Site Guard: script-only health monitoring; silent when healthy.
- Lead Radar: public multi-platform prospect research; no X/Twitter; no invented leads or spam.
- Inbound Watch: genuine inbound messages, payment questions, leads, complaints.
- Oversight: current project health and founder blockers only; not abandoned-chat tracking.

## Verification baseline — 2026-08-15

Verified at last update:

- Public landing HTTP 200.
- Signup HTTP 200.
- Login HTTP 200.
- Forgot-password HTTP 200.
- OpenSaaS service active.
- Nginx configuration valid.
- GodsEye TypeScript check passes.
- Polar `order.paid` support present in source.
- Resend configured.
- Gemini configured but bot 403 remains a separate investigation.

## Do not

- Do not switch the canonical root to the waitlist without approval.
- Do not use temporary sslip.io URLs in customer-facing copy.
- Do not run destructive database commands or production payment tests.
- Do not delete mixed working-tree changes.
- Do not create duplicate webhooks.
- Do not claim deployment without live verification.
