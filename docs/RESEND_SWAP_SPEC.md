# Godseye — Resend API Mail Swap — Integration Spec

**Status:** Ready to apply (prep-only; repo source NOT modified)
**Prepared by:** prep subagent
**Scope:** Swap the local Postfix SMTP sender (`src/lib/mailer.ts`) for the **Resend HTTP API** with zero call-site changes.
**Dependency policy:** NO new npm packages. Uses Node 18+ **global `fetch`** only. No nodemailer, no resend SDK.

---

## 0. Why this spec exists

Godseye currently sends all email through a dependency-free plain-SMTP client in
`src/lib/mailer.ts` that talks to local Postfix on `127.0.0.1:25` as
`noreply@godseye.digitalhustlerx.com`. Sending through local Postfix from a datacenter
IP does not reliably land in inboxes (SPF/DKIM/DMARC + reputation).

The plan is to route sends through the **Resend API** (`POST https://api.resend.com/emails`)
for reliable delivery. This doc is a ready-to-apply patch spec so the swap is ~5 minutes
when the user supplies a **full-access Resend API key** and confirms the sending domain.

> **Fallback policy — IMPORTANT:** This project deliberately does **NOT** fall back to
> Postfix when Resend is unavailable. If `RESEND_API_KEY` is missing at runtime, the mailer
> logs and returns `{ ok: false, error: "resend-key-missing" }`. No silent spam-path through
> local Postfix. Callers already handle `ok:false` gracefully (see §1).

---

## 1. Every `sendMail` call-site and how the swap affects each

Grep of the repo found **two live call sites** (plus two import lines). Both call `sendMail(opts)`
with a **single argument** and rely on the default host/port — so a drop-in `sendMail(opts)`
replacement requires **no call-site edits at all**.

### 1.1 `server.ts` line 9 — import
```ts
import { sendMail } from "./src/lib/mailer.js";
```
- **Effect:** unchanged (import of an ESM `.js`-mapped TS module). Keep as-is.

### 1.2 `server.ts` lines 978–983 — Polar payment webhook ("pay-before-download")
```ts
sendMail({
  to: showEmail,
  subject: `Your GodsEye plugin download — ${purchase.plan_name}`,
  text,
  html,
}).then((r) => console.log(`[Polar] download email to ${showEmail}:`, r.ok ? `ok${r.size ? ` (${r.size}B)` : ""}` : r.error));
```
This fires on a **confirmed successful charge** and emails the buyer their one-time plugin
download link. It awaits nothing (fire-and-forget `.then`), so the webhook response is not
blocked on mail delivery.

- **Effect of swap:** zero code change here. The new `sendMail` is still async and still returns
  `{ ok, error?, size? }`, so the `.then` logging keeps working. The `size` value now reflects the
  **length of the request body** (approximately the HTTP payload), not SMTP raw bytes — cosmetic only.
- **Behavioral note:** if the key is missing, this returns `{ ok:false, error:"resend-key-missing" }`
  and the console logs `[Polar] download email to x: resend-key-missing`. The webhook still returns
  `200 { received:true }`; the buyer is NOT emailed. This is the intended fail-safe (a missing key is
  an operator error, not a spam path). The console line makes it obvious.

### 1.3 `src/lib/drip.ts` line 24 — import
```ts
import { sendMail, type MailOptions } from "./mailer.js";
```
- **Effect:** unchanged. `MailOptions` type is still exported by the new mailer.

### 1.4 `src/lib/drip.ts` lines 534–551 — drip worker (waitlist → paid lifecycle emails)
```ts
const mail: MailOptions = { to: job.email, subject: def.subject, text: def.buildText(ctx), html: def.buildHtml(ctx) };
const result = await sendMail(mail);
if (result.ok) { ...mark sent... } else { ...increment attempts, store last_error, leave pending... }
```
This is the scheduled drip engine that sends onboarding/paid emails to waitlist users. It **relies on
`result.ok` and `result.error`** to decide sent-vs-retry.

- **Effect of swap:** zero code change here. The `MailOptions` shape (`to`, `subject`, `text`, `html`)
  is identical. On `ok:false` the drip worker stores `result.error` (e.g. `resend-key-missing`) in
  `last_error` and retries per its existing policy — same as today when Postfix returned any error.
- **Behavioral note:** a missing key will surface as visible `[GOD-15] send failed ... resend-key-missing`
  logs instead of silent Postfix sends. Desired.

### 1.5 `src/components/WaitlistModal.tsx` — email capture (NOT a sendMail call site)
The modal POSTs `{ email, referredBy? }` to `/api/waitlist` (line 56). It never calls `sendMail`
directly. New waitlist emails are later delivered by the drip engine in `drip.ts` (§1.4), server-side.
So **the Resend swap does not touch this component** — the capture flow is unchanged. Noted here so nobody
hunts for a hidden sendMail in the React layer.

---

## 2. Drop-in replacement design for `src/lib/mailer.ts`

Keeps the existing (**exported**) surface so call-sites compile and run with no edits:

- `export type MailResult = { ok: boolean; error?: string; size?: number }`
- `export interface MailOptions { from?; fromName?; to; subject; text; html? }`
- `export async function sendMail(opts): Promise<MailResult>`

The current second/third params `(host = "127.0.0.1", port = 25)` are **only ever used by the SMTP
path internally**; no call site passes them, so they can be **dropped** from the new signature. Keep the
signature as `sendMail(opts: MailOptions)` for a clean drop-in.

### 2.1 Full replacement file (paste over `src/lib/mailer.ts`)

```ts
// Resend API mailer — dependency-free, uses global fetch (Node 18+).
// NO fallback to Postfix. If RESEND_API_KEY is missing we fail loudly and return
// { ok:false, error:"resend-key-missing" } rather than silently spam local Postfix.
export type MailResult = { ok: boolean; error?: string; size?: number };

export interface MailOptions {
  from?: string;
  fromName?: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const DEFAULT_FROM = "Godseye <noreply@godseye.digitalhustlerx.com>";
const RESEND_URL = "https://api.resend.com/emails";

function sanitize(val: string): string {
  return String(val || "").replace(/[\r\n]+/g, " ").trim();
}

export async function sendMail(opts: MailOptions): Promise<MailResult> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.to)) {
    return { ok: false, error: "Invalid recipient email" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[mailer] RESEND_API_KEY is not set — refusing to send via Postfix fallback");
    return { ok: false, error: "resend-key-missing" };
  }

  const from = sanitize(
    opts.from && opts.fromName
      ? `${opts.fromName} <${opts.from}>`
      : opts.from && !opts.fromName
        ? opts.from
        : DEFAULT_FROM
  );

  const payload = {
    from,
    to: sanitize(opts.to),
    subject: sanitize(opts.subject),
    text: String(opts.text || ""),
    // Only attach html when provided, to keep the payload clean.
    ...(opts.html ? { html: String(opts.html) } : {}),
  };

  const body = JSON.stringify(payload);

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error(`[mailer] Resend rejected ${res.status}: ${raw}`);
      return { ok: false, error: `resend-api-error-${res.status}` };
    }

    return { ok: true, size: Buffer.byteLength(body, "utf8") };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[mailer] Resend send failed: ${msg}`);
    return { ok: false, error: `resend-network-error: ${msg}` };
  }
}
```

### 2.2 Design notes / decisions

- **Signature preserved:** `sendMail(opts: MailOptions): Promise<MailResult>` — identical export,
  so `server.ts` (import + call + `.then` on result) and `drip.ts` (import + `await` + `ok`/`error` branch)
  compile and run with **zero edits**.
- **`MailOptions` preserved exactly** (`from?`, `fromName?`, `to`, `subject`, `text`, `html?`) — `drip.ts`
  builds `MailOptions` literals that still type-check.
- **Default from is unchanged:** `Godseye <noreply@godseye.digitalhustlerx.com>` — matches the old
  `DEFAULT_FROM` and keeps the from-address stable during the rollover.
- **Header injection defense kept:** the same `sanitize()` strips CR/LF on `to`, `from`, `fromName`,
  `subject`. Resend parses JSON (not raw MIME) so injection risk is already low, but keep the hygiene.
- **No Postfix fallback:** missing key ⇒ console.error + `{ ok:false, error:"resend-key-missing" }`.
  This is intentional — never silently route to local Postfix.
- **Error taxonomy for observability:** `resend-key-missing`, `resend-api-error-<status>`,
  `resend-network-error: <msg>`. Both call sites already log `r.error`, so operators see these in stdout.
- **`size` semantics change (cosmetic):** now reports JSON request-body byte length, not SMTP bytes.
  Only used in the `[Polar]` success log line. Fine to leave; no logic depends on it.
- **Node version gate:** relies on global `fetch` (stable in Node 18+). Confirmed compatible with the
  existing Node server runtime. If the server ever runs Node <18, this would need `undici` — out of scope.

---

## 3. Environment variables to add

Add these to `.env` (and, when the deploy path uses one, the production env / process manager config):

| Variable | Value | Notes |
|----------|-------|-------|
| `RESEND_API_KEY` | `re_...` (full-access key) | Read from `process.env.RESEND_API_KEY` at send time. Must be full-access so the API accepts sends. |

The read is done **lazily inside `sendMail`** (not at module load), so the server doesn't need a restart
ordering trick — just add the key and restart the process once for it to take effect.

> No other keys are added. The existing `.env` keys (`DRIP_ADMIN_KEY`, `FLW_SECRET_KEY`,
> `FLW_WEBHOOK_HASH`, `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_WEBHOOK_URL`)
> are unrelated and untouched.
>
> Also optionally add the same `RESEND_API_KEY="re_..."` line to `.env.example` (commented placeholder)
> so future devs know it's required — a nice-to-have, not required for the swap.

### 3.1 Pre-requisite (operator, before swap turns on)
Resend must have the sending domain **DNS-verified** (SPF/DKIM/DMARC records) for
`godseye.digitalhustlerx.com` (or whichever domain hosts the `noreply@` address), and a Resend
**verified sender** with that address. Until then, real inbox delivery is unreliable; the swap spec
is safe either way because failure is explicit, not silent.

---

## 4. 3-step apply checklist

**Step 1 — Test in isolation (staging/sandbox).**
1. Add `RESEND_API_KEY` to `.env` (full-access key).
2. Replace `src/lib/mailer.ts` with the file in §2.1 (commit independently, not with other changes).
3. Sanity check: `npx tsc --noEmit` or `npm run build` — confirm no type errors in `server.ts`/`drip.ts`.
4. Optional quick reftest: run a one-liner `node -e` that imports `sendMail` and sends to a test inbox,
   confirming `{ ok:true }`. If key missing, confirm `{ ok:false, error:"resend-key-missing" }`.

**Step 2 — Test the no-key fail-safe.**
5. Temporarily rename/blank `RESEND_API_KEY` and trigger a payment webhook + a drip enqueue.
   Confirm logs show `resend-key-missing` and **no** email went out via Postfix. Restore the key.

**Step 3 — Deploy + verify live.**
6. Rebuild if `dist/` bundles the server (`npm run build`), restart the Node/PM2/systemd service so the
   new `server.cjs` and `.env` take effect, then trigger one real purchase webhook and one drip send.
   Confirm successful Resend `201` (log shows download email `ok`) and that the buyer receives the email.
   If a key is missing, you will see `resend-key-missing` in logs — fix the env, restart, re-test.

**Rollback:** restore `src/lib/mailer.ts` from git (`git checkout -- src/lib/mailer.ts src/lib/mailer.js`)
and rebuild — Reverts to the old Postfix path instantly. There is no schema or data migration.

---

## 5. Files touched by this swap (when applied)

| File | Change |
|------|--------|
| `src/lib/mailer.ts` | **Rewritten** to Resend API (upload file from §2.1). |
| `.env` | Add `RESEND_API_KEY`. |
| `.env.example` *(optional)* | Add documented `RESEND_API_KEY` placeholder. |
| `server.ts`, `drip.ts`, `WaitlistModal.tsx` | **No changes** — drop-in preserves the `sendMail(opts)` surface. |
| `package.json` | **No changes** — no npm deps (global `fetch` only). |

*End of spec.*
