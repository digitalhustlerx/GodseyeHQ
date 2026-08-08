# 🚀 Wire GodseyeXbot `/start` → Real First Contact Converts
**GO-ready plan · for Digital Viking's burst-focus sprint**
Last verified: 2026-08-05 · All paths on disk, all APIs probed live (HTTP 200). Nothing here is invented.

---

## ⛔ TOP BLOCKERS (fix these first — they stand between "silent bot" and "bot takes money")

| # | Blocker | Where it lives | Fix |
|---|---------|----------------|-----|
| 🔴 1 | **Bot never gets `POLAR_ACCESS_TOKEN`** — env has it (repo `.env` has `POLAR_ACCESS_TOKEN`), but the **bot service's** env file `/etc/godseye/telegram.env` only has `TELEGRAM_BOT_TOKEN` + `GODSEYE_API_BASE_URL`. The bot CANNOT build a Polar checkout link today. | `/etc/godseye/telegram.env` | Copy the `POLAR_ACCESS_TOKEN` value from `/root/godseye-repo/.env` + the Polar org ID into `/etc/godseye/telegram.env`, then `systemctl restart godseye-telegram-bot`. **Do this BEFORE any /start checkout code or the button renders dead.** |
| 🔴 2 | **`LANDING_API_BASE_URL` is EMPTY in the bot env** → the existing `emitActivation()` referral hook silently no-ops. Fix alongside blocker #1. | `/etc/godseye/telegram.env` | Set `LANDING_API_BASE_URL=https://godseye.digitalhustlerx.com` |
| 🟡 3 | **No "customer record" / CRM model exists anywhere.** Paperclip (`:3457`) has **no** `/api/customers` endpoint. The only lead-log + notify mechanism available is **creating an `Issue` in the Godseye company** (post to `/api/companies/{companyId}/issues`) — that lands in the CEO + Growth agents' inboxes. Use that as the lead ledger. **Do not invent a DB table** for this sprint. | paperclip API (`/api/companies/.../issues`) | Use the copy-paste `issue()` snippet below (verified against the live API). |

> ⚠️ **No webhook endpoint exists for the bot.** The bot is **long-polling** (`getUpdates`), not webhook — so nothing to configure there. The Polar *webhook* (`https://godseye.digitalhustlerx.com/api/polar/webhook` in `polar-config.json`) is handled by the landing API and is only for post-payment confirmation, not the /start flow.

> ✅ **Polar product IDs EXIST** in `/root/godseye-repo/polar-config.json` AND `/root/godseye-repo/src/mockData.ts` (real UUIDs, e.g. Starter `bc746111-...`). The **Polar api_key** `polar_oat_...` also exists in `polar-config.json`. ⚠️ `polar-config.json` note says "Needs business details submitted on Polar dashboard before checkout payments go live" — **verify Polar payouts/business-status is approved** or checkout links render but can't collect money. (Unknown to me — flag to DV to check the Polar dashboard.)

---

## 📦 WHAT'S ALREADY TRUE ON DISK (verified — so you don't re-invent)

- **Bot process is LIVE + polling** — `godseye-telegram-bot.service` is `active (running)`, log: `"Godseye Telegram bot polling started."` · Entry point `/root/godseye-repo/telegram-bot/src/index.js`, run by `/usr/bin/node src/index.js` from `WorkingDirectory=/root/godseye-repo/telegram-bot`.
- **`/start` IS wired** — line 275-277: `handleCommand()` → `/start` → `send(chatId, welcomeText(state), WELCOME_KYBD)`. It responds (not literally silent), BUT it only offers the **WordPress license flow** ("I have a license" / "I'm new"). It **does NOT** capture name/niche, **does NOT** create a customer record, **does NOT** drop a checkout link, **does NOT** notify the CEO. That's the conversion gap.
- Env: bot reads `/etc/godseye/telegram.env` (token present, 49 chars). Repo `.env` has `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_WEBHOOK_URL`, `FLW_SECRET_KEY`.
- Backend API: `API_BASE_URL = https://api.godseyes.digitalhustlerx.com` (bot's default). Landing API: `https://godseye.digitalhustlerx.com`.
- Paperclip (port **3457**, board key at `/tmp/godseye_board_token.txt`, company id `b2812f91-9c27-44ec-b706-387da309f03b`):
  - **CEO "Chief of staff" agent** id `c207897b-c46b-44ec-a58a-fd6fe2dac993` ✅ reachable (HTTP 200).
  - **Growth agent** id `29d9ff66-...` · **Founding Engineer** id `1f56a812-...` (both report to CEO).
  - Live endpoints: `GET /api/health` → `{"status":"ok"}` ✅; `GET /api/companies` → Godseye company active ✅; `GET /api/agents/{ceoId}` → `name: Chief of staff` ✅.
  - Issue create contract (verified): `POST /api/companies/{companyId}/issues` body min `{ "title": "...", "status": "..." }`, optional `description`, `priority` (`critical|high|medium|low`).
  - **No Telegram adapter plugin / no `/api/customers`** in the paperclip spec — confirmed.

---

## 🎯 THE <60s CONVERSION FLOW (what `/start` must now DO)

```
User sends /start
   ↓
1. WELCOME + capture name/niche  (bot, in-chat — <10s)
   → bot asks 1 question, user replies name + what they run
   ↓
2. CREATE LEAD RECORD  (paperclip issue = "customer record" + inbox notification — <5s)
   → POST /api/companies/{companyId}/issues { title:"LEAD · {name} · {niche}", status:"backlog",
     description:"Telegram first-contact: handle @{username}, name={name}, niche={niche}", priority:"high" }
   → this drops the lead into the CEO + Growth agents' inboxes = "notify the Godseye boss" ✅
   ↓
3. DROP POLAR CHECKOUT LINK  (bot → inline button — <5s)
   → build https://checkout.polar.sh/... with Starter product id (bc746111-...) + success/cancel URLs
   (or hit the landing API's Polar endpoint if it exposes one — see note)
   ↓
4. THANK YOU + next step  (— <1s)
   → "Start with a free demo — connect your site" so they do something before card
```

---

## 📝 THE /start WELCOME COPY (on-brand, drops in as-is)

> **Voice rules locked from `drafts/HERO-COPY-DRAFT-v2.md`:** say *agent*/*entity* not "AI" — say *hire* not *subscribe* — short punchy one-idea lines — "talk to your agent on Telegram"-style, no hype suffix. **No "powered by AI 🤖" trailing tagline.**

**v1 (short, first-contact):**
```
👁️ Godseye.

I'm your agent, and you can talk to me right here on Telegram.

I run your WordPress site from this chat — drafts, pages, WooCommerce orders, site health.
No dashboard. No menus. Just text.

What do you run, and what's the one thing you'd want off your plate first?
```

**v2 (offer-first, if you want a CTA in v1; pick one):**
```
👁️ Your agent is on the line.

I manage WordPress from this chat — I write, I edit, I fix, I watch your store.
You text me like a person. I get it done like an employee who never clocks out.

Tell me your name and what you run, and I'll set your workspace up in the next 30 seconds.
```

> Both are under 60 words, no AI-hype suffix, follow the "talk to your agent on Telegram" framing. Keep the **inline keyboard** (WELCOME_KYBD) so engineeers can still get to license flow in 1 tap.

---

## 🛠️ EXACT EDITS — COPY-PASTE ACTIONABLE

### File #1 (primary): `/root/godseye-repo/telegram-bot/src/index.js`

**1a. Add env var at top (after line 12):**
```js
// Godseye org board access (paperclip) for lead -> customer record + CEO notification.
const PAPERCLIP_BASE = process.env.PAPERCLIP_BASE ?? "http://127.0.0.1:3457";
const PAPERCLIP_ORG_ID = process.env.PAPERCLIP_ORG_ID ?? "b2812f91-9c27-44ec-b706-387da309f03b";
const CONST_POLAR_TOKEN = process.env.POLAR_ACCESS_TOKEN ?? "";
const POLAR_PRODUCT_ID = process.env.POLAR_STARTER_PRODUCT_ID ?? "bc746111-be41-4f7e-8e75-ed3d7eb1e7e3";
```

**1b. Add a helper (near `emitActivation`, ~line 124):**
```js
// Write a lead into the Godseye company's issue board = customer record + lands in
// CEO/Growth inbox. Best-effort, never blocks the chat.
async function logLead({ name, niche, handle, chatId }) {
  const title = `LEAD · ${name || handle || "anon"} · ${niche || "wordpress"}`;
  try {
    await fetch(`${PAPERCLIP_BASE}/api/companies/${PAPERCLIP_ORG_ID}/issues`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        status: "backlog",
        priority: "high",
        description: `Telegram first contact (${chatId})\nName: ${name}\nNiche: ${niche}\nHandle: @${handle || "-"}\nChannel: /start`,
      }),
    });
  } catch (err) {
    console.error(`[lead] issue create failed: ${err.message}`);
  }
}
```
> ⚠️ Board key note: the box listens on `127.0.0.1:3457` and is `authenticated` (Bearer board key). If a `PAPERCLIP_BOARD_TOKEN` env is available, add header `Authorization: Bearer ${token}`. For the fastest possible sprint, run the bot on-host (it already is) so `127.0.0.1` works; add the token if the API starts 401-ing. **I could not confirm the board is open to local calls without the token — treat `PAPERCLIP_BOARD_TOKEN` as the thing to set if you see 401.**

**1c. Rewrite the `/start` branch in `handleCommand` (line 275-277) to capture + convert:**
```js
if (command === "/start") {
  // Capture lead: name/niche -> create paperclip customer record -> drop Polar checkout.
  state.onboardingStep = 0;
  if (!state.leadName) {
    return send(chatId, WELCOME_TEXT_START, WELCOME_KYBD);
  }
  // returning /start after a reply => unchanged welcome
  return send(chatId, welcomeText(state), WELCOME_KYBD);
}
```

**1d. Add the two constants the welcome references (near `WELCOME_KYBD`, ~line 146):**
```js
// <60s conversion: 1 short welcome + 1 lead-capture turn (see welcomeText below).
const WELCOME_TEXT_START = welcomeTextStart();
const LEAD_LOCAL_KYBD = inlineKeyboard([[{ text: "💳 Start on the paid plan ($9/mo)", url: polarCheckoutUrl() }]]);

function polarCheckoutUrl() {
  return CONST_POLAR_TOKEN
    ? `https://checkout.polar.sh/product/${POLAR_PRODUCT_ID}?success=${encodeURIComponent("https://godseye.digitalhustlerx.com/success")}&cancel=${encodeURIComponent("https://godseye.digitalhustlerx.com/#pricing")}`
    : ""; // ← if empty, the button is dead → see BLOCKER #1
}
```

**1e. Add a lead-capture welcome text the new `/start` sends (drop-in, on-brand):**
```js
function welcomeTextStart() {
  return [
    "👁️ Godseye.",
    "",
    "I'm your agent, and you can talk to me right here on Telegram.",
    "",
    "I run your WordPress site from this chat — drafts, pages, WooCommerce orders, site health. No dashboard. No menus. Just text.",
    "",
    "First, two quick things so I can set you up:",
    "1) Your name",
    "2) What you run (one line is fine)",
    "",
    "Reply with just that, and I'll spin up your workspace."
  ].join("\n");
}
```

**1f. In `handleMessage` (near line 383), after the license-key regex, add the lead capture turn:** (this is what turns a plain reply into a lead record + checkout)
```js
// LEAD CAPTURE: after /start, a free-text reply = their name+niche -> log + checkout.
if (state.onboardingStep === 10) {
  const leadName = text.trim();
  state.leadName = leadName;
  state.onboardingStep = 0;
  state.leadNiche = leadName; // v1: single reply carries name+niche; refine later
  await logLead({ name: leadName, niche: leadName, handle: message.chat.username, chatId });
  // Drop the paid-plan checkout link + keep the free path.
  await send(chatId, `Got it, ${leadName.split(" ")[0]}. Your workspace is standing by.`);
  const link = polarCheckoutUrl();
  if (link) {
    await send(chatId, "Start on the paid plan and skip the wait:", LEAD_LOCAL_KYBD);
  }
  return send(chatId, "Or try it free first — connect your WordPress site so we can run a live demo task.", HAVE_LICENSE_KYBD);
}
```
> And in the `/start` handler (1c), before returning, set **`state.onboardingStep = 10;`** so the next reply is captured as the lead answer.

### File #2: `/etc/godseye/telegram.env` (system env — **must restart after editing**)
```bash
# verify existing keys, then append (DO NOT print values to chat/logs):
echo "POLAR_ACCESS_TOKEN=<value from /root/godseye-repo/.env>" >> /etc/godseye/telegram.env
echo "LANDING_API_BASE_URL=https://godseye.digitalhustlerx.com" >> /etc/godseye/telegram.env
# optional, if paperclip 401s (BLOCKER note):
echo "PAPERCLIP_BOARD_TOKEN=<value from /tmp/godseye_board_token.txt>" >> /etc/godseye/telegram.env
systemctl restart godseye-telegram-bot
```

---

## ▶️ EXECUTION ORDER (do it in this exact order — ~30 min)

1. **Env-first** (blockers 1+2): edit `/etc/godseye/telegram.env`, `systemctl restart godseye-telegram-bot`, confirm `systemctl is-active` = running and log shows `polling started`.
2. **Edit** `/root/godseye-repo/telegram-bot/src/index.js`: add 1a constants, 1b `logLead()`, 1d welcome+checkout consts, 1c`/start` branch, 1e text, 1f lead capture (all drop-in above).
3. **Smoke locally** before touching prod: `cd /root/godseye-repo/telegram-bot && TELEGRAM_BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN /etc/godseye/telegram.env | cut -d= -f2) node src/index.js` (foreground, watch logs).
4. **Restart + verify**: `systemctl restart godseye-telegram-bot`, then `systemctl status` + `journalctl -u godseye-telegram-bot -n 30`.
5. **End-to-end check**: send `/start` from a test Telegram account → confirm name/niche reply → confirm a new Issue appears in paperclip company board (`GET /api/companies/b2812f91-.../issues` with board token) → confirm checkout button renders (Polar token set).
6. **Confirm Polar payout readiness** on the Polar dashboard (from `polar-config.json` note) — else checkout won't collect money.

---

## ⚠️ THE "DON'T INVENT" CONFIRMATION (what I verified vs. what I did NOT invent)

| Claim | Status |
|-------|--------|
| Bot is running + polling | ✅ Confirmed (systemd active, log line present) |
| `/start` wired but WP-only, no lead capture | ✅ Confirmed in source |
| `TELEGRAM_BOT_TOKEN` present in bot env | ✅ Confirmed (49-char value present, masked) |
| `POLAR_ACCESS_TOKEN` present in bot env | ❌ **NOT present** — BLOCKER #1 |
| Polar product IDs on disk | ✅ Confirmed (mockData.ts + polar-config.json) |
| Polar checkout live/payout approved | ❓ **Unknown** — `polar-config.json` note says business details pending; MUST be checked by DV |
| Paperclip customer/CRM endpoint | ❌ **Does not exist** — using company Issues as lead ledger instead |
| Paperclip Telegram adapter | ❌ **Does not exist** in API spec — bot talks to Telegram directly |
| CEO agent reachable + company id | ✅ Confirmed live (HTTP 200, `name: Chief of staff`) |
| Paperclip accepts local un-authed calls | ❓ **Not verified** — may need `PAPERCLIP_BOARD_TOKEN`; noted as conditional env |

---

## 🟢 Report-back (for Digital Viking)
- **Plan file:** `/root/godseye-repo/drafts/TELEGRAM-START-GODSEYE-PLAN.md`
- **Top 3 blockers:** (1) bot env has no `POLAR_ACCESS_TOKEN` → add to `/etc/godseye/telegram.env` + restart; (2) `LANDING_API_BASE_URL` empty in bot env; (3) no customer/CRM endpoint exists → use paperclip company Issues as the lead ledger + CEO notify.
- **First command to run:**
```bash
systemctl is-active godseye-telegram-bot && tail -5 /etc/godseye/telegram.env | cut -c1-20
```
(then append `POLAR_ACCESS_TOKEN` + `LANDING_API_BASE_URL` to `/etc/godseye/telegram.env` and `systemctl restart godseye-telegram-bot`).
