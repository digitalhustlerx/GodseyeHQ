# Godseye HQ — Agent Handoff

> Current milestone: **Pre-launch landing baseline approved**
> Last Updated: 2026-08-11

## Quick Start

```text
1. READ /root/godseye-repo/PRD.md
2. READ /root/godseye-repo/AGENTS.md
3. READ /root/godseye-repo/docs/PRE-LAUNCH-LANDING-MILESTONE-PRD.md
4. EDIT only /root/godseye-repo
5. Build: cd /root/godseye-repo && npm run build
6. Deploy: ./scripts/deploy.sh
7. Verify https://godseye.digitalhustlerx.com
```

## Canonical architecture

| Surface | URL | Role |
|---|---|---|
| Public pre-launch landing/application | https://godseye.digitalhustlerx.com | Original GodsEye page; canonical public front door |
| Signup | https://app.digitalhustlerx.com/signup | OpenSaaS branded auth |
| Login | https://app.digitalhustlerx.com/login | OpenSaaS branded auth |
| Authenticated app | https://app.digitalhustlerx.com | Dashboard, account, pricing, subscriptions |
| Legacy public alias | https://godseye.shop | Redirects to canonical public page |
| Legacy purchase alias | https://buy.godseye.shop | Redirects to app pricing |

The OpenSaaS marketing landing page must not flash between the public GodsEye page and signup/login. The temporary sslip.io hostname is not customer-facing.

## Current milestone

The original Godseye application page has been restored to `godseye.digitalhustlerx.com`. It is the approved pre-launch landing baseline for field tweaking. Its Get Started and Log In CTAs point directly to the canonical OpenSaaS auth URLs.

See `docs/PRE-LAUNCH-LANDING-MILESTONE-PRD.md` for acceptance criteria and remaining work.

## Remaining work

1. Field-tweak the canonical public page copy, spacing, and CTA placement.
2. Configure production SMTP and verify confirmation email delivery.
3. Complete authenticated signup → login → dashboard → logout dogfood testing.
4. Audit all public links and outcomes.
5. Continue aligning the OpenSaaS app UI with GodsEye design tokens.

## Deployment

```bash
cd /root/godseye-repo
npm run build
./scripts/deploy.sh
nginx -t && systemctl reload nginx
git add -A && git commit -m "<message>" && git push origin main
```

Do not run destructive Wasp rebuilds casually. OpenSaaS production uses a Wasp static client at `.wasp/out/web-app/build/` and API/auth server on port 3101; consult the `wasp-framework-deployment` skill before changing it.

## GitHub

`https://github.com/digitalhustlerx/GodseyeHQ`

## Source of truth

`/root/godseye-repo` is the only Godseye repo to edit. Legacy directories are reference-only and must not be modified unless explicitly requested.

— End handoff —

## Legacy reference

The previous handoff described the old waitlist-gated phase and is superseded by this milestone baseline.

## Verification

Always verify the actual live title and CTA targets, not only HTTP status:

```bash
curl -sk https://godseye.digitalhustlerx.com/ | grep -o '<title>[^<]*'
curl -sk https://godseye.digitalhustlerx.com/ | grep -o 'https://app.digitalhustlerx.com/[^" ]*'
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/signup
curl -sk -o /dev/null -w '%{http_code}\n' https://app.digitalhustlerx.com/login
```

## Ownership

This milestone was approved by the product owner as the baseline before launch. Future field tweaks should be small, reviewable, and preserved in Git history.

## Versioning

Milestone name: `pre-launch landing baseline`

## Notes

Do not reintroduce waitlist/capture copy or temporary auth domains into the primary flow without explicit product approval.

## End


