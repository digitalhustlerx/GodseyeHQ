# GodsEye Pre-Launch Landing Milestone

**Status:** Approved canonical baseline
**Updated:** 2026-08-15

## Decision

The multi-hero GodsEye landing is the canonical public root:

```text
https://godseye.digitalhustlerx.com/
```

The root must not be replaced by the waitlist/capture page or the alternate `/app/` route without explicit approval.

## Customer flow

```text
GodsEye landing → Get Started → app.digitalhustlerx.com/signup
GodsEye landing → Log In → app.digitalhustlerx.com/login
```

The OpenSaaS marketing page must not be presented as an intermediate destination. The branded auth app must load without the old/default Wasp page flashing first.

## Routes

- `/` — canonical multi-hero landing
- `/waitlist.html` — separate waitlist/capture variant
- `app.digitalhustlerx.com/signup` — signup
- `app.digitalhustlerx.com/login` — login
- `app.digitalhustlerx.com/forgot-password` — password recovery

## Design

- Background: `#0A0A0A`
- Text: `#F2F2F2`
- Gold: `#C4A484`
- Surface: `#121212`
- Rounded cards and clear CTAs
- Brand display: `GodsEye`

## Acceptance checks

- [x] Root returns HTTP 200.
- [x] Root is the multi-hero GodsEye page.
- [x] Get Started targets canonical signup.
- [x] Login targets canonical login.
- [x] Signup returns HTTP 200.
- [x] Login returns HTTP 200.
- [x] Forgot-password returns HTTP 200.
- [x] OpenSaaS service is active.
- [x] Nginx configuration validates.
- [x] Auth first-paint boot shell exists in the generated client artifact.
- [ ] Full browser refresh test across desktop/mobile.
- [ ] Authenticated signup → login → dashboard → logout dogfood pass.
- [ ] Final copy field-tweaking pass.

## Non-goals

- No root flip to waitlist.
- No temporary sslip.io URLs in customer-facing links.
- No pricing finalization without matching checkout products.
- No payment or database changes as part of landing documentation.

## Source documents

- `PRD.md` — canonical project source of truth.
- `AGENTS.md` — agent operating rules.
- `GODSEYE-PRODUCT-STANDARD.md` — product/licensing principles.
- `drafts/COPY-7-DECISIONS-CARD.md` — copy approval card.
