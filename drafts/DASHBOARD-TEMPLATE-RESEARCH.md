# Responsive Web UI / Dashboard Templates — Research for Hermes Agent Dashboards

> **Date:** 2026-08-15 · **Status:** Research (recommendation, no prices final)
> **Goal:** Find the best, most intuitive **responsive dashboard / WebUI templates or working systems** to power a multi-tenant "run Your Agents" dashboard — frontend detached from the backend, accessed by users via "Get Started" / "Quit Account".

## Bottom line

**Recommended #1: `Kiranism/next-shadcn-dashboard-starter` (6.8k⭐, MIT).** It is the highest-starred, currently-maintained, *AI-friendly* admin dashboard template on GitHub, ships shadcn/ui + Next.js 16 + Tailwind v4 + **AI SDK chat already wired in**, and is MIT-licensed so you can fork and sell it. It is being cloned and stood up as a live demo (see below).

**Backend partner decision: use the ALREADY-LIVE Paperclip instance** (`paperclip.digitalhustlerx.com`, `systemctl active`, health `status:ok/ready`) rather than a fresh clone — fresh installs have real crash-loop pitfalls (exposure enum, datadir ownership, embedded-Postgres). The plan: **detach Paperclip's React frontend → serve the clone as the user-facing "Get Started" surface → Paperclip stays as the pure backend/API/auth (board API keys + JWT).** This is exactly the decouple-the-frontend-from-backend shape you asked for.

## Top candidate templates (GitHub API, live data 2026-08-15)

Stack-fit for Hermes: a **monitor/operate surface** (agent status, runs, boards, budgets), AI chat, auth, dark-mode-first, responsive.

| Rank | Repo | ⭐ | Stack | License | Why it fits Hermes | Build risk here |
|---|---|---|---|---|---|---|
| 1 | **Kiranism/next-shadcn-dashboard-starter** | 6.8k | Next.js 16 · shadcn/ui · Tailwind v4 · TS · **AI SDK** | MIT | AI chat UI already bundled; dashboard = "AI dashboard starter"; tables/forms/auth/billing | Clerk + Sentry to trim; Next build ~2–4GB |
| 2 | **arhamkhnz/next-shadcn-admin-dashboard** | 2.8k | Next.js 16 · shadcn/ui · TS | MIT | Clean modern admin; actively updated (2026-08-14) | Next build |
| 3 | **cruip/tailwind-dashboard-template** (Mosaic Lite) | 2.8k | Tailwind (pure, no React) | free | Lightweight static, fast | none (static) |
| 4 | **TailAdmin/free-react-tailwind-admin-dashboard** | 1.2k | React · Tailwind · TS | MIT | Full admin panel; you already know its dark-mode quirks | Vite build, light |
| 5 | **Qualiora/shadboard** | 706 | Next.js 15 · shadcn/ui · TS | MIT | Scalable user-facing web app shell | Next build |

Also relevant:
- **sunnysktsang/hermes-suite** (101⭐, MIT) — Docker/Podman bundle of `hermes-agent + hermes-webui + hermes-dashboard` in one container. Closest to a turnkey "Hermes dashboard." Shell; container-based.
- **GumbyEnder/hermes-dashboard-matrix-plus** (7⭐, TS) — an actual "dashboard to manage Hermes." Small but purpose-built.
- Design-system route (no repo): `popular-web-designs` skill has 54 brand design systems (Linear, Vercel, Supabase, Sentry, Superhuman) ready to apply to any of these shells for a premium dark agent-dashboard look.

## Recommendation logic

1. **MIT everywhere** → safe to fork, rebrand, and *sell* (no AGPL trap). This matters for the product path.
2. **shadcn/ui is the current standard** for clean, intuitive, responsive admin UI — TailAdmin felt dated; shadcn is the modern baseline.
3. **AI-friendly + AI SDK pre-wired (#1)** means the dashboard can directly drive agent chat/panels, not just CRUD.
4. **Prefers the frontend to be a distinct surface** so Paperclip backend can't leak UI responsibilities — matches the "detach front end, keep back end alone" requirement.

## Next steps (this batch)
1. `pnpm install` + build #1 into a live temp-domain demo (`<name>.62.84.186.1.sslip.io`) under our control.
2. Deliver this research as a PDF.
3. Plan Paperclip frontend/backend split for the "Get Started"/"Quit Account" surfaces.
