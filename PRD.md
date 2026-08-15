# GodsEye — Product Requirements Document

> **Status:** Active canonical source of truth
> **Version:** 4.0
> **Updated:** 2026-08-15
> **Owner:** DigitalHustlerX

## 1. Product definition

**GodsEye is a Telegram-first AI business operator.** A customer hires an agent, gives it work in Telegram, and approves what it ships. WordPress is the first concrete integration and activation path; it is not the whole product identity.

Canonical promise:

> **Your business, run by an AI agent.**

Supporting promise:

> It thinks ahead, handles useful work, and keeps the customer in control.

Do not promise zero supervision, unrestricted autonomy, or free live execution on a customer's real business systems.

## 2. Canonical customer flow

```text
Public GodsEye landing
  → Get Started
  → branded OpenSaaS signup/login
  → authenticated app/dashboard
  → choose a plan
  → Polar checkout
  → confirmed payment webhook
  → licensed live execution
```

| Surface | Canonical URL | Role |
|---|---|---|
| Public landing | https://godseye.digitalhustlerx.com/ | Multi-hero marketing/product front door |
| Signup | https://app.digitalhustlerx.com/signup | Branded OpenSaaS authentication |
| Login | https://app.digitalhustlerx.com/login | Branded OpenSaaS authentication |
| Password reset | https://app.digitalhustlerx.com/forgot-password | Authentication recovery |
| Authenticated app | https://app.digitalhustlerx.com | Dashboard, account, pricing, billing |
| Waitlist variant | https://godseye.digitalhustlerx.com/waitlist.html | Explicit alternate capture page only |
| Legacy alias | https://godseye.shop | Redirects to canonical landing |
| Legacy purchase alias | https://buy.godseye.shop | Redirects to app pricing |

Temporary `sslip.io` hostnames are never customer-facing.

## 3. Architecture and source of truth

The only GodsEye application repository to edit is:

```text
/root/godseye-repo
```

| Component | Location/runtime | Purpose |
|---|---|---|
| Landing SPA | `/root/godseye-repo/dist` | Canonical public landing |
| Node API | `godseye-backend.service`, localhost:3000 | Waitlist, checkout, purchases, referrals, API |
| Landing API | `godseye-landing-api.service` | Landing/waitlist API services |
| Telegram bot | `godseye-telegram-bot.service` | Onboarding and customer conversations |
| OpenSaaS frontend | `/root/open-saas/template/app/.wasp/out/web-app/build` | Branded signup/login/app client |
| OpenSaaS server | `opensaas.service`, localhost:3101 | Auth and app backend |
| Customer backend | `/root/godseye-customer-backend`, localhost:3107 | Separate Wasp customer backend; do not confuse with primary app |
| Database | `/root/godseye-repo/data/godseye.db` | Local SQLite source for waitlist, purchases, tracking |
| Production web server | nginx | TLS, routing, static assets, reverse proxy |

**SQLite is canonical for GodsEye data. Supabase is not the active source of truth.**

## 4. Product experience

### Free preview

Free users may enter the app, see a prepared workspace, try safe examples, and understand the product. They may not connect a real domain or execute live business mutations without an active subscription.

### Paid entitlement

A confirmed active subscription licenses live execution. Entitlement state must be explicit: preview, checkout pending, active, grace period, suspended, cancelled, or self-hosted.

### Telegram-first onboarding

The bot is the front door for conversation. The dashboard is the persistent home for account, billing, usage, connections, and deliverables.

## 5. Commercial decisions

### Copy direction

Recommended and approved direction for the next copy pass:

1. Lead with the whole business; use WordPress as proof/use case.
2. Use a calm, plain, human voice.
3. Use the hero: **“Your business, run by an AI agent.”**
4. Free users see a workspace/sample; live work requires subscription.
5. Position Telegram as the primary operating surface while supporting websites/stores.
6. Say the agent thinks ahead, while the customer approves everything.

Pricing model remains **not final** until the checkout/store and landing agree. Do not publish `$0.30/day`, credit packs, founder discounts, or hours/hire pricing as final without explicit owner approval and matching checkout products.

Source draft: `drafts/COPY-7-DECISIONS-CARD.md`.

## 6. Payments and webhooks

Polar.sh is the payment processor currently connected to the GodsEye checkout. Keep **one active webhook endpoint**. Do not create duplicate endpoints or poll Polar aggressively.

Canonical webhook endpoint:

```text
https://api.godseyes.digitalhustlerx.com/api/polar-webhook
```

The source handler supports signature verification and these payment event names:

- `checkout.completed`
- `order.created`
- `order.paid`

The `order.paid` support was added in source on 2026-08-15 and must be built/deployed and then tested before treating it as live. Fulfilment must be idempotent: one purchase/reference must not credit, email, or issue a token twice.

## 7. Current verified state — 2026-08-15

- Public landing: HTTP 200.
- Signup: HTTP 200.
- Login: HTTP 200.
- Forgot-password route: HTTP 200.
- OpenSaaS service: active after recovery.
- Nginx configuration: valid.
- GodsEye TypeScript check: passes after webhook parser/event update.
- OpenSaaS first-paint boot shell: present in the generated live client artifact.
- OpenSaaS build pipeline remains fragile: Wasp regeneration has previously removed expected server/web output. Never run a broad rebuild without checking generated client and server artifacts before restarting production.
- Resend is configured; do not list it as missing without fresh evidence.
- Gemini is configured but Telegram bot chat has a separate 403 issue requiring runtime investigation.
- Polar webhook was configured by the owner; do not change or repeatedly query it.

## 8. Deployment and verification

For GodsEye landing/API changes:

```bash
cd /root/godseye-repo
npm run build
./scripts/deploy.sh
nginx -t && systemctl reload nginx
```

For OpenSaaS changes, preserve backups and verify generated output before restarting:

```bash
cd /root/open-saas/template/app
wasp build
ls -la .wasp/out/web-app/build/index.html .wasp/out/server/bundle/server.js
systemctl restart opensaas.service
```

Verify:

```bash
curl -sk -o /dev/null -w '%{http_code}\n' https://godseye.digitalhustlerx.com/
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/signup
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/login
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/forgot-password
systemctl is-active opensaas.service godseye-backend.service godseye-telegram-bot.service
```

## 9. Safety rules

1. Read-only diagnosis before production edits.
2. Back up exact files before editing.
3. Never blindly commit mixed OpenSaaS changes.
4. Never delete or reset customer/payment data during testing.
5. Never expose secrets in documentation, commits, or reports.
6. Do not create duplicate Polar webhooks.
7. Do not claim live deployment until the live endpoint is checked.
8. Preserve active execution loops; do not pause them merely because they are frequent.
9. Treat monitoring, completion, lead discovery, and execution as separate agent roles.

## 10. Documentation map

- `AGENTS.md` — operating rules and source-of-truth index.
- `PRD.md` — this canonical product and architecture document.
- `GODSEYE-PRODUCT-STANDARD.md` — customer/product/licensing principles.
- `HANDOFF.md` — short operational handoff.
- `docs/PRE-LAUNCH-LANDING-MILESTONE-PRD.md` — landing milestone acceptance criteria.
- `drafts/COPY-7-DECISIONS-CARD.md` — copy decisions and approval state.
- `drafts/CONSOLIDATED-COPY-ANGLE.md` — long-form copy research and rationale.

When documents disagree, this PRD and the live system take precedence; update the conflicting document rather than inventing a third state.

## 11. Explicit non-goals

- Do not replace the canonical multi-hero root with the waitlist page without explicit approval.
- Do not make `/root/open-saas` the GodsEye source repository.
- Do not use Supabase as the current GodsEye database unless the architecture is deliberately changed and documented.
- Do not treat old reports saying “Polar placeholder,” “Resend missing,” or “waitlist is root” as current facts.

## 12. Next section

The next work section is **Gemini Telegram bot 403 diagnosis**. Keep it separate from landing copy, Polar webhook management, and OpenSaaS first-paint work.
