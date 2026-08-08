# GodseyeXbot — Bot Wiring Plan (prep pack for Digital Viking)

> **Status:** INVESTIGATION COMPLETE — ready to build. Verified Aug 06 18:00 CEST by subagent.
> **SCOPE NOTE:** This is a *plan / prep pack*, not a code change. No production file was modified.

---

## 1. HONEST VERDICT — the bot is NOT "dead", but the funnel has 3 real gaps

### 1a. The bot process itself IS wired and currently RUNNING ✅
This is the headline, and it **contradicts the stale marketing docs**.

Every fleet doc says `/start` is "NOT wired — CRITICAL blocker" and that the bot runs "via openconnector"/"via Composio":
- `marketing-fleet/channels/CHANNEL-INVENTORY.md:24` → `| 2.2 | @GodseyeXbot | 🟡 /start NOT wired | …  🔥 CRITICAL |`
- `marketing-fleet/channels/CHANNEL-INVENTORY.md:105` → "Wire @GodseyeXbot `/start` — nothing converts until onboarding works."
- `marketing-fleet/accounts/accounts-registry.md:23,60,62` → "`/start` NOT wired — CRITICAL blocker. via openconnector."
- `marketing-fleet/agents/AGENT-FLEET.md:70` is the only one that does NOT claim this.

**These documents are outdated.** Verified evidence the bot is fully wired at the process level:

| Check | Evidence | Result |
|-------|----------|--------|
| Bot source exists | `/root/godseye-repo/telegram-bot/src/index.js` (567 lines) | Full `/start`, `/connect`, `/sites`, `/site`, `/status`, `/approve`, `/reject`, inline keyboards, onboarding wizard, task execution ✅ |
| Systemd unit | `/etc/systemd/system/godseye-telegram-bot.service` → `ExecStart=/usr/bin/node src/index.js`, `WorkingDirectory=/root/godseye-repo/telegram-bot`, `EnvironmentFile=/etc/godseye/telegram.env` | ✅ |
| Service running | `systemctl status godseye-telegram-bot` → **active (running)** since **2026-08-06 13:54**, Main PID 1082325, `node src/index.js` (cwd `/root/godseye-repo/telegram-bot`) | ✅ |
| Token is now VALID | `curl …/getMe` → `{"ok":true,"result":{"id":8817657741,"username":"GodseyeXbot","first_name":"GodseyeHQbot",…}}` | ✅ VALID @GodseyeXbot |
| Webhook conflict | `…/getWebhookInfo` → `{"url":"","pending_update_count":0}` | No webhook → long-poll path is clear ✅ |
| Env loaded | PID 1082325 `/proc/…/environ` has `TELEGRAM_BOT_TOKEN`, `GODSEYE_API_BASE_URL`, `POLAR_ACCESS_TOKEN`, `LANDING_API_BASE_URL` | ✅ |
| Live round-trip | journal `godseye-telegram-bot` 16:17:53 → `[GOD-14] activation emitted for digital.viking@example.com … (HTTP 200)` | Bot → backend API works end-to-end ✅ |

**The fix already happened today.** The journal shows the *previous* PID (815575) spamming `[telegram] Polling error: Unauthorized` from 13:52→13:54 — that was an **invalid bot token**. At 13:54:45 `/etc/godseye/telegram.env` was rotated (file mtime 13:54, with backup `telegram.env.bak.token`) to a **valid** token, the service restarted, and polling has been clean since (`"Godseye Telegram bot polling started."`).

### 1b. What the bot does vs. how it authenticates
- **Runtime:** pure Node long-polling. `index.js:41-63` (`telegram()` helper) → `POST https://api.telegram.org/bot<TOKEN>/getUpdates` with `timeout:30`, loop in `runPolling()` at `index.js:532-560`. IPv4 forced at `index.js:23-24` (the box has no IPv6 route to api.telegram.org).
- **Backend it talks to:** `GODSEYE_API_BASE_URL` default `https://api.godseyes.digitalhustlerx.com` (`index.js:4`). nginx `godseye-api` config → `proxy_pass http://127.0.0.1:8787`. Port 8787 is served by **the legacy backend** `godseye-backend.service` (PID 2043694, `node --experimental-strip-types /root/godseye/backend/src/index.ts` → imports `./server.ts`).
- The bot's API calls all resolve in the legacy backend: `/api/sites?licenseKey` (legacy server.ts:159), `/api/licenses/:key` (legacy :247), `/api/tasks/plan` (legacy :416), `/api/tasks/:id/approve` (legacy :452). Verified present.

### 1c. The three REAL gaps (why users still get stuck)
The process runs, but the **onboarding funnel is inconsistent**, so conversions still break:

**GAP A — `/connect` contract mismatch (the big one).** 3 places tell the user to send *site URL + WP username + Application Password*:
- Polar confirmation email: `server.ts:1033-1034` "send `/connect` with your site URL, WordPress username, and an Application Password."
- Email HTML: `server.ts:1041` (same).
- Draft spec: `drafts/BOT-SPEC.md:124-135` "`/connect wordpress` → ask site URL → ask Application Password → test → Connected."

But the **actually-implemented** `/connect` reads a **license key**, not WP creds:
- `telegram-bot/src/index.js:361-398` → parses `rest[0]` as `<license_key>`, calls `getLicense()` (`/api/licenses/:key`) + `findSitesForLicense()` (`/api/sites?licenseKey=`).
- If rest is not a GS-key, user gets "Usage: `/connect <license_key>`…" or "Unknown command." A user who follows the email and pastes a URL into `/connect` gets stuck.

The WP App Password is **also not used by the system at all** — the legacy executor authenticates to WP via the **Godseye bridge plugin / HMAC** (`bridge-client.ts:25-29` x-godseye-site-id/x-godseye-timestamp; `executor.ts:36-235` only calls `callBridge`). So "send your WP app password" is a fiction in the current architecture.

**GAP B — no telegramId → purchase attribution.** The `users` table defines `telegram_id TEXT` (`server.ts:302`) but **nothing ever writes it** (`grep telegram_id server.ts` → only the column def + unrelated mock `/api/balance/:telegramId` at :794-810). The Polar webhook attributes payment by **email** (`server.ts:952`) and **`metadata.tx_ref` → `purchases`** (‎`server.ts:956`). The bot has no way to confirm a given Telegram user actually paid — it only checks whether a license key exists in the legacy store.

**GAP C — the two backends are NOT bridged (monetization hole).** Purchase logic lives in the **godseye-repo** SQLite backend (port 3000, `dist/server.cjs` PID 1047240): `/api/create-checkout`→Polar, `/api/polar-webhook→purchases/users/waitlist`. The bot's license/site/task logic lives in the **legacy backend** JSON-file store (`/root/godseye/backend/.data/state.json`, `store.ts:18`). **Nothing links them.** Evidence:
- godseye-repo `server.ts` has zero `fetch` to `api.godseyes…` or `:8787` or `/api/licenses` or `/api/signup` (grep empty).
- Legacy `/api/licenses` POST (`server.ts:235-245`) mints a `GS-####-####` license for *any* name+email with **no payment check**.
- The bot smoke test uses a hand-seeded license `GS-2CA70B15-2E0B9B5E` (`telegram-bot/scripts/onboarding-smoke.mjs:13`) — i.e. licenses are provisioned manually, not auto-minted on Polar payment.

**Bottom line:** the bot *works*, but the user journey "pay Polar → get told to /connect → send site creds" is broken at GAP A, and the payment→license→bot handshake is broken at GAP C, with no attribution at GAP B.

---

## 2. RECOMMENDED WIRING APPROACH

### 2a. Runtime: **polling — keep the existing dedicated bot process.** Do NOT move to webhook on `server.ts`.
- Already done + running (section 1a). The service + env + loop already exist and are green.
- Webhook on `server.ts` would be **lower-risk** long-term (no IP whitelist issues) but it's **net-new work** and touches the wrong backend (the bot depends on the legacy :8787 API, not repo `server.ts`). Polling already has a clean path (`getWebhookInfo.url=""`). Recommendation: **keep polling**, just fix the handlers + bridge.
- Correct mental model: the bot is a **thin polling client** for Telegram, talking to the **legacy backend** for licenses/sites/tasks. The repo `server.ts` is the **commercial/plugin** surface.

### 2b. Handlers to implement/repair (all in `/root/godseye-repo/telegram-bot/src/index.js`)

**`/start` (welcome + plan, exists at index.js:338-359) — already works.** Options:
- Keep the current `welcomeText()` (index.js:184-198) + `WELCOME_KYBD` (index.js:157-160). This is already solid and converts to the license wizard.
- The deep link `t.me/GodseyeXbot?start=connect` **is not special-cased** — `/start` only branches on `template_*` params (index.js:340-355); param `connect` falls through to the generic welcome. If DV wants `?start=connect` to jump straight to the connect wizard, add a branch: `if (param === "connect") { state.onboardingStep=2; return send(chatId, CONNECT_PROMPT, HAVE_LICENSE_KYBD); }`.

**`/connect` (the critical fix).** Decide which contract to honour (see §4 decision D1). Two options:

- **Option 1 (minimal, recommended):** Keep `/connect <license_key>` but **rewrite the email + spec copy + `/start` text** to tell users "send `/connect <YOUR_LICENSE_KEY>`", and drop the "site URL + WP app password" language. Smallest change, matches implemented code. The license key is the thing both backends already key on (`/api/licenses` + `/api/sites?licenseKey`).
- **Option 2 (full 3-field wizard):** Rework `/connect` to a stepwise state machine in `session(chatId)` (index.js:65-85): ask (1) site URL, (2) WP username, (3) Application Password — then forward to `POST /api/sites/connect`. **Problem:** the legacy `/api/sites/connect` (`server.ts:304-344`) only accepts `{licenseKey, siteUrl, siteName, bridgeUrl, pluginVersion, wpVersion}` — it has **no username/app-password fields**, and the executor never uses an app password. So Option 2 requires adding new backend fields/flow and does not match how tasks actually run. **Not recommended unless DV is consciously re-architecting WP auth.**

Recommendation: **Option 1** — align copy to the implemented license-key flow. A "wizard" can still be added cheaply by reusing the existing `onboardingStep===2` free-text GS-key branch (index.js:465-467).

**Map Telegram userId → Polar purchase (GAP B).** The existing model (repo `server.ts`):
- `/api/create-checkout` (server.ts:851) creates a `purchases` row + `metadata.tx_ref`.
- `/api/polar-webhook` (server.ts:938) marks paid and attributes by **email** (`customer_email` server.ts:952) + `tx_ref`.
- To map a Telegram user to their purchase, wire a **new step**: in `/connect`, after a valid license is found, capture `chatId`/`from.id` and store it on the **repo** backend so the plugin/webhook can attribute:
  - Add endpoint in repo `server.ts` e.g. `POST /api/telegram/link { telegramId, email }` that runs `UPDATE users SET telegram_id=? WHERE email=?` against the `users` table (column already exists, server.ts:302).
  - Then extend `/api/polar-webhook` to, after the paid branch (server.ts:948-1053), if the `purchases` row or `users` row has a `telegram_id`, fire a Telegram `sendMessage` to that chatId ("✅ Your GodsEye plan is active — send /start to connect your site"). This closes the loop from payment → Telegram activation.
  - Simplest trigger point: capture the Telegram chatId during `/connect` is too late (payment precedes connect). **Capture earlier: use the Polar `metadata` approach** — at checkout creation, if we know the user's telegramId (from a logged-in session or deep link `?start=`), include it in `metadata` (server.ts:949 reads `metadata.tx_ref`; add `metadata.telegram_id`). Store it on the `purchases` row at creation (see §2c step 1) and read it in the webhook.

### 2c. Bridge GAP C (payment → license)
There is **no automated** code that mints a legacy `GS-####` license on Polar payment. Two ways to close:
- **Cheap/manual (recommended for a 20-30 min first pass):** keep manual provisioning; the only bot-facing change needed is **Option 1 copy fix** so the user actually sends a license key that exists. Document the manual seed step in the runbook.
- **Proper (needs DV decision + more build):** in `/api/polar-webhook`'s paid branch (`server.ts:948`), `POST` to the legacy backend `/api/licenses` (`server.ts:235-245`) with the purchaser's name+email to mint a license, then email the license key alongside the download link. This is the real monetization bridge but touches both backends and needs a schema for which plan/credits map — defer unless DV wants it.

---

## 3. 6-STEP ORDERED BUILD LIST
> Scope claim: **everything in steps 1-5 is done or is a small copy edit.** Step 6 is the truth-test.

| # | Task | File(s) to touch | Env keys (add if missing) | Effort |
|---|------|------------------|---------------------------|--------|
| 1 | **Verify bot is live (read-only, already true today).** Confirm `systemctl status godseye-telegram-bot` is `active (running)`, getMe returns valid @GodseyeXbot, no webhook set. Do NOT restart unless something changed. | — | — | 2 min |
| 2 | **Fix the `/connect` copy** so users send a license key, not WP creds. Edit the Polar email text + HTML in `server.ts:1028-1042` to: "install the plugin zip, then message @GodseyeXbot and send `/connect <YOUR_LICENSE_KEY>`." Also add a `?start=connect` branch in `index.js:338-359` if DV wants the deep link to jump straight to the license wizard. Optional: soften `BOT-SPEC.md:124-135` + `MASTER-BUILD-MAP.md:109`. | `godseye-repo/server.ts` (:1028-1042); `godseye-repo/telegram-bot/src/index.js` (:338-359) | `APP_URL` already set | 10 min |
| 3 | **Add Telegram attribution** (GAP B): new repo endpoint `POST /api/telegram/link {telegramId,email}` → `UPDATE users SET telegram_id=? WHERE email=?`; and include `metadata.telegram_id` at checkout creation (`server.ts:886` Polar call body). | `godseye-repo/server.ts` (near :851 / :886) | none new | 20 min |
| 4 | **(Optional) Payment→license bridge** (GAP C): in `server.ts:948` paid branch, POST purchaser name+email to legacy `/api/licenses`, email the minted key. | `godseye-repo/server.ts` (:948); legacy `backend/src/server.ts:235` is the target | none new | 30-60 min |
| 5 | **Rebuild + redeploy** the repo backend: `cd /root/godseye-repo && npm run build` (dist/server.cjs is what PID 1047240 runs); restart that unit. The **bot service does NOT need a restart** unless you edited `index.js` (then `systemctl restart godseye-telegram-bot`). The **legacy backend** needs NO restart (unchanged). | build output + `systemctl` | — | 5 min |
| 6 | **Verify (see checklist below).** | — | — | 5 min |

**Service/port/process map DV must know:**
- `godseye-telegram-bot.service` → `node /root/godseye-repo/telegram-bot/src/index.js` (polling, no port).
- `godseye-backend.service` → `node /root/godseye/backend/src/index.ts` → listens `*:8787` → nginx `api.godseyes.digitalhustlerx.com` → what the bot calls.
- repo backend `dist/server.cjs` → listens `0.0.0.0:3000` (PID 1047240) — serve + Polar + plugin.
- `open-connector-connector-1` docker → `127.0.0.1:3002` — **NOT used by the Godseye bot**; it's DV's general accounts tool. The docs' "via openconnector/Composio" claim is not how @GodseyeXbot actually runs.
- `composio-mcp.service`, `telegram-mcp.service` → both `active` but are agent tooling, not the bot runtime.

---

## 4. DECISIONS DIGITAL VIKING MUST MAKE (open questions)

- **D1 — `/connect` contract.** Change the *copy* to match the implemented license-key flow (recommended, 10 min) vs. build a full 3-field WP-cred wizard that the backend/executor currently can't honor (30+ min, net-new WP-auth work). **You must pick one.**
- **D2 — Telegram purchase attribution.** Which trigger to use for linking `telegram_id` → purchase: submit it in Polar `metadata.telegram_id` at checkout (recommended) vs. a later `/connect`-time link. Needs DV to confirm users pay from a logged-in web session where telegramId is known, or accept the deep-link `?start=` param as the carrier.
- **D3 — Payment→license mint (GAP C).** Is there existing manual provisioning (the smoke test's `GS-2CA70B15` suggests yes)? If so, is DV OK keeping it manual for launch (recommended) or must Polar payment auto-mint a legacy license now?
- **D4 — where the bot process should run.** It already runs as systemd `godseye-telegram-bot` from `/root/godseye-repo/telegram-bot`. Confirm DV is fine with that path (SO of truth) and does **not** want it moved into Composio/openconnector. Current docs say openconnector but reality is the Node process — **decision needed on whether to just update the docs.**
- **D5 — token custody.** `/etc/godseye/telegram.env` holds the live token (rotated 13:54 today, `.bak.token` backup exists). Confirm this file stays the canonical source and is not committed.

---

## 5. VERIFICATION CHECKLIST (how to confirm after wiring)

1. **Service green:** `systemctl is-active godseye-telegram-bot` → `active`; `journalctl -u godseye-telegram-bot -n 20` shows a clean `Godseye Telegram bot polling started.` and **no** `Unauthorized` in the last hour.
2. **Token live:** `curl -s "https://api.telegram.org/bot$(grep TELEGRAM_BOT_TOKEN /etc/godseye/telegram.env|cut -d= -f2)/getMe"` → `"ok":true,"username":"GodseyeXbot"`.
3. **No webhook conflict:** `…/getWebhookInfo` → `"url":""`.
4. **Live `/start` reply:** open a DM with **@GodseyeXbot** → tap Start ≈ **`👁️ Welcome to Godseye.`** + the two-button keyboard (✨ Set up / 🔑 I have a license). This is the single most important test.
5. **Deep link:** tap `t.me/GodseyeXbot?start=connect` (if step 2 implemented) → jumps to the license-key prompt, not generic welcome.
6. **`/connect` round-trip:** send `/connect GS-2CA70B15-2E0B9B5E` → expect `✅ License connected (…plan). … Active site / run a demo task`. (This also re-verifies the legacy `:8787` API + bridge.)
7. **Backend reachability from bot:** confirm from the box `curl -s https://api.godseyes.digitalhustlerx.com/api/sites?licenseKey=GS-2CA70B15-2E0B9B5E\&active=true` returns `{"ok":true,"sites":[…]}`.
8. **Sending a natural message** after connect → bot plans a task (`/api/tasks/plan`), and if auto-approvable, executes via the WP bridge → returns a result message.
9. **Smoke test (read-only harness):** `cd /root/godseye-repo/telegram-bot && TELEGRAM_BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN /etc/godseye/telegram.env|cut -d= -f2) node scripts/onboarding-smoke.mjs` → expects `5/5 checks passed` (it stubs sendMessage, so it exercises the API only).

---

*End of BOT-WIRING-PLAN.md — ready to execute.*
