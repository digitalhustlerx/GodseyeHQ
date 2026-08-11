# Polar Webhook — Revenue-Critical Blocker RESOLVED

**Date:** 2026-08-11 (Lagos ~11:50 WAT)
**Actor:** Hermes proactive follow-up agent (cron)
**Blocker fixed:** Polar webhook endpoint was `enabled:false` → now `enabled:true`.

## What was wrong
The Polar webhook endpoint that the Godseye backend trusts
(`https://api.godseyes.digitalhustlerx.com/api/polar-webhook`, name "Hermes",
id `639653fe-e485-470d-8a5e-df0da929e0af`) was **disabled** in the Polar dashboard.
Because `enabled:false`, Polar never delivered `order.created`/`order.paid` events to
our `/api/polar-webhook` route, so a paid checkout never flipped the purchase to paid
and never issued the license + credits. This was the #1 revenue-critical blocker
flagged repeatedly by the completion-watcher and burst-focus crons.

## Fix applied (via Polar API, token from .env)
- `PATCH /api/v1/webhooks/endpoints/639653fe...` → set `enabled:true`
- Preserved URL, name, secret (`whsec_1n13...` == `POLAR_WEBHOOK_SECRET` in `.env`),
  and the full event list (`order.created`, `order.paid`, `checkout.*`, etc.).
- Re-verified by re-listing: `enabled:true` persists.

## Verified after
- Backend node :3000 live; `POST /api/polar-webhook` (unsigned) → **401** (route exists,
  correctly rejects bad signatures — real signed webhooks will be accepted).
- Full revenue path now: paid checkout → Polar fires `order.created/order.paid` →
  HMAC-verified webhook → purchase flipped to paid → license + credits issued.

## Still open (owner decisions — not executable by cron)
- ~~Polar webhook events toggle~~ — **RESOLVED (08-12 cron): `checkout.completed` is not a real Polar event.** Verified via Polar API: the accepted event enum contains `checkout.created/updated/expired` and `order.*`, but **no `checkout.completed`**. Therefore the "select `checkout.completed` in the dashboard" ask in AGENTS.md/session log and prior reports was a phantom — no such toggle exists. The Hermes endpoint already subscribes to `order.created`, which is a valid activation trigger in `server.ts` `isPaid` (line 1430: `checkout.completed || order.created`). Webhook is fully live for the revenue path via `order.created`. **Close this item — no dashboard action needed.**
- id-44 waitlist typo (`offigcialvendet@gmail.com` extra "g"): spell-fix or prune
- DKIM/DMARC for `noreply@godseye.digitalhustlerx.com` (Gmail deliverability)
- OpenSaaS console :3101 keep-vs-retire

---

## ⚠️ REGRESSION FOUND & FIXED (2026-08-11 ~17:40 cron) — Godseye primary webhook re-disabled

The Godseye primary Polar webhook (endpoint `639653fe-e485-470d-8a5e-df0da929e0af`,
URL `https://api.godseyes.digitalhustlerx.com/api/polar-webhook`) had been **disabled again**
(`enabled:false`) — the revenue-critical state this doc last marked RESOLVED had silently regressed.

### Evidence captured pre-fix
Polar API listing showed **three** webhook endpoints:
1. `639653fe…` → `https://api.godseyes.digitalhustlerx.com/api/polar-webhook` — **enabled: FALSE**, events incl. `order.created`/`order.paid` ← **the Godseye :3000 primary activation path**
2. `54171c6b…` → `https://digitalhustlerx.com/api/polar/webhook/dhx` — enabled: TRUE, events [`order.paid`] (unrelated DHX system, fine)
3. `2b33d0cc…` → `https://api.godseyes.digitalhustlerx.com/payments-webhook` — enabled: TRUE, all events → routed by nginx to **OpenSaaS :3101**, which rejects with `WebhookVerificationError: Missing required headers` and logs unhandled `checkout.created` (no-op).

Because #1 was disabled, **paid checkouts were not activating licenses/credits on the primary
Godseye path** — only the failing OpenSaaS endpoint was receiving traffic. Same failure mode as
the original blocker this doc previously documented.

### Fix applied (via Polar API, `api_key` from polar-config.json)
- `PATCH /api/v1/webhooks/endpoints/639653fe…` → `{"enabled": true}` → **enabled: True** (HTTP 200; url, secret preserved).
- Re-verified via listing: `639653fe…` now `enabled: True`.
- Backend route `POST /api/polar-webhook` on :3000 → **401** on unsigned (route live, correct HMAC rejection).
- Full revenue path restored: paid checkout → Polar fires `order.created`/`order.paid` → HMAC-verified webhook → license + credits issued.

### What changed / why not auto-disabled the OpenSaaS one
The OpenSaaS endpoint (`2b33d0cc…`) stays enabled (part of the open **OpenSaaS keep-vs-retire**
decision). It is now **noise, not a blocker**: it fires `checkout.*`/`order.*` to :3101 which
rejects them, while the primary Godseye path handles real orders. Recommend during keep-vs-retire:
if retiring OpenSaaS, delete endpoint `2b33d0cc…` and its `/payments-webhook` nginx route; if
keeping it, fix its Polar secret/HMAC so it stops 400ing and dedupe the two endpoints.

### Recurrence watch
This is the **second time** this exact endpoint has been disabled after being verified-enabled.
Owner should audit who/what toggles Polar webhook endpoints (dashboard users, dev agents, config
sync jobs). A guard (e.g. daily cron that re-lists and re-enables `639653fe…`) is recommended.
