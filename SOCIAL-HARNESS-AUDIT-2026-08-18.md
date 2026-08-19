# Social Harness v2 — Accessibility & UX Audit + Enhancement Plan

**Date:** 2026-08-18  
**Target:** `https://social.digitalhustlerx.com/` (port 44006, `/srv/social-harness-v2/`)  
**Status:** Running, auth-guarded, real Instagram/Facebook/LinkedIn sync active

---

## Executive Summary

The app works for the **single demo user** (`officialvendet@gmail.com`) with 3 real connected channels. But it fails as a **multi-user product**:

| Area | Current | Target |
|------|---------|--------|
| **Auth** | OTP-only, hardcoded `SH_USERS` env, no account creation | Clerk/Privy auth, self-serve signup, multi-tenant isolation |
| **Channel Connect** | No "Add Channel" button — only shows pre-existing channels | "+ Add Channel" flow per platform with guided OAuth |
| **Platform Coverage** | Instagram, Facebook, LinkedIn only | + Twitter, TikTok, YouTube, Substack |
| **Accessibility** | Basic semantic HTML, no ARIA, no focus management | WCAG 2.1 AA, full keyboard nav, screen reader support |
| **Data Isolation** | Single JSON DB, all users see same data | Per-user data isolation (multi-tenant) |

---

## 1. Accessibility Audit (WCAG 2.1 AA)

### Critical (Blockers)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| A1 | **No skip-to-main link** — keyboard users tab through entire sidebar first | `App.tsx`, `Sidebar.tsx` | Add `<a href="#main-content" class="skip-link">Skip to main content</a>` at top of body |
| A2 | **Login form missing `autocomplete` attributes** — password managers can't fill OTP | `Login.tsx:133-142` | Add `autocomplete="one-time-code"` to OTP input, `autocomplete="email"` to email |
| A3 | **Focus trap missing in OAuth popup flow** — keyboard focus lost when popup opens | `Channels.tsx:115` | Store `document.activeElement` before `window.open()`, restore on close |
| A4 | **No live regions for status changes** — screen readers miss "Connected"/"Syncing" | `Channels.tsx:294-297` | Add `aria-live="polite"` to status badge container |
| A5 | **Color-only status indicators** — green/amber badges fail for colorblind users | `Channels.tsx:294-297` | Add text labels ("● Connected" / "○ Disconnected") + icons |
| A6 | **Missing `lang` attribute** on `<html>` — screen readers assume wrong language | `index.html` | Add `<html lang="en">` |
| A7 | **No landmarks** — no `<main>`, `<nav>`, `<aside>` roles | `App.tsx`, `Sidebar.tsx` | Wrap content in semantic landmarks |
| A8 | **Modal/popup focus management** — OAuth popup has no focus return | `Channels.tsx:115` | Implement focus restoration on popup close |

### Serious (UX Degradation)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| A9 | **Tab order broken in channel cards** — status badge before platform name | `Channels.tsx:282-297` | Reorder: platform icon → name → handle → status badge |
| A10 | **No error announcements** — login errors not announced to screen readers | `Login.tsx:116-121` | Add `role="alert"` to error div |
| A11 | **Buttons missing accessible names** — icon-only buttons (Disconnect) | `Channels.tsx:321-331` | Add `aria-label="Disconnect Instagram"` |
| A12 | **Form labels not associated** — placeholder-only labels | `Login.tsx:172-186` | Keep visible `<label>` with `htmlFor` matching input `id` |
| A13 | **No heading hierarchy** — `h1` → `h3` jump in Channels | `Channels.tsx:181, 288` | Add `h2` for "Connected Channels" section |
| A14 | **Touch targets too small** — 32px min not met on mobile badges | `Channels.tsx:294` | Minimum 44×44px touch targets |
| A15 | **Reduced motion not respected** — animations run regardless | `Login.tsx:87-100` | Add `@media (prefers-reduced-motion: reduce)` disables |

### Enhancement (Polish)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| A16 | **No keyboard shortcuts** — power users can't navigate fast | Global | Add `?` for help, `g i` for Inbox, `g c` for Channels |
| A17 | **No high-contrast mode** — forced brand colors | `index.css` | Add CSS custom properties for `--bg`, `--fg`, `--accent` |
| A18 | **Focus visible only on keyboard** — mouse users lose context | Global | `:focus-visible` instead of `:focus` |
| A19 | **No page titles on SPA nav** — screen readers don't announce route change | `App.tsx` | Update `document.title` on route change |
| A20 | **Loading states not announced** — "Updating connection matrix..." silent | `Channels.tsx:262` | `aria-busy="true"` + `aria-live="polite"` |

---

## 2. Functional Problems (Current Running Instance)

### Critical (Broken Features)

| # | Problem | Evidence | Root Cause |
|---|---------|----------|------------|
| F1 | **No "Add Channel" button** — user can't initiate new connections | Channels page only shows existing 3 channels | Channels.tsx renders only `channels` array, no "add new" UI |
| F2 | **Twitter/TikTok/YouTube OAuth blocked** — no Auth Configs in Composio | 503 responses with `needsManualSetup: true` | Composio dashboard requires manual Auth Config creation |
| F3 | **No account creation** — only `SH_USERS` hardcoded email works | Login.tsx only handles OTP for known users | No signup flow, no user registration API |
| F4 | **No multi-user isolation** — all users share same `data/db.json` | Single JSON file, no `user_id` on records | Architecture built for single demo user |
| F5 | **Substack not in platform list** — not in `SOCIAL_PLATFORMS` | `server.ts:259-261` | Never added to allowlist |
| F6 | **YouTube not in platform list** — not in `SOCIAL_PLATFORMS` | `server.ts:259-261` | Never added to allowlist |
| F7 | **Facebook Personal vs Page not distinguished** — both map to same "FACEBOOK" | Only one Facebook channel type | Meta Graph API needs different permissions |
| F8 | **LinkedIn shows "Connected" but zero DM sync** — no DM tools in Composio | Stats show `LINKEDIN: total: 0` | Composio LinkedIn toolkit has only posting, no messaging |

### Serious (Missing Product Features)

| # | Problem | Impact |
|---|---------|--------|
| F9 | **No onboarding flow** — new users land on empty Inbox | Confusion, churn |
| F10 | **No connection status polling** — UI doesn't auto-refresh after OAuth | User must manual refresh |
| F11 | **No sync progress indicator** — "Syncing..." spinner but no % | Uncertainty |
| F12 | **No error recovery UI** — failed OAuth shows raw alert() | Poor UX, no retry |
| F13 | **No channel reordering** — fixed grid order | Can't prioritize |
| F14 | **No bulk disconnect** — one by one only | Tedious for agencies |
| F15 | **No webhook/test message button** — can't verify connection works | Blind trust |

---

## 3. Enhancement Suggestions (Ideal Product Standard)

### Must-Have (Launch Blockers)

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| E1 | **Third-party auth (Clerk/Privy)** | Self-serve signup, multi-tenant, SOC2, free tier | 3-5 days |
| E2 | **Multi-tenant data isolation** | Required for any real customers | 2-3 days |
| E3 | **"Add Channel" wizard** | Core value prop — connect accounts | 2 days |
| E4 | **Twitter + TikTok + YouTube OAuth** | Top 3 requested platforms | 1-2 days each (Composio config) |
| E5 | **Facebook Page vs Personal distinction** | Different API permissions | 1 day |
| E6 | **Onboarding tour** | Activation metric | 1 day |

### Should-Have (Post-Launch)

| # | Feature | Why |
|---|---------|-----|
| E7 | **Connection health dashboard** | Show last sync, errors, rate limits |
| E8 | **Webhook verification** | Test DM send/receive |
| E9 | **Team workspaces** | Agency use case |
| E10 | **Usage analytics** | Track adoption per platform |

### Nice-to-Have

| # | Feature |
|---|---------|
| E11 | **Dark mode** |
| E12 | **Keyboard shortcuts** |
| E13 | **Bulk operations** |
| E14 | **Substack integration** (if API exists) |

---

## 4. Third-Party Auth Evaluation

### Comparison (Free Tier Focus)

| Provider | Free Tier | Multi-tenant | Agent-Controllable | Setup Time | Best For |
|----------|-----------|--------------|-------------------|------------|----------|
| **Clerk** | 10K MAU free | ✅ Organizations | ✅ Full API + CLI | 30 min | B2B SaaS, teams |
| **Privy** | 10K MAU free | ✅ Projects | ✅ API + embedded | 30 min | Web3 + email/social |
| **Auth.js (NextAuth)** | Self-hosted free | ⚠️ Manual | ✅ Full code control | 2-3 hrs | Custom needs |
| **Supabase Auth** | 50K MAU free | ✅ Row-level security | ✅ Full API | 1 hr | Postgres apps |
| **Firebase Auth** | Spark plan free | ✅ Projects | ✅ Admin SDK | 1 hr | Google ecosystem |
| **Stack Auth** | 10K MAU free | ✅ Teams | ✅ API + React | 30 min | Next.js apps |
| **WorkOS** | Dev free, pay per seat | ✅ Orgs | ✅ API | 1 hr | Enterprise SSO |

### Recommendation: **Clerk**

**Why:**
- Best free tier for B2B (10K MAU = ~500 active workspaces)
- Native **Organizations** = multi-tenant workspaces out of the box
- Full **Admin API** — agent can create orgs, invite users, manage sessions via API
- **Clerk CLI** — `clerk users create`, `clerk organizations create` scriptable
- **Embeddable components** — `<SignIn/>`, `<UserButton/>`, `<OrganizationSwitcher/>`
- **Webhooks** — `user.created`, `organization.created` for sync to our DB
- **No credit card** to start

**Integration Path:**
1. `npm install @clerk/clerk-react @clerk/clerk-sdk-node`
2. Create Clerk app → get `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
3. Wrap `App.tsx` in `<ClerkProvider>`
4. Replace `Login.tsx` with `<SignIn/>`
5. Add `/api/webhooks/clerk` to sync users → our `db.json` (or migrate to Postgres)
6. Use `auth()` middleware in Express for API routes

**Agent-Controlled Setup:**
```bash
# Via Clerk CLI (installable via npm)
clerk users create --email "test@user.com" --password "temp123"
clerk organizations create --name "Test Workspace" --slug "test-workspace"
clerk organization-memberships create --org "test-workspace" --user "test@user.com" --role "admin"
```

---

## 5. Platform Connection Standards

### Required Platform Matrix

| Platform | OAuth Type | Composio Support | DM Read | DM Send | Notes |
|----------|------------|------------------|---------|---------|-------|
| **Instagram** | Meta Graph (Business) | ✅ Managed | ✅ | ❌ | Needs Business account + FB Page |
| **Facebook Page** | Meta Graph | ✅ Managed | ✅ | ✅ | Page access token |
| **Facebook Personal** | Meta Graph | ❌ Not supported | ❌ | ❌ | No API for personal DMs |
| **Twitter/X** | OAuth 2.0 (custom) | ⚠️ Custom creds | ✅ | ✅ | Need X Developer Portal app |
| **TikTok** | OAuth 2.0 (custom) | ⚠️ Custom creds | ❌ | ⚠️ Post only | No DM API anywhere |
| **LinkedIn** | OAuth 2.0 | ✅ Managed | ❌ | ❌ | Only posting/analytics |
| **YouTube** | OAuth 2.0 | ❌ Not in Composio | ❌ | ❌ | Need Google Cloud project |
| **Substack** | None public | ❌ No API | ❌ | ❌ | No official API |
| **WhatsApp** | Baileys (self-hosted) | ❌ Not in Composio | ✅ | ✅ | Separate integration |

### Reality Check

**Actually connectable with DMs today:**
1. **Instagram** (read only) — ✅ Working
2. **Facebook Page** (read + send) — ✅ Working via Composio
3. **Twitter/X** (read + send) — ⚠️ Needs X Developer App + Composio Auth Config
4. **WhatsApp** — ⚠️ Separate Baileys integration (not Composio)

**Not feasible for DMs:**
- LinkedIn (no DM tools in Composio)
- TikTok (no DM API anywhere)
- YouTube (no DM API)
- Substack (no public API)
- Facebook Personal (no API)

### Recommended UI Approach

```
┌─────────────────────────────────────────────────────────┐
│  Connected Channels                    [+ Add Channel]  │
├─────────────────────────────────────────────────────────┤
│  📷 Instagram          @hqtraders        ● Connected   │
│     Secure OAuth tunnel verified                        │
│     [Disconnect]                                        │
├─────────────────────────────────────────────────────────┤
│  📘 Facebook Page      HQ Traders        ● Connected   │
│     Secure OAuth tunnel verified                        │
│     [Disconnect]                                        │
├─────────────────────────────────────────────────────────┤
│  💼 LinkedIn           @user             ○ Disconnected │
│     Not linked via OAuth — connect to sync              │
│     [OAuth Connect]                                     │
├─────────────────────────────────────────────────────────┤
│  🐦 Twitter/X          —                 ○ Disconnected │
│     Requires X Developer App → [Configure in Composio]  │
│     [Setup Guide]                                       │
├─────────────────────────────────────────────────────────┤
│  🎵 TikTok             —                 ○ Disconnected │
│     Posting only — no DM support                        │
│     [Learn More]                                        │
├─────────────────────────────────────────────────────────┤
│  ▶️ YouTube             —                 ○ Disconnected │
│     Not yet supported — [Join Waitlist]                 │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Plan (Phased)

### Phase 0: Foundation (Week 1)
- [ ] **Clerk auth integration** — replace OTP flow
- [ ] **Multi-tenant DB migration** — add `user_id`/`org_id` to all records
- [ ] **API auth middleware** — Clerk JWT verification
- [ ] **Webhook sync** — Clerk → local user/org mapping

### Phase 1: Channel Management (Week 1-2)
- [ ] **"Add Channel" button + modal** in Channels.tsx
- [ ] **Platform cards for all 8 platforms** (with honest capability labels)
- [ ] **Twitter/TikTok Auth Config creation guide** (Composio dashboard)
- [ ] **Facebook Page vs Personal selector** in OAuth flow

### Phase 2: Accessibility (Week 2)
- [ ] All 20 accessibility fixes (A1-A20)
- [ ] Automated axe-core testing in CI
- [ ] Manual screen reader testing (NVDA/VoiceOver)

### Phase 3: Onboarding & Polish (Week 2-3)
- [ ] **First-run wizard**: Auth → Add Channel → View Inbox
- [ ] **Connection health indicators** (last sync, errors)
- [ ] **Test message button** per channel
- [ ] **Empty states with guidance** for each page

---

## 7. Quick Wins (Can Ship Today)

| # | Fix | File | Lines |
|---|-----|------|-------|
| Q1 | Add "Add Channel" button to Channels header | `Channels.tsx:177-188` | +15 lines |
| Q2 | Add `autocomplete` to Login inputs | `Login.tsx:133, 179` | +2 attrs |
| Q3 | Add skip link + landmarks | `App.tsx`, `index.html` | +10 lines |
| Q4 | Add `aria-label` to icon buttons | `Channels.tsx:321, 333` | +2 attrs |
| Q5 | Add YouTube/Substack to platform list (disabled) | `Channels.tsx:132-157` | +10 lines |
| Q6 | Focus restoration on OAuth popup | `Channels.tsx:115` | +5 lines |
| Q7 | Live region for status badges | `Channels.tsx:294` | +1 attr |
| Q8 | Heading hierarchy fix | `Channels.tsx:181, 288` | +1 h2 |

---

## 8. Blocker Reporting Protocol

If any task stalls > 30 min:
1. **Document exact error** (command + output)
2. **Identify dependency** (external API, creds, design decision)
3. **Propose 2 alternatives** (workaround vs proper fix)
4. **Escalate with specific ask** — "Need X from you to unblock Y"

---

## 9. Success Metrics (Evals)

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Signup → First Channel Connected** | N/A (no signup) | < 5 min | Funnel analytics |
| **Channel Connect Success Rate** | ~60% (manual) | > 90% | OAuth callback logs |
| **Accessibility Score (axe-core)** | ~60% | 100% (no violations) | Automated CI |
| **Multi-user Isolation** | 0% | 100% | Cross-user data leak test |
| **Platform Coverage (DMs)** | 2/8 | 4/8 | Feature matrix |

---

## Next Steps

1. **Approve Clerk as auth provider** → I'll integrate it
2. **Confirm platform priority** — Twitter vs TikTok vs YouTube first?
3. **Decide on DB migration** — stay JSON (add user_id) or move to Postgres?
4. **Composio Auth Config** — I can guide you through dashboard setup for Twitter/TikTok, or you can create them

**Want me to start with Phase 0 (Clerk auth + multi-tenant) or Phase 1 (Add Channel UI + platform cards)?**