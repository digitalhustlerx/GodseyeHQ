# Godseye — Payment → Customer-Logic Integration Spec (Build-Ready)

**Author:** subagent audit · **Date:** 2026-08-06 · **Status:** ANALYSIS ONLY — no code changed.
**Repo:** `/root/godseye-repo/` (source of truth). Live: https://godseye.digitalhustlerx.com
**Companion doc already in-repo:** `marketing-fleet/agents/BOT-WIRING-PLAN.md` (has the same GAP-B analysis; align with it).

---

## Section A — Current flow (what exists on payment)

1. **Store = local SQLite, NOT Supabase.** `server.ts:5,23-26` opens `better-sqlite3` at **`data/godseye.db`** (WAL). Supabase is only an un-applied migration file (`supabase-migration-godseyehq.sql`) — nothing wires it. `WaitlistModal.tsx:56-79` talks to the local `/api/waitlist` route via `fetch`, not Supabase.
2. **Checkout intent:** `POST /api/create-checkout` (`server.ts:851-932`) calls Polar `api.polar.sh/v1/checkouts/` (`server.ts:886`) with `metadata = { plan_id, plan_name, tx_ref }` (`server.ts:896`) and inserts a `purchases` row with `status='pending'` + a 7-day `download_token` (`server.ts:916-919`).
3. **Confirm:** `POST /api/polar-webhook` (`server.ts:938-1056`). On `checkout.completed|order.created` & not-failed (`isPaid`, `server.ts:944-946`) it: flips `purchases` to `status='paid'` (`:962`), **activates the plan** for a matching `users` row by email + starts a 7/30-day `plan_expires_at` window + sets `credits_remaining` (`:967-981`), writes back waitlist→paid conversion (`:983-1001`), credits the referrer (`:1008-1023`), and **emails** the buyer the plugin download link via `sendMail` (`:1025-1048`).
4. **So buys are already marked paid + plan activated in the SQLite `users` table.** What is MISSING: **any Telegram notification** — to the owner (GodseyeHQ) or to the buyer. `server.ts` has **zero** `sendMessage`/`chat_id`/`api.telegram.org` code (grep = empty). The only buyer touch is the email; the owner sees nothing but the console line `[Polar] Payment confirmed…` (`:1050`).
5. **User-profile store exists:** `users` table (`server.ts:293-305`) already has the columns we want — `telegram_id TEXT` at **line 302**, plus `plan/plan_id/credits_remaining/plan_expires_at`. **Nothing ever writes `telegram_id`** (grep = only the column def + unrelated mock `/api/balance/:telegramId` at `server.ts:794-814` which uses a hardcoded demo map). Payment attribution is keyed by **email** (`:952`) + `metadata.tx_ref`→`purchases` (`:956`). No telegram-ID→user link exists.

---

## Section B — THE 1 CHEAP WIN (visible revenue signal TODAY)

**What:** When the Polar webhook marks a charge paid, alert the GodseyeHQ sales/business Telegram topic + message the buyer. Ship the owner alert first — that's the "revenue lands visibly" signal DV wants most.

### Where the send capability actually lives
The repo backend webhook has NO Telegram ability. The bot process does. Two options:

**Option B1 (RECOMMENDED — zero new infra, pure HTTP):** In `server.ts`'s paid branch, call Telegram's Bot API **directly** over `fetch` — same as the bot does. The bot token is already in the process environment: `/proc/<pid>/environ` for the bot has `TELEGRAM_BOT_TOKEN` and **`POLAR_ACCESS_TOKEN`** (per BOT-WIRING-PLAN.md:28), and it's sourced from `/etc/godseye/telegram.env`. Add `TELEGRAM_BOT_TOKEN` to the repo backend's env (or reuse the same env file) so the webhook can `fetch("https://api.telegram.org/bot<TOKEN>/sendMessage", {chat_id, text})`.

- **File:** `server.ts`
- **Function/router:** inside `app.post("/api/polar-webhook", …)` — add right after the buy confirmation, e.g. after the waitlist write-back / email block, before `res.json({ received:true })` (`server.ts:1025-1055`). Good anchor: just after line **1023** (referral attribution done) or after `:1048` (email sent).
- **Pseudo-code to add:**
  ```ts
  // GODSEYE-PAY-ALERT: notify owner topic + buyer chat on confirmed payment.
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const ownerChat = "-1004450820767";          // GodseyeHQ forum supergroup
  const ownerThread = 463;                      // 💰 Pricing & Credits topic
  const buyerChat = /* use telegram_id if we know it (Section C) */;
  if (tgToken) {
    const lines = [
      `💰 Payment received — ${purchase.plan_name} (${metadata.plan_id})`,
      `Amount: $${purchase.amount_usd} · tx: ${txRef}`,
      `Customer: ${email || purchase.email}`,
      `↗ admin: ${APP_URL}/dashboard  (plan activated in users table)`,
    ];
    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: ownerChat, message_thread_id: ownerThread, text: lines.join("\n") }),
    }).then(r => r.json()).then(d => console.log("[Godseye-Pay-Alert] owner:", d.ok));
  }
  ```
- **Credentials it needs:** `TELEGRAM_BOT_TOKEN` in the repo backend env (must be the SAME bot token that has access to `-1004450820767` — the existing @GodseyeXbot token does, per AGENTS.md).
- **Exact target IDs:** chat `-1004450820767`; topic thread `463` (💰 Pricing & Credits — the sales/revenue topic per AGENTS.md). Send `message_thread_id: 463` to hit the topic, or omit it to hit the general group.
- **Note:** forum sendMessage needs `message_thread_id` only when the chat has topics enabled; if it returns `400 Bad Request: message is not modified / thread not found`, drop the thread param.
- **~Time to ship: ~15–30 min** (add ~20 lines, set one env var, rebuild, restart).

### Why not use the bot process for this
The bot is a long-poller gated on Telegram message events; wiring it to also watch the SQLite `purchases`/`users` table for `status='paid'` is possible but more moving parts. Direct HTTP from the verified webhook is the smallest, most reliable increment and doesn't touch the running bot. (Buyer DM can be added in the same edit if `telegram_id` is known — see Section C.)

---

## Section C — The foundation (Telegram-ID → user profile store)

**What it is:** the `users` table is already the per-user profile store (SQLite, keyed by `email`); it just needs the `telegram_id` column **populated** and the webhook keyed off it. No new table needed for v1.

### Requirements
A row per user keyed by email, carrying `telegram_id`, `plan`, `plan_id`, `credits_remaining`, `plan_expires_at`. This already exists (`server.ts:293-305`). The 3 missing pieces:

1. **Capture `telegram_id` when the user pays** — the cleanest carrier is Polar `metadata`. At checkout creation (`server.ts:851-919`), the client hits `POST /api/create-checkout` — accept an optional `telegramId` field (or deep-link `?start=`/session) and:
   - add `metadata.telegram_id` to the Polar call body at `server.ts:896`, **and**
   - add a `telegram_id` column to `purchases` (migration pattern already used for `referrer_token` at `server.ts:339-342`), storing it at insert (`:917-919`).
2. **Read it in the webhook:** in the paid branch, after `:952`, pull `meta.telegram_id` (or `purchase.telegram_id`/`users.telegram_id`), then (a) `UPDATE users SET telegram_id=? WHERE email=?` and (b) use it as the `buyerChat` in the Section-B buy-DM.
3. **Optional link endpoint** (post-hoc attribution for users who paid before talking to the bot): `POST /api/telegram/link { telegramId, email }` → `UPDATE users SET telegram_id=? WHERE email=?` (column at `server.ts:302`; bot `/connect` at `telegram-bot/src/index.js:361-398` can fire it after a successful license match).

### Where it goes
- New schema/columns + migrations: **top of `server.ts`** next to the existing `users`/`purchases` DDL (`server.ts:293-342`).
- Read/write logic: the paid branch of the webhook (`server.ts:948-1053`).
- Client flag: `src/pages/*` / checkout caller that hits `/api/create-checkout` (grep `create-checkout`) — pass `telegramId` when the user session knows it.

### Gotcha
The webhook attributes by **email**, and Telegram chat/user IDs come from the bot conversation. You must bridge email↔telegram_id — either the `metadata.telegram_id` carrier at checkout (preferred, if the site knows the ID) or the `/api/telegram/link` endpoint (backfill). Do NOT assume a Telegram user has a logged-in web session at checkout; confirm the carrier with DV. (~30–60 min)

---

## Section D — Gotchas / Security

1. **Polar API key IS in git history (leaked).** Commit `ad731c3` (2026-08-04) "Remove polar-config.json from git (live API key was tracked…)" **deleted the file going forward**, and it is in `.gitignore` + untracked now (`git status --short polar-config.json` = clean). BUT the key **still exists in prior commits / full history** (`git log --all -- polar-config.json` shows `ad731c3` + `31e6d32`). Anyone with repo history access has it. `polar-config.json` (file mode `-rw-------`, on disk) holds the key. **Action: rotate the Polar secret**, and if the repo is ever public-pushed, history must be purged (`git filter-repo`) — currently the remote is private GitHub. Do NOT echo key values anywhere.
2. **No webhook signature verification.** `/api/polar-webhook` (`server.ts:938-1056`) trusts `req.body` — it only checks event type + `data.status != "failed"`, never a Polar `webhook-secret` HMAC. Anyone who can POST to this route can mark `purchases` rows paid / activate plans / trigger the alert spam. Bare minimum before shipping: verify a shared secret (Polar webhook secret header) and/or PIN the alert topic. (Med-hardening, but cheap — do it in the same build.)
3. **`POLAR_ACCESS_TOKEN` is in the RUNTIME env of the webhook & bot** — that's expected, but it must stay out of git; the env file `/etc/godseye/telegram.env` (rotated today, per BOT-WIRING-PLAN.md) is the canonical source. `POLAR_ACCESS_TOKEN` is read from `process.env` at `server.ts:868`.
4. **Rebuild requirement:** nginx serves `dist/` statically; the Express backend runs `dist/server.cjs` from `npm run build`. Any `server.ts` change requires `npm run build` + restarting the repo backend unit. The **bot service doesn't need restart** for a `server.ts`-only change.
5. **`/connect` contract mismatch (pre-existing, will bite buyer DM copy):** the Polar email tells buyers to `/connect` with site URL + WP user + app password (`server.ts:1033,1041`), but the bot's `/connect` actually expects a **license key** (`telegram-bot/src/index.js:361-398`). If you DM buyers on payment, keep the /connect instruction aligned to the license-key flow (see BOT-WIRING-PLAN.md §2b). Not a blocker for the alert itself.
6. **Webhook listens for `order.created` too** (`:945`) — confirm Polar's live payloads use `checkout.completed` with `metadata` intact; test with a real sandbox order before trusting `message_thread_id`/topic behaviour, since a mis-typed forum send can 400.

---

## Build order (when DV says "GO")
1. **B1 owner alert** (Section B) + rotate/re-redact Polar key (D1) — ~30 min → visible revenue TODAY.
2. Add Polar webhook secret verification (D2) — ~20 min.
3. **C foundation:** `telegram_id` in `purchases` + `metadata.telegram_id` carrier + buyer-DM reuse of Section B send — ~45 min.
4. (Optional) `/api/telegram/link` + `/plans` command returning Polar direct links (reuse `POLAR_PRODUCT_IDS` + `PLAN_PRICES`, `server.ts:822-839`).
