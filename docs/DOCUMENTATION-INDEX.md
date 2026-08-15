# GodsEye Documentation Index

Updated: 2026-08-15

## Read in this order

1. `../AGENTS.md` — agent rules, source of truth, runtime map, safety.
2. `../PRD.md` — canonical product, architecture, URLs, payments, current verified state.
3. `../GODSEYE-PRODUCT-STANDARD.md` — customer experience, licensing, entitlement, onboarding.
4. `../HANDOFF.md` — concise operational handoff.
5. `PRE-LAUNCH-LANDING-MILESTONE-PRD.md` — public landing acceptance criteria.
6. `../drafts/COPY-7-DECISIONS-CARD.md` — copy approval card.
7. `../drafts/CONSOLIDATED-COPY-ANGLE.md` — long-form copy research and rationale.
8. `EMAIL_COPY.md` — email strategy and copy.
9. `nginx/README.md` — nginx-specific notes.
10. `../README.md` — repository-facing overview.

## Authority rules

- Product/runtime facts: `PRD.md` and current live verification.
- Customer experience/licensing: `GODSEYE-PRODUCT-STANDARD.md`.
- Landing milestone: `PRE-LAUNCH-LANDING-MILESTONE-PRD.md`.
- Draft copy is not live copy until explicitly approved.
- Old reports are historical evidence, not current state.

## Current active section

**Gemini Telegram bot 403 diagnosis.** Keep this separate from landing-copy approval, Polar webhook management, and OpenSaaS first-paint work.

## Important current facts

- Canonical root: `https://godseye.digitalhustlerx.com/`.
- Canonical auth: `https://app.digitalhustlerx.com`.
- Active data source: local SQLite at `data/godseye.db`.
- One Polar webhook endpoint; do not poll aggressively or create duplicates.
- Resend is configured.
- Gemini is configured but bot chat returns a 403 requiring runtime investigation.
- OpenSaaS primary service is `opensaas.service` on port 3101.
- Separate customer backend is `godseye-customer-backend.service` on port 3107.
- OpenSaaS has mixed uncommitted changes; never blindly commit all.
- Verify Wasp-generated client and server artifacts before restarting production.

## Secret policy

Never store `.env` files, passwords, tokens, private keys, database dumps, or customer data in documentation.
