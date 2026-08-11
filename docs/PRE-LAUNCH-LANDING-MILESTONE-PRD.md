# GodsEye Pre-Launch Landing Milestone PRD

**Status:** Approved milestone baseline — canonical multi-hero root  
**Phase:** Pre-launch / field-tweaking  
**Product:** GodsEye  
**Repository:** https://github.com/digitalhustlerx/GodseyeHQ  
**Milestone checkpoint:** `pre-launch landing baseline`

## 1. Milestone decision

The multi-hero GodsEye application page is the canonical public pre-launch page for the product. It is served at:

- `https://godseye.digitalhustlerx.com`

This page is the public product front door and must remain the main landing page for GodsEye until a later launch-page decision is explicitly approved.

## 2. Canonical customer flow

```text
Godseye public landing page
  → Get Started
  → OpenSaaS branded authentication
  → account creation or login
  → authenticated GodsEye dashboard
  → pricing, account, subscriptions, and payments
```

Canonical app URLs:

- Signup: `https://app.digitalhustlerx.com/signup`
- Login: `https://app.digitalhustlerx.com/login`
- Pricing: `https://app.digitalhustlerx.com/pricing/`
- Account/dashboard host: `https://app.digitalhustlerx.com`

The OpenSaaS public marketing landing page must not appear between the GodsEye landing page and authentication. Get Started and Log In must navigate directly to the relevant auth page.

## 3. What is in this baseline

The public pre-launch page contains the canonical multi-hero GodsEye product presentation:

- Telegram-first AI business operator positioning
- Agent fleet and automation messaging
- Features, templates, pricing, docs, community, and blog navigation
- Starter, Pro, Elite, and Burst pricing language where applicable
- Direct account creation and login calls to action
- GodsEye dark/gold visual identity

The root must visibly include the hero slider/multiple hero sections. The alternate `/app/` route is not the primary public entry and must not replace `/`.

The authenticated OpenSaaS application supplies:

- Signup and login
- Session handling and logout
- Account management
- Pricing and subscription surfaces
- Customer dashboard/application UI
- Godseye-branded application shell

## 4. Domain policy

| Domain | Role | Policy |
|---|---|---|
| `godseye.digitalhustlerx.com` | Canonical public pre-launch landing/application page | Primary public URL |
| `app.digitalhustlerx.com` | OpenSaaS auth and authenticated customer app | Primary app URL |
| `godseye.shop` | Legacy alias | Redirect to canonical public page |
| `buy.godseye.shop` | Legacy purchase alias | Redirect to canonical app pricing |
| `opensaas.62.84.186.1.sslip.io` | Temporary OpenSaaS hostname | Do not use in customer-facing links |

## 5. Design tokens

Both the public page and the authenticated application should converge on the GodsEye system:

- Background: `#0A0A0A`
- Text: `#F2F2F2`
- Gold accent: `#C4A484`
- Surface: `#121212`
- Border: `rgba(255,255,255,0.1)`
- Serif display headings: Georgia-style light weight
- Sans/mono supporting typography
- Rounded cards and pill-shaped calls to action

## 6. Acceptance criteria for this milestone

- [x] Canonical public page returns HTTP 200.
- [x] Canonical public page shows the multi-hero GodsEye application page.
- [x] Root includes multiple hero slides and the full marketing sections.
- [x] Get Started goes directly to `app.digitalhustlerx.com/signup`.
- [x] Log In goes directly to `app.digitalhustlerx.com/login`.
- [x] OpenSaaS marketing landing page is not shown during the auth transition.
- [x] Signup page loads successfully.
- [x] Login page loads successfully.
- [x] OpenSaaS backend remains on its dedicated port 3101.
- [x] Legacy domains redirect to the canonical destinations.
- [ ] Complete a production email-delivery test with real SMTP.
- [ ] Complete a full authenticated dashboard and logout dogfood pass.
- [ ] Perform the next field-tweaking pass against the multi-hero baseline.

## 7. Explicit non-goals for this milestone

- Do not replace the public page with the G4 waitlist/capture variant or the single-hero alternate page.
- Do not expose the temporary sslip.io hostname in CTAs.
- Do not merge the OpenSaaS public marketing page into the public GodsEye landing page.
- Do not redesign the dashboard before the baseline is reviewed and field tweaks are agreed.
- Do not alter the database or payment logic as part of documenting this milestone.

## 8. Next work after approval

1. Field-tweak copy, spacing, and CTA placement on the canonical public page.
2. Finish email delivery configuration and confirmation testing.
3. Run authenticated signup → login → dashboard → logout testing.
4. Audit every public navigation and CTA destination.
5. Continue converging the OpenSaaS application UI on GodsEye tokens.

This document is the milestone baseline for future changes.
