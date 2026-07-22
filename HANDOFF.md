# Godseye HQ — Agent Handoff

> **Give this to any AI agent (OMP, Hermes, Claude Code) and they can start immediately.**
> Last Updated: 2026-07-21

---

## Quick Start for Any Agent

```
1. READ  /root/godseye-repo/PRD.md       ← Product context
2. READ  /root/godseye-repo/AGENTS.md    ← Working instructions
3. EDIT  /root/godseye-repo/src/App.tsx  ← Main file
4. RUN   cd /root/godseye-repo && npm run build  ← Rebuild
5. VERIFY https://godseye.digitalhustlerx.com    ← Live check
```

---

## One-Page Summary

| Item | Value |
|------|-------|
| **Product** | AI-powered WordPress management via Telegram |
| **Live** | https://godseye.digitalhustlerx.com |
| **Bot** | @GodseyeXbot |
| **Code** | `/root/godseye-repo/` |
| **Build** | `cd /root/godseye-repo && npm run build` → `dist/` |
| **Git** | `github.com/digitalhustlerx/GodseyeHQ.git` — **7 commits unpushed** |
| **License** | AGPL-3.0 + Commercial dual license |
| **Pricing** | Free / $9 / $29 / $99 (founder pricing: 50% off first 100) |
| **Phase** | Pre-launch (waitlist gated) |
| **Main file** | `src/App.tsx` (1,574 lines, single-file SPA) |

---

## What's Been Done (OMP commits)

| # | Commit | What |
|---|--------|------|
| 1 | Initial project structure | GitHub initial scaffold |
| 2 | Backup before copy/pricing | Pre-edit snapshot |
| 3 | Simplified copy + premium features | Cleaned up marketing text |
| 4 | Removed jargon | WordPressDashboard cleanup |
| 5 | Added README | Comprehensive GitHub readme |
| 6 | Updated Telegram bot → @GodseyeXbot | Bot handle changed |
| 7 | **Commercial launch** | AGPL license, WaitlistModal, founder pricing, referral system, self-host matrix, Supabase migration |

---

## What Needs Doing NOW

1. **🔴 Push to GitHub** — `git push origin main`
2. **🔴 Rebuild** — `npm run build` to update live site
3. **🟡 Wire Supabase** — WaitlistModal needs real Supabase URL + anon key
4. **🟡 Wire Polar.sh webhook** — Payment confirmation endpoint needed
5. **🟡 Deploy @GodseyeXbot** — Telegram bot handle set but may need token/config
6. **🟢 Replace old godseye.shop** — Old Next.js waitlist still serving

---

## File System (Everything That Matters)

```
/root/godseye-repo/ ← SOURCE OF TRUTH
├── PRD.md           ← Product Requirements
├── AGENTS.md        ← Agent instructions
├── HANDOFF.md       ← This file
├── src/App.tsx      ← ENTIRE APPLICATION
├── dist/            ← Build output (nginx serves this)
```

Everything under `/root/godseye/`, `/root/godseye-waitlist/`, `/home/openclaw/godseye-documentation/` is **legacy and should be ignored.**

---

*Handoff complete. Any agent picking this up should start with PRD.md → AGENTS.md → src/App.tsx.*
