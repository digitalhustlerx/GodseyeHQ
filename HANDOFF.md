# Godseye — Agent Handoff Document

> **Last Updated:** 2026-07-20
> **For:** AI agents (OMP, Hermes, Claude Code, etc.) picking up this project
> **Author:** Digital Viking / Digital Hustlers

---

## 1. 🎯 Project Identity

**Brand:** GodsEye (styled as GODSEYE or Godseye)
**Tagline:** *WordPress, managed by pure conversation.*
**What it is:** A Telegram-based AI agent that lets users manage WordPress sites via chat. Users connect their WordPress site (via plugin + app password), then talk to a Telegram bot to manage posts, pages, plugins, media, etc.

**Current Status:** Live at godseye.digitalhustlerx.com — React SPA with landing page, dashboard, pricing/buy flow, playground sandbox, and plugin download page.

---

## 2. 📍 The Source of Truth — Where to Edit

**THE ONLY DIRECTORY YOU SHOULD EDIT:**

```
/root/godseye-repo/
```

This is the React SPA cloned from `github.com/digitalhustlerx/Godseye.git`. Everything else is old/archived. Do NOT touch `/root/godseye/`, `/root/godseye-waitlist/`, `/root/godseye/dashboard/`, or `/home/openclaw/godseye-documentation/` — those are legacy.

### File structure inside `/root/godseye-repo/`:

```
/root/godseye-repo/
├── src/
│   ├── App.tsx              ← MAIN FILE (entire SPA is one component)
│   ├── main.tsx             ← Entry point (React render)
│   ├── index.css            ← Global styles + Tailwind
│   ├── types.ts             ← TypeScript types
│   ├── mockData.ts          ← Pricing data, credit packs
│   └── components/
│       ├── WordPressDashboard.tsx   ← Dashboard view
│       └── LivePlayground.tsx       ← Sandbox/playground view
├── index.html               ← HTML shell
├── package.json             ← Dependencies & scripts
├── vite.config.ts           ← Vite build config
├── tsconfig.json            ← TypeScript config
├── server.ts                ← Express server (for SSR/prod)
├── dist/                    ← BUILT OUTPUT (don't edit, auto-generated)
│   ├── index.html
│   ├── assets/
│   ├── server.cjs
│   └── server.cjs.map
├── AGENT.md                 ← Old agent instructions
└── README.md                ← Old readme
```

**App.tsx IS the entire application.** It's a single-file React SPA with views:
- `landing` — Marketing homepage with features, FAQ, waitlist
- `dashboard` — WordPress management dashboard
- `playground` — Live sandbox to test commands
- `buy` — Pricing plans & credit checkout (Polar.sh integration)
- `download` — Plugin download page with install guide
- `success` — Post-purchase confirmation page

---

## 3. 🌐 Live Endpoints

| URL | What | Serves From | Nginx Config |
|-----|------|-------------|-------------|
| **https://godseye.digitalhustlerx.com** | 🆕 React SPA (main) | `/root/godseye-repo/dist/` | `/etc/nginx/sites-available/godseye.digitalhustlerx.com` |
| **https://godseye.62.84.186.1.sslip.io** | 🆕 Same React SPA (mirror) | `/root/godseye-repo/dist/` | `/etc/nginx/sites-available/godseye.sslip` |
| **https://godseye.shop** | 🟡 Waitlist (Next.js, old) | `/root/godseye-waitlist/` on :3100 | `/etc/nginx/sites-available/godseye.shop` |
| **https://buy.godseye.shop** | 🟡 WordPress sales page | WordPress | `/etc/nginx/sites-available/buy.godseye.shop` |
| **https://api.godseyes.digitalhustlerx.com** | 🔧 Backend API | Unknown/legacy | `/etc/nginx/sites-available/godseye-api` |

> **IMPORTANT:** The two main endpoints (`digitalhustlerx.com` + `sslip.io`) both serve `/root/godseye-repo/dist/`. After editing source files in `src/`, you MUST rebuild with `cd /root/godseye-repo && npm run build` to update `dist/`.

---

## 4. 🧰 Build & Deploy Commands

```bash
# Development server (local only)
cd /root/godseye-repo && npm run dev

# Build for production
cd /root/godseye-repo && npm run build

# Run production server
cd /root/godseye-repo && node dist/server.cjs

# Reload nginx after config changes
nginx -t && systemctl restart nginx
```

---

## 5. 🧹 What's Legacy (DO NOT TOUCH)

These are old/abandoned copies from earlier development phases:

| Path | What | Status |
|------|------|--------|
| `/root/godseye/` | Full workspace (backend, mcp-server, telegram-bot, etc.) | 🟡 DORMANT — has some backend code that may be reusable |
| `/root/godseye/dashboard/` | Old HTML/CSS/JS dashboard | 🔴 LEGACY — replaced by React SPA |
| `/root/godseye/landing/` | Old landing page | 🔴 LEGACY |
| `/root/godseye-waitlist/` | Next.js waitlist (still at godseye.shop) | 🟡 ACTIVE but legacy — will be replaced |
| `/home/openclaw/godseye-documentation/` | Old documentation v1 | 🔴 LEGACY |
| `/home/openclaw/godseye-documentation-v2/` | Old documentation v2 | 🔴 LEGACY |
| `/home/hermes/godseye-plugin*.zip` | Plugin zip archives | 🟡 Can be deleted |
| `/home/openclaw/godseye-*.zip` / `.tar.gz` | Archived docs/plugins | 🟡 Can be deleted |

---

## 6. 🔑 Key Integrations & Dependencies

- **Polar.sh** — Payment processing (products already created)
- **API Backend** — `https://api.godseyes.digitalhustlerx.com` (handles auth, licenses, WordPress bridge)
- **Telegram Bot** — `@wordpressclawofficialbot` (the actual agent users chat with)
- **WordPress Plugin** — `godseye-agent` plugin installed on connected WordPress sites

---

## 7. 📋 What Needs Doing (Next Actions)

1. **Rebuild the React app** whenever source files are changed (`npm run build`)
2. **Update the git repo** with local changes (there are uncommitted edits in src/)
3. **Replace godseye.shop** (old Next.js waitlist) with the new React SPA when ready
4. **Connect Polar.sh products** to the buy flow if not already wired
5. **Point godseye.digitalhustlerx.com** to the proper domain if Digital Hustlers branding changes

---

## 8. 📸 Visual Reference

The React SPA has a dark theme (`bg-[#0A0A0A]`), gold accent (`text-[#C4A484]`), and uses `Georgia/serif` for headings. It's mobile-first responsive with TailwindCSS. Eye emoji (👁️) as logo/favicon.

---

*End of handoff. Edit `/root/godseye-repo/src/App.tsx`, rebuild with `npm run build`, and nginx auto-serves the new build.*
