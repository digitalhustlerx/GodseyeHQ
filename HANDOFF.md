# GodsEye — Current Handoff

**Updated:** 2026-08-15
**Status:** Live, documented, active development

## Read first

1. `AGENTS.md`
2. `PRD.md`
3. `GODSEYE-PRODUCT-STANDARD.md`
4. `docs/PRE-LAUNCH-LANDING-MILESTONE-PRD.md`
5. `drafts/COPY-7-DECISIONS-CARD.md`

## Canonical flow

```text
https://godseye.digitalhustlerx.com/
  → https://app.digitalhustlerx.com/signup
  → authenticated app/dashboard
  → plan and checkout
  → confirmed payment webhook
  → licensed live execution
```

## Current verified state

- Public landing HTTP 200.
- Signup HTTP 200.
- Login HTTP 200.
- Forgot-password HTTP 200.
- OpenSaaS service active.
- Nginx syntax valid.
- GodsEye TypeScript check passes.
- Polar handler supports `order.paid` in source.
- Resend configured.
- Gemini configured, but Telegram bot chat still has a separate 403 issue.

## Important runtime paths

- Canonical source: `/root/godseye-repo`
- SQLite: `/root/godseye-repo/data/godseye.db`
- OpenSaaS source: `/root/open-saas`
- OpenSaaS frontend artifact: `/root/open-saas/template/app/.wasp/out/web-app/build`
- OpenSaaS server artifact: `/root/open-saas/template/app/.wasp/out/server/bundle/server.js`
- OpenSaaS service: `opensaas.service`, port 3101
- Separate customer backend: `godseye-customer-backend.service`, port 3107

## Safety

Back up before edits. Do not blindly commit mixed OpenSaaS working-tree changes. Do not create duplicate Polar webhooks or poll Polar repeatedly. Verify generated Wasp client/server artifacts before restarting production. Never expose secrets.

## Next section

Investigate the Gemini Telegram bot 403 separately from landing copy, Polar webhooks, and OpenSaaS first-paint work.

## Standard verification

```bash
systemctl is-active godseye-backend.service godseye-landing-api.service godseye-telegram-bot.service opensaas.service
curl -sk -o /dev/null -w '%{http_code}\n' https://godseye.digitalhustlerx.com/
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/signup
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/login
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/forgot-password
```

No production services are to be stopped as part of documentation-only work.

## 2026-08-20 follow-up fix (proactive agent)
- Root cause of rambling bot chat: systemd drop-in `godseye-landing-api.service.d/llm-key.conf` overrode `DEEPSEEK_MODEL` to `gpt-oss-120b`, beating the base unit's `step-3.7-flash`.
- Fix: removed the stale model line from the drop-in (kept the API key); `systemctl daemon-reload && systemctl restart godseye-landing-api`.
- Verified: live process now `DEEPSEEK_MODEL=step-3.7-flash`; `/api/chat` returns tight output (probe "Say hello in 3 words" → "Hey there friend", clean `{done:true}`). No reasoning leak.
- Backup of drop-in before edit: `llm-key.conf.bak-20260820`.
