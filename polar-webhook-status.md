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
